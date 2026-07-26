const User = require('../models/User');
const Scholarship = require('../models/Scholarship');
const Application = require('../models/Application');
const Payment = require('../models/Payment');
const AuditLog = require('../models/AuditLog');
const Notification = require('../models/Notification');
const Content = require('../models/Content');
const { NotFoundError } = require('../utils/errors');
const { createAuditLog } = require('../utils/auditLog');
const { systemUserFilter } = require('../constants/systemUsers');

const getUsers = async (queryString) => {
  const page = parseInt(queryString.page, 10) || 1;
  const limit = parseInt(queryString.limit, 10) || 20;
  const skip = (page - 1) * limit;

  const filter = { isDeleted: { $ne: true }, ...systemUserFilter };
  if (queryString.role && queryString.role !== 'all') filter.role = queryString.role;
  if (queryString.suspended === 'true') filter.isSuspended = true;
  if (queryString.suspended === 'false') filter.isSuspended = { $ne: true };
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
    pagination: { page, limit, total, pages: Math.ceil(total / limit) || 1 },
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

const getAdminScholarships = async (queryString) => {
  const page = parseInt(queryString.page, 10) || 1;
  const limit = parseInt(queryString.limit, 10) || 20;
  const skip = (page - 1) * limit;

  const filter = { isDeleted: { $ne: true } };
  if (queryString.status) filter.status = queryString.status;
  if (queryString.featured === 'true') filter.isFeatured = true;
  if (queryString.search) {
    filter.$or = [
      { title: { $regex: queryString.search, $options: 'i' } },
      { country: { $regex: queryString.search, $options: 'i' } },
      { field: { $regex: queryString.search, $options: 'i' } },
    ];
  }

  const [scholarships, total] = await Promise.all([
    Scholarship.find(filter)
      .populate('providerId', 'name email')
      .sort('-createdAt')
      .skip(skip)
      .limit(limit),
    Scholarship.countDocuments(filter),
  ]);

  return {
    scholarships,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) || 1 },
  };
};

const createAdminScholarship = async (data, adminId, req) => {
  const scholarship = await Scholarship.create({
    ...data,
    providerId: adminId,
    status: data.status || 'approved',
    approvedBy: adminId,
    approvedAt: new Date(),
  });

  await createAuditLog({
    action: 'scholarship.create',
    userId: adminId,
    targetId: scholarship._id,
    targetModel: 'Scholarship',
    metadata: { title: scholarship.title, source: 'admin' },
    req,
  });

  return scholarship;
};

const updateAdminScholarship = async (id, data, adminId, req) => {
  const scholarship = await Scholarship.findOne({ _id: id, isDeleted: { $ne: true } });
  if (!scholarship) throw new NotFoundError('Scholarship not found.');

  Object.assign(scholarship, data);
  if (data.status === 'approved' && !scholarship.approvedAt) {
    scholarship.approvedBy = adminId;
    scholarship.approvedAt = new Date();
  }
  await scholarship.save();

  await createAuditLog({
    action: 'scholarship.update',
    userId: adminId,
    targetId: scholarship._id,
    targetModel: 'Scholarship',
    metadata: { title: scholarship.title, source: 'admin' },
    req,
  });

  return scholarship;
};

const deleteAdminScholarship = async (id, adminId, req) => {
  const scholarship = await Scholarship.findOne({ _id: id, isDeleted: { $ne: true } });
  if (!scholarship) throw new NotFoundError('Scholarship not found.');

  scholarship.isDeleted = true;
  scholarship.deletedAt = new Date();
  await scholarship.save({ validateBeforeSave: false });

  await createAuditLog({
    action: 'scholarship.delete',
    userId: adminId,
    targetId: scholarship._id,
    targetModel: 'Scholarship',
    metadata: { title: scholarship.title },
    req,
  });

  return scholarship;
};

const setScholarshipCover = async (id, coverImage, adminId, req) => {
  const scholarship = await Scholarship.findOne({ _id: id, isDeleted: { $ne: true } });
  if (!scholarship) throw new NotFoundError('Scholarship not found.');

  scholarship.coverImage = coverImage;
  await scholarship.save({ validateBeforeSave: false });

  await createAuditLog({
    action: 'scholarship.update',
    userId: adminId,
    targetId: scholarship._id,
    targetModel: 'Scholarship',
    metadata: { coverImage: true },
    req,
  });

  return scholarship;
};

const approveScholarship = async (scholarshipId, adminId, req) => {
  const scholarship = await Scholarship.findById(scholarshipId);
  if (!scholarship) throw new NotFoundError('Scholarship not found.');

  scholarship.status = 'approved';
  scholarship.approvedBy = adminId;
  scholarship.approvedAt = new Date();
  await scholarship.save({ validateBeforeSave: false });

  if (scholarship.providerId) {
    await Notification.create({
      userId: scholarship.providerId,
      type: 'scholarship_approved',
      title: 'Scholarship Approved',
      message: `Your scholarship "${scholarship.title}" has been approved and is now live.`,
      link: `/scholarships/${scholarship.slug}`,
    });
  }

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

  if (scholarship.providerId) {
    await Notification.create({
      userId: scholarship.providerId,
      type: 'scholarship_rejected',
      title: 'Scholarship Rejected',
      message: `Your scholarship "${scholarship.title}" was rejected. Reason: ${reason}`,
    });
  }

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

const getPendingScholarships = async (queryString) => {
  const page = parseInt(queryString.page, 10) || 1;
  const limit = parseInt(queryString.limit, 10) || 20;
  const skip = (page - 1) * limit;

  const [scholarships, total] = await Promise.all([
    Scholarship.find({ status: 'pending', isDeleted: { $ne: true } })
      .populate('providerId', 'name email')
      .sort('-createdAt')
      .skip(skip)
      .limit(limit),
    Scholarship.countDocuments({ status: 'pending', isDeleted: { $ne: true } }),
  ]);

  return {
    scholarships,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) || 1 },
  };
};

const getAdminApplications = async (queryString) => {
  const page = parseInt(queryString.page, 10) || 1;
  const limit = parseInt(queryString.limit, 10) || 20;
  const skip = (page - 1) * limit;

  const filter = {};
  if (queryString.status) filter.status = queryString.status;
  if (queryString.userId) filter.userId = queryString.userId;

  if (queryString.search) {
    const users = await User.find({
      $or: [
        { name: { $regex: queryString.search, $options: 'i' } },
        { email: { $regex: queryString.search, $options: 'i' } },
      ],
    }).select('_id');
    filter.userId = { $in: users.map((u) => u._id) };
  }

  const [applications, total] = await Promise.all([
    Application.find(filter)
      .populate('userId', 'name email profile')
      .populate('scholarshipId', 'title slug country deadline')
      .sort('-updatedAt')
      .skip(skip)
      .limit(limit),
    Application.countDocuments(filter),
  ]);

  return {
    applications,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) || 1 },
  };
};

const getAdminApplicationById = async (id) => {
  const application = await Application.findById(id)
    .populate('userId', 'name email profile role createdAt')
    .populate('scholarshipId')
    .populate('reviewedBy', 'name email');

  if (!application) {
    throw new NotFoundError('Application not found.');
  }

  // Other applications from the same student (previous records)
  const studentId = application.userId?._id || application.userId;
  const previousApplications = await Application.find({
    userId: studentId,
    _id: { $ne: application._id },
  })
    .populate('scholarshipId', 'title slug country')
    .sort('-updatedAt')
    .select('status submittedAt createdAt updatedAt scholarshipId');

  return { application, previousApplications };
};

const getContents = async (queryString) => {
  const page = parseInt(queryString.page, 10) || 1;
  const limit = parseInt(queryString.limit, 10) || 20;
  const skip = (page - 1) * limit;

  const filter = { isDeleted: { $ne: true } };
  if (queryString.category) filter.category = queryString.category;
  if (queryString.status) filter.status = queryString.status;
  if (queryString.search) {
    filter.$or = [
      { title: { $regex: queryString.search, $options: 'i' } },
      { excerpt: { $regex: queryString.search, $options: 'i' } },
    ];
  }

  const [items, total] = await Promise.all([
    Content.find(filter)
      .populate('createdBy', 'name email')
      .sort('-updatedAt')
      .skip(skip)
      .limit(limit),
    Content.countDocuments(filter),
  ]);

  return {
    items,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) || 1 },
  };
};

const getContentById = async (id) => {
  const item = await Content.findOne({ _id: id, isDeleted: { $ne: true } }).populate(
    'createdBy',
    'name email',
  );
  if (!item) throw new NotFoundError('Content not found.');
  return item;
};

const createContent = async (data, adminId, req) => {
  const item = await Content.create({
    ...data,
    createdBy: adminId,
    publishedAt: data.status === 'published' ? new Date() : undefined,
  });

  await createAuditLog({
    action: 'content.create',
    userId: adminId,
    targetId: item._id,
    targetModel: 'Content',
    metadata: { title: item.title, category: item.category },
    req,
  });

  return item;
};

const updateContent = async (id, data, adminId, req) => {
  const item = await Content.findOne({ _id: id, isDeleted: { $ne: true } });
  if (!item) throw new NotFoundError('Content not found.');

  Object.assign(item, data);
  if (data.status === 'published' && !item.publishedAt) {
    item.publishedAt = new Date();
  }
  await item.save();

  await createAuditLog({
    action: 'content.update',
    userId: adminId,
    targetId: item._id,
    targetModel: 'Content',
    metadata: { title: item.title, category: item.category },
    req,
  });

  return item;
};

const deleteContent = async (id, adminId, req) => {
  const item = await Content.findOne({ _id: id, isDeleted: { $ne: true } });
  if (!item) throw new NotFoundError('Content not found.');

  item.isDeleted = true;
  item.deletedAt = new Date();
  await item.save({ validateBeforeSave: false });

  await createAuditLog({
    action: 'content.delete',
    userId: adminId,
    targetId: item._id,
    targetModel: 'Content',
    metadata: { title: item.title, category: item.category },
    req,
  });

  return item;
};

const setContentCover = async (id, coverImage, adminId, req) => {
  const item = await Content.findOne({ _id: id, isDeleted: { $ne: true } });
  if (!item) throw new NotFoundError('Content not found.');

  item.coverImage = coverImage;
  await item.save({ validateBeforeSave: false });

  await createAuditLog({
    action: 'content.update',
    userId: adminId,
    targetId: item._id,
    targetModel: 'Content',
    metadata: { coverImage: true },
    req,
  });

  return item;
};

const getAnalytics = async () => {
  const now = new Date();
  const daysAgo = (n) => {
    const d = new Date(now);
    d.setDate(d.getDate() - n);
    return d;
  };
  const since7 = daysAgo(7);
  const since30 = daysAgo(30);

  const [
    totalUsers,
    totalStudents,
    totalProviders,
    totalAdmins,
    suspendedUsers,
    verifiedStudents,
    usersLast7Days,
    usersLast30Days,
    totalScholarships,
    approvedScholarships,
    pendingScholarships,
    rejectedScholarships,
    featuredScholarships,
    totalApplications,
    applicationsLast7Days,
    applicationsLast30Days,
    totalPremium,
    totalContent,
    publishedContent,
    draftContent,
    recentUsers,
    recentScholarships,
    recentApplications,
    topScholarships,
    applicationsByStatus,
    revenueData,
  ] = await Promise.all([
    User.countDocuments({ isDeleted: { $ne: true }, ...systemUserFilter }),
    User.countDocuments({ role: 'student', isDeleted: { $ne: true }, ...systemUserFilter }),
    User.countDocuments({ role: 'provider', isDeleted: { $ne: true }, ...systemUserFilter }),
    User.countDocuments({ role: 'admin', isDeleted: { $ne: true }, ...systemUserFilter }),
    User.countDocuments({ isSuspended: true, ...systemUserFilter }),
    User.countDocuments({
      role: 'student',
      isEmailVerified: true,
      isDeleted: { $ne: true },
      ...systemUserFilter,
    }),
    User.countDocuments({ createdAt: { $gte: since7 }, isDeleted: { $ne: true }, ...systemUserFilter }),
    User.countDocuments({ createdAt: { $gte: since30 }, isDeleted: { $ne: true }, ...systemUserFilter }),
    Scholarship.countDocuments({ isDeleted: { $ne: true } }),
    Scholarship.countDocuments({ status: 'approved', isDeleted: { $ne: true } }),
    Scholarship.countDocuments({ status: 'pending', isDeleted: { $ne: true } }),
    Scholarship.countDocuments({ status: 'rejected', isDeleted: { $ne: true } }),
    Scholarship.countDocuments({ isFeatured: true, isDeleted: { $ne: true } }),
    Application.countDocuments(),
    Application.countDocuments({ createdAt: { $gte: since7 } }),
    Application.countDocuments({ createdAt: { $gte: since30 } }),
    User.countDocuments({
      subscriptionPlan: { $ne: 'free' },
      subscriptionStatus: 'active',
      ...systemUserFilter,
    }),
    Content.countDocuments({ isDeleted: { $ne: true } }),
    Content.countDocuments({ status: 'published', isDeleted: { $ne: true } }),
    Content.countDocuments({ status: 'draft', isDeleted: { $ne: true } }),
    User.find({ isDeleted: { $ne: true }, ...systemUserFilter })
      .sort('-createdAt')
      .limit(8)
      .select('name email role createdAt isSuspended isEmailVerified'),
    Scholarship.find({ isDeleted: { $ne: true } })
      .sort('-createdAt')
      .limit(8)
      .select('title status country createdAt applicationCount isFeatured'),
    Application.find()
      .sort('-updatedAt')
      .limit(8)
      .populate('userId', 'name email')
      .populate('scholarshipId', 'title country')
      .select('status submittedAt createdAt updatedAt userId scholarshipId'),
    Scholarship.find({ isDeleted: { $ne: true }, applicationCount: { $gt: 0 } })
      .sort('-applicationCount')
      .limit(5)
      .select('title country applicationCount status'),
    Application.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
    Payment.aggregate([
      { $match: { status: 'active' } },
      { $group: { _id: '$plan', count: { $sum: 1 }, totalRevenue: { $sum: '$amount' } } },
    ]),
  ]);

  const byStatus = applicationsByStatus.reduce((acc, item) => {
    acc[item._id] = item.count;
    return acc;
  }, {});

  return {
    users: {
      total: totalUsers,
      students: totalStudents,
      providers: totalProviders,
      admins: totalAdmins,
      suspended: suspendedUsers,
      verifiedStudents,
      last7Days: usersLast7Days,
      last30Days: usersLast30Days,
    },
    scholarships: {
      total: totalScholarships,
      approved: approvedScholarships,
      pending: pendingScholarships,
      rejected: rejectedScholarships,
      featured: featuredScholarships,
    },
    applications: {
      total: totalApplications,
      last7Days: applicationsLast7Days,
      last30Days: applicationsLast30Days,
      byStatus,
    },
    content: {
      total: totalContent,
      published: publishedContent,
      draft: draftContent,
    },
    revenue: {
      totalPremium,
      byPlan: revenueData,
    },
    recent: {
      users: recentUsers,
      scholarships: recentScholarships,
      applications: recentApplications,
    },
    topScholarships,
    generatedAt: now.toISOString(),
  };
};

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
    pagination: { page, limit, total, pages: Math.ceil(total / limit) || 1 },
  };
};

module.exports = {
  getUsers,
  suspendUser,
  unsuspendUser,
  getAdminScholarships,
  createAdminScholarship,
  updateAdminScholarship,
  deleteAdminScholarship,
  setScholarshipCover,
  approveScholarship,
  rejectScholarship,
  featureScholarship,
  getPendingScholarships,
  getAdminApplications,
  getAdminApplicationById,
  getContents,
  getContentById,
  createContent,
  updateContent,
  deleteContent,
  setContentCover,
  getAnalytics,
  getAuditLogs,
};
