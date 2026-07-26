const Application = require('../models/Application');
const Scholarship = require('../models/Scholarship');
const User = require('../models/User');
const Notification = require('../models/Notification');
const { NotFoundError, BadRequestError, ForbiddenError, ConflictError } = require('../utils/errors');
const { sendEmail, templates } = require('../utils/email');
const { createAuditLog } = require('../utils/auditLog');

const FREE_APPLICATION_LIMIT = 5;

const createApplication = async (data, userId, req) => {
  const { scholarshipId } = data;

  // Check scholarship exists and is approved
  const scholarship = await Scholarship.findById(scholarshipId);
  if (!scholarship || scholarship.status !== 'approved') {
    throw new NotFoundError('Scholarship not found or not available.');
  }

  // Check deadline
  if (scholarship.deadline < new Date()) {
    throw new BadRequestError('This scholarship deadline has passed.');
  }

  // Check duplicate
  const existing = await Application.findOne({ userId, scholarshipId });
  if (existing) {
    throw new ConflictError('You have already applied to this scholarship.');
  }

  // Check free user limit
  const user = await User.findById(userId);
  if (!user.isPremium && user.role !== 'admin') {
    const applicationCount = await Application.countDocuments({
      userId,
      status: { $ne: 'draft' },
    });
    if (applicationCount >= FREE_APPLICATION_LIMIT) {
      throw new ForbiddenError(
        `Free accounts can submit up to ${FREE_APPLICATION_LIMIT} applications. Upgrade to Premium for unlimited applications.`
      );
    }
  }

  // Create with default steps
  const application = await Application.create({
    userId,
    scholarshipId,
    personalStatement: data.personalStatement,
    motivation: data.motivation,
    steps: data.steps || [
      { stepNumber: 1, title: 'Personal Information', data: {}, completed: false },
      { stepNumber: 2, title: 'Academic Background', data: {}, completed: false },
      { stepNumber: 3, title: 'Statement & Motivation', data: {}, completed: false },
      { stepNumber: 4, title: 'Documents', data: {}, completed: false },
      { stepNumber: 5, title: 'Review & Submit', data: {}, completed: false },
    ],
  });

  await createAuditLog({
    action: 'application.create',
    userId,
    targetId: application._id,
    targetModel: 'Application',
    metadata: { scholarshipId, scholarshipTitle: scholarship.title },
    req,
  });

  return application;
};

const getApplications = async (userId, queryString) => {
  const page = parseInt(queryString.page, 10) || 1;
  const limit = parseInt(queryString.limit, 10) || 10;
  const skip = (page - 1) * limit;

  const filter = { userId };
  if (queryString.status) filter.status = queryString.status;

  const [applications, total] = await Promise.all([
    Application.find(filter)
      .populate('scholarshipId', 'title country level deadline slug coverImage')
      .sort('-updatedAt')
      .skip(skip)
      .limit(limit),
    Application.countDocuments(filter),
  ]);

  return {
    applications,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  };
};

const getApplicationById = async (id, userId, options = {}) => {
  const application = await Application.findById(id)
    .populate('scholarshipId')
    .populate('userId', 'name email profile role');

  if (!application) {
    throw new NotFoundError('Application not found.');
  }

  if (options.role === 'admin') {
    return application;
  }

  // Ensure user owns the application or is the scholarship provider
  const ownerId = application.userId?._id?.toString?.() || application.userId?.toString?.();
  if (ownerId !== userId.toString()) {
    const scholarship =
      application.scholarshipId?.providerId != null
        ? application.scholarshipId
        : await Scholarship.findById(application.scholarshipId);
    if (!scholarship || scholarship.providerId.toString() !== userId.toString()) {
      throw new ForbiddenError('You do not have access to this application.');
    }
  }

  return application;
};

const updateApplication = async (id, data, userId, req) => {
  const application = await Application.findById(id);

  if (!application) {
    throw new NotFoundError('Application not found.');
  }

  if (application.userId.toString() !== userId.toString()) {
    throw new ForbiddenError('You can only update your own applications.');
  }

  if (['submitted', 'accepted', 'rejected'].includes(application.status)) {
    throw new BadRequestError('Cannot update a submitted application.');
  }

  // Update steps, statement, etc.
  if (data.steps) application.steps = data.steps;
  if (data.currentStep) application.currentStep = data.currentStep;
  if (data.personalStatement !== undefined) application.personalStatement = data.personalStatement;
  if (data.motivation !== undefined) application.motivation = data.motivation;
  if (data.documents) application.documents = data.documents;
  application.lastSavedAt = new Date();

  await application.save();

  return application;
};

const submitApplication = async (id, userId, req) => {
  const application = await Application.findById(id).populate('scholarshipId', 'title');

  if (!application) {
    throw new NotFoundError('Application not found.');
  }

  if (application.userId.toString() !== userId.toString()) {
    throw new ForbiddenError('You can only submit your own applications.');
  }

  if (application.status !== 'draft') {
    throw new BadRequestError('Application has already been submitted.');
  }

  // Freeze a profile snapshot on the application so admin can always see what was submitted.
  const user = await User.findById(userId);
  const profile = user?.profile || {};
  const personalStep = application.steps?.find((s) => s.stepNumber === 1);
  if (personalStep) {
    const existing = personalStep.data || {};
    personalStep.data = {
      fullName: existing.fullName || user?.name || '',
      phone: existing.phone || profile.phone || '',
      country: existing.country || profile.country || '',
      dateOfBirth: existing.dateOfBirth || profile.dateOfBirth || '',
      address: existing.address || '',
      nationality: existing.nationality || profile.country || '',
    };
    personalStep.completed = true;
    personalStep.completedAt = personalStep.completedAt || new Date();
  }
  const academicStep = application.steps?.find((s) => s.stepNumber === 2);
  if (academicStep) {
    const existing = academicStep.data || {};
    academicStep.data = {
      educationLevel: existing.educationLevel || profile.educationLevel || '',
      institution: existing.institution || profile.institution || '',
      fieldOfStudy: existing.fieldOfStudy || profile.fieldOfStudy || '',
      gpa: existing.gpa || profile.gpa || '',
      graduationYear: existing.graduationYear || '',
      languages:
        existing.languages ||
        (Array.isArray(profile.languages) ? profile.languages.join(', ') : profile.languages || ''),
    };
    academicStep.completed = true;
    academicStep.completedAt = academicStep.completedAt || new Date();
  }

  application.status = 'submitted';
  application.submittedAt = new Date();
  await application.save();

  // Update scholarship application count
  await Scholarship.findByIdAndUpdate(application.scholarshipId._id, {
    $inc: { applicationCount: 1 },
  });

  // Send email notification
  const emailTemplate = templates.applicationSubmitted(user.name, application.scholarshipId.title);
  sendEmail({ to: user.email, ...emailTemplate });

  // Create in-app notification
  await Notification.create({
    userId,
    type: 'application_submitted',
    title: 'Application Submitted',
    message: `Your application for "${application.scholarshipId.title}" has been submitted successfully.`,
    link: `/dashboard/applications/${application._id}`,
  });

  await createAuditLog({
    action: 'application.submit',
    userId,
    targetId: application._id,
    targetModel: 'Application',
    metadata: { scholarshipTitle: application.scholarshipId.title },
    req,
  });

  return application;
};

const updateApplicationStatus = async (id, status, feedback, reviewerId, req) => {
  const application = await Application.findById(id)
    .populate('scholarshipId', 'title')
    .populate('userId', 'name email');

  if (!application) {
    throw new NotFoundError('Application not found.');
  }

  application.status = status;
  application.feedback = feedback;
  application.reviewedBy = reviewerId;
  application.reviewedAt = new Date();
  await application.save();

  // Send email notification
  const emailTemplate = templates.applicationStatusUpdate(
    application.userId.name,
    application.scholarshipId.title,
    status
  );
  sendEmail({ to: application.userId.email, ...emailTemplate });

  // In-app notification
  await Notification.create({
    userId: application.userId._id,
    type: status === 'accepted' ? 'application_accepted' : 'application_rejected',
    title: `Application ${status.charAt(0).toUpperCase() + status.slice(1)}`,
    message: `Your application for "${application.scholarshipId.title}" has been ${status}.`,
    link: `/dashboard/applications/${application._id}`,
  });

  await createAuditLog({
    action: `application.${status === 'accepted' ? 'accept' : 'reject'}`,
    userId: reviewerId,
    targetId: application._id,
    targetModel: 'Application',
    metadata: { status, feedback },
    req,
  });

  return application;
};

const getScholarshipApplicants = async (scholarshipId, providerId, queryString) => {
  const scholarship = await Scholarship.findById(scholarshipId);
  if (!scholarship) {
    throw new NotFoundError('Scholarship not found.');
  }

  if (scholarship.providerId.toString() !== providerId.toString()) {
    throw new ForbiddenError('You can only view applicants for your own scholarships.');
  }

  const page = parseInt(queryString.page, 10) || 1;
  const limit = parseInt(queryString.limit, 10) || 10;
  const skip = (page - 1) * limit;

  const filter = { scholarshipId, status: { $ne: 'draft' } };
  if (queryString.status) filter.status = queryString.status;

  const [applications, total] = await Promise.all([
    Application.find(filter)
      .populate('userId', 'name email profile profileCompletionScore')
      .sort('-submittedAt')
      .skip(skip)
      .limit(limit),
    Application.countDocuments(filter),
  ]);

  return {
    applications,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  };
};

const withdrawApplication = async (id, userId, req) => {
  const application = await Application.findById(id);

  if (!application) {
    throw new NotFoundError('Application not found.');
  }

  if (application.userId.toString() !== userId.toString()) {
    throw new ForbiddenError('You can only withdraw your own applications.');
  }

  if (['accepted', 'rejected', 'withdrawn'].includes(application.status)) {
    throw new BadRequestError('Cannot withdraw this application.');
  }

  application.status = 'withdrawn';
  await application.save();

  await createAuditLog({
    action: 'application.withdraw',
    userId,
    targetId: application._id,
    targetModel: 'Application',
    req,
  });

  return application;
};

module.exports = {
  createApplication,
  getApplications,
  getApplicationById,
  updateApplication,
  submitApplication,
  updateApplicationStatus,
  getScholarshipApplicants,
  withdrawApplication,
};
