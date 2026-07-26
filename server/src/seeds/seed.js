const mongoose = require('mongoose');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../../.env') });

const User = require('../models/User');
const Scholarship = require('../models/Scholarship');
const Application = require('../models/Application');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/scholarhive';

const RESTORE_APP_ID = '6a64f82168ab271b1ea9038d';
const RESTORE_APP_DIR = path.join(
  __dirname,
  '../../uploads/afriror/applications',
  RESTORE_APP_ID
);

/** Demo / mock accounts that should never appear in analytics. */
const MOCK_EMAILS = [
  'student@scholarhive.com',
  'maria@scholarhive.com',
  'provider@scholarhive.com',
  'techfuture@scholarhive.com',
];

const adminUser = {
  name: 'Admin User',
  email: 'admin@afriroar.com',
  password: 'admin@123',
  role: 'admin',
  isEmailVerified: true,
  profile: {
    country: 'United States',
    bio: 'Platform administrator',
  },
};

const registeredStudent = {
  name: 'Ruiping Ding',
  email: 'ruipingding720@gmail.com',
  password: 'Student@123456',
  role: 'student',
  isEmailVerified: true,
  profile: {
    bio: 'Registered student account',
  },
};

const upsertUser = async (userData, { resetPassword = true } = {}) => {
  const email = userData.email.toLowerCase();
  let user = await User.findOne({ email }).select('+password');
  if (user) {
    user.name = userData.name;
    user.role = userData.role;
    user.isEmailVerified = true;
    user.isDeleted = false;
    user.isSuspended = false;
    if (resetPassword) {
      user.password = userData.password;
    }
    if (userData.profile) {
      user.profile = {
        ...(user.profile?.toObject?.() ?? user.profile ?? {}),
        ...userData.profile,
      };
    }
    await user.save();
    return { email, action: 'updated' };
  }
  await User.create(userData);
  return { email, action: 'created' };
};

const removeMockUsers = async () => {
  const result = await User.deleteMany({
    email: { $in: MOCK_EMAILS.map((e) => e.toLowerCase()) },
  });
  return result.deletedCount || 0;
};

const restoreRegisteredApplication = async () => {
  const student = await User.findOne({ email: 'ruipingding720@gmail.com' });
  if (!student) return { action: 'skipped', reason: 'student missing' };

  const scholarship = await Scholarship.findOne({
    slug: 'shanghai-jiao-tong-university-scholarships-2027',
    isDeleted: { $ne: true },
  });
  if (!scholarship) return { action: 'skipped', reason: 'scholarship missing' };

  if (!fs.existsSync(RESTORE_APP_DIR)) {
    return { action: 'skipped', reason: 'upload folder missing' };
  }

  const files = fs.readdirSync(RESTORE_APP_DIR).filter((f) => f.endsWith('.pdf'));
  const documents = files.map((filename) => {
    const full = path.join(RESTORE_APP_DIR, filename);
    const stat = fs.statSync(full);
    return {
      name: filename,
      url: `/uploads/afriror/applications/${RESTORE_APP_ID}/${filename}`,
      publicId: `afriror/applications/${RESTORE_APP_ID}/${filename.replace(/\.pdf$/, '')}`,
      fileType: 'application/pdf',
      fileSize: stat.size,
      uploadedAt: stat.mtime,
    };
  });

  const profile = student.profile || {};
  const appId = new mongoose.Types.ObjectId(RESTORE_APP_ID);
  const submittedAt = new Date('2026-07-25T17:57:00.000Z');
  const payload = {
    _id: appId,
    userId: student._id,
    scholarshipId: scholarship._id,
    status: 'submitted',
    currentStep: 5,
    personalStatement: '',
    motivation: '',
    submittedAt,
    lastSavedAt: submittedAt,
    documents,
    isDeleted: false,
    steps: [
      {
        stepNumber: 1,
        title: 'Personal Information',
        completed: true,
        completedAt: submittedAt,
        data: {
          fullName: student.name,
          phone: profile.phone || '',
          country: profile.country || '',
          dateOfBirth: profile.dateOfBirth || '',
          address: '',
          nationality: profile.country || '',
        },
      },
      {
        stepNumber: 2,
        title: 'Academic Background',
        completed: true,
        completedAt: submittedAt,
        data: {
          educationLevel: profile.educationLevel || '',
          institution: profile.institution || '',
          fieldOfStudy: profile.fieldOfStudy || '',
          gpa: profile.gpa || '',
          graduationYear: '',
          languages: Array.isArray(profile.languages) ? profile.languages.join(', ') : '',
        },
      },
      {
        stepNumber: 3,
        title: 'Statement & Motivation',
        completed: true,
        completedAt: submittedAt,
        data: { personalStatement: '', motivation: '' },
      },
      {
        stepNumber: 4,
        title: 'Documents',
        completed: true,
        completedAt: submittedAt,
        data: { documentCount: documents.length },
      },
      {
        stepNumber: 5,
        title: 'Review & Submit',
        completed: true,
        completedAt: submittedAt,
        data: {},
      },
    ],
  };

  const existing = await Application.findById(appId);
  if (existing) {
    Object.assign(existing, payload);
    await existing.save();
  } else {
    await mongoose.connection.db.collection('applications').insertOne({
      ...payload,
      createdAt: new Date('2026-07-25T17:56:00.000Z'),
      updatedAt: new Date(),
      __v: 0,
    });
  }

  await Scholarship.updateOne(
    { _id: scholarship._id },
    { $set: { applicationCount: Math.max(scholarship.applicationCount || 0, 1) } }
  );

  return {
    action: existing ? 'updated' : 'created',
    email: student.email,
    docs: documents.length,
  };
};

const seed = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    const removed = await removeMockUsers();
    console.log(`Removed mock accounts: ${removed}`);

    const adminResult = await upsertUser(adminUser, { resetPassword: true });
    const studentResult = await upsertUser(registeredStudent, { resetPassword: false });
    console.log(`Accounts: ${adminResult.email} (${adminResult.action}), ${studentResult.email} (${studentResult.action})`);

    const restoredApp = await restoreRegisteredApplication();
    console.log(`Registered application restore: ${JSON.stringify(restoredApp)}`);

    const studentCount = await User.countDocuments({ role: 'student', isDeleted: { $ne: true } });
    const totalUsers = await User.countDocuments({ isDeleted: { $ne: true } });

    console.log(`Users in DB: ${totalUsers} total, ${studentCount} students`);
    console.log('\n--- Accounts ---');
    console.log('Admin:   admin@afriroar.com / admin@123');
    console.log('Student: ruipingding720@gmail.com (real registration)');
    console.log('\nSeed complete! ✅');

    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
};

seed();
