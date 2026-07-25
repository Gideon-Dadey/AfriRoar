const User = require('../models/User');
const Scholarship = require('../models/Scholarship');
const Application = require('../models/Application');
const Payment = require('../models/Payment');
const AuditLog = require('../models/AuditLog');
const Notification = require('../models/Notification');
const { NotFoundError } = require('../utils/errors');
const { createAuditLog } = require('../utils/auditLog');

// ---- User management ----
const getUsers = async (queryString) => {
  const page = parseInt(queryString.page, 10) || 1;
  const limit = parseInt(queryString.limit, 10) || 20;
  const skip = (page - 1) * limit;

  const filter = {};
  if (queryString.role) filter.role = queryString.role;
  if (queryString.search) {
    filter.$or = [
      { name: { $regex: queryString.search, $options: 'i' } },
      { email: { $regex: queryString.search, $options: 'i' } },
    ];
  }

  const [users, total] = await Promise.all([
    User.find(filter).sort('-createdAt').skip(skip).limit(limit),
    User.countDocuments(filter),
  ]);

  return {
    users,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  };
};

const suspendUser = async (userId, reason, adminId, req) => {
  const user = await User.findById(userId);
  if (!user) throw new NotFoundError('User not found.');

  user.isSuspended = true;
  user.suspendedReason = reason;
  await user.save({ validateBeforeSave: false });

  await Notification.create({
    userId,
    type: 'account_suspended',
    title: 'Account Suspended',
    message: `Your account has been suspended. Reason: ${reason}`,
  });

  await createAuditLog({
    action: 'user.suspend',
    userId: adminId,
    targetId: userId,
    targetModel: 'User',
    metadata: { reason },
    req,
  });

  return user;
};

const unsuspendUser = async (userId, adminId, req) => {
  const user = await User.findById(userId);
  if (!user) throw new NotFoundError('User not found.');

  user.isSuspended = false;
  user.suspendedReason = undefined;
  await user.save({ validateBeforeSave: false });

  await createAuditLog({
    action: 'user.unsuspend',
    userId: adminId,
    targetId: userId,
    targetModel: 'User',
    metadata: {},
    req,
  });

  return user;
};

// ---- Scholarship moderation ----
const approveScholarship = async (scholarshipId, adminId, req) => {
  const scholarship = await Scholarship.findById(scholarshipId);
  if (!scholarship) throw new NotFoundError('Scholarship not found.');

  scholarship.status = 'approved';
  scholarship.approvedBy = adminId;
  scholarship.approvedAt = new Date();
  await scholarship.save({ validateBeforeSave: false });

  await Notification.create({
    userId: scholarship.providerId,
    type: 'scholarship_approved',
    title: 'Scholarship Approved',
    message: `Your scholarship "${scholarship.title}" has been approved and is now live.`,
    link: `/scholarships/${scholarship.slug}`,
  });

  await createAuditLog({
    action: 'scholarship.approve',
    userId: adminId,
    targetId: scholarshipId,
    targetModel: 'Scholarship',
    metadata: { title: scholarship.title },
    req,
  });

  return scholarship;
};

const rejectScholarship = async (scholarshipId, reason, adminId, req) => {
  const scholarship = await Scholarship.findById(scholarshipId);
  if (!scholarship) throw new NotFoundError('Scholarship not found.');

  scholarship.status = 'rejected';
  scholarship.rejectionReason = reason;
  await scholarship.save({ validateBeforeSave: false });

  await Notification.create({
    userId: scholarship.providerId,
    type: 'scholarship_rejected',
    title: 'Scholarship Rejected',
    message: `Your scholarship "${scholarship.title}" was rejected. Reason: ${reason}`,
  });

  await createAuditLog({
    action: 'scholarship.reject',
    userId: adminId,
    targetId: scholarshipId,
    targetModel: 'Scholarship',
    metadata: { title: scholarship.title, reason },
    req,
  });

  return scholarship;
};

const featureScholarship = async (scholarshipId, isFeatured, adminId, req) => {
  const scholarship = await Scholarship.findById(scholarshipId);
  if (!scholarship) throw new NotFoundError('Scholarship not found.');

  scholarship.isFeatured = isFeatured;
  await scholarship.save({ validateBeforeSave: false });

  await createAuditLog({
    action: 'scholarship.feature',
    userId: adminId,
    targetId: scholarshipId,
    targetModel: 'Scholarship',
    metadata: { isFeatured },
    req,
  });

  return scholarship;
};

// ---- Pending scholarships ----
const getPendingScholarships = async (queryString) => {
  const page = parseInt(queryString.page, 10) || 1;
  const limit = parseInt(queryString.limit, 10) || 20;
  const skip = (page - 1) * limit;

  const [scholarships, total] = await Promise.all([
    Scholarship.find({ status: 'pending' })
      .populate('providerId', 'name email')
      .sort('-createdAt')
      .skip(skip)
      .limit(limit),
    Scholarship.countDocuments({ status: 'pending' }),
  ]);

  return {
    scholarships,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  };
};

// ---- Analytics ----
const getAnalytics = async () => {
  const [
    totalUsers,
    totalStudents,
    totalProviders,
    totalScholarships,
    approvedScholarships,
    pendingScholarships,
    totalApplications,
    totalPremium,
    recentUsers,
    recentScholarships,
    applicationsByStatus,
    revenueData,
  ] = await Promise.all([
    User.countDocuments(),
    User.countDocuments({ role: 'student' }),
    User.countDocuments({ role: 'provider' }),
    Scholarship.countDocuments(),
    Scholarship.countDocuments({ status: 'approved' }),
    Scholarship.countDocuments({ status: 'pending' }),
    Application.countDocuments(),
    User.countDocuments({ subscriptionPlan: { $ne: 'free' }, subscriptionStatus: 'active' }),
    User.find().sort('-createdAt').limit(5).select('name email role createdAt'),
    Scholarship.find().sort('-createdAt').limit(5).select('title status createdAt'),
    Application.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]),
    Payment.aggregate([
      { $match: { status: 'active' } },
      { $group: { _id: '$plan', count: { $sum: 1 }, totalRevenue: { $sum: '$amount' } } },
    ]),
  ]);

  return {
    users: { total: totalUsers, students: totalStudents, providers: totalProviders },
    scholarships: { total: totalScholarships, approved: approvedScholarships, pending: pendingScholarships },
    applications: {
      total: totalApplications,
      byStatus: applicationsByStatus.reduce((acc, item) => {
        acc[item._id] = item.count;
        return acc;
      }, {}),
    },
    revenue: {
      totalPremium,
      byPlan: revenueData,
    },
    recent: {
      users: recentUsers,
      scholarships: recentScholarships,
    },
  };
};

// ---- Audit Logs ----
const getAuditLogs = async (queryString) => {
  const page = parseInt(queryString.page, 10) || 1;
  const limit = parseInt(queryString.limit, 10) || 50;
  const skip = (page - 1) * limit;

  const filter = {};
  if (queryString.action) filter.action = queryString.action;
  if (queryString.userId) filter.userId = queryString.userId;

  const [logs, total] = await Promise.all([
    AuditLog.find(filter)
      .populate('userId', 'name email')
      .sort('-createdAt')
      .skip(skip)
      .limit(limit),
    AuditLog.countDocuments(filter),
  ]);

  return {
    logs,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  };
};

module.exports = {
  getUsers,
  suspendUser,
  unsuspendUser,
  approveScholarship,
  rejectScholarship,
  featureScholarship,
  getPendingScholarships,
  getAnalytics,
  getAuditLogs,
};
