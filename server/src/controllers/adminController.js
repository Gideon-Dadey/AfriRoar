const adminService = require('../services/adminService');
const catchAsync = require('../utils/catchAsync');
const Notification = require('../models/Notification');

const getUsers = catchAsync(async (req, res) => {
  const result = await adminService.getUsers(req.query);
  res.status(200).json({ status: 'success', data: result });
});

const suspendUser = catchAsync(async (req, res) => {
  const user = await adminService.suspendUser(req.params.id, req.body.reason, req.user._id, req);
  res.status(200).json({ status: 'success', data: { user } });
});

const unsuspendUser = catchAsync(async (req, res) => {
  const user = await adminService.unsuspendUser(req.params.id, req.user._id, req);
  res.status(200).json({ status: 'success', data: { user } });
});

const approveScholarship = catchAsync(async (req, res) => {
  const scholarship = await adminService.approveScholarship(req.params.id, req.user._id, req);
  res.status(200).json({ status: 'success', data: { scholarship } });
});

const rejectScholarship = catchAsync(async (req, res) => {
  const scholarship = await adminService.rejectScholarship(req.params.id, req.body.reason, req.user._id, req);
  res.status(200).json({ status: 'success', data: { scholarship } });
});

const featureScholarship = catchAsync(async (req, res) => {
  const scholarship = await adminService.featureScholarship(req.params.id, req.body.isFeatured, req.user._id, req);
  res.status(200).json({ status: 'success', data: { scholarship } });
});

const getPendingScholarships = catchAsync(async (req, res) => {
  const result = await adminService.getPendingScholarships(req.query);
  res.status(200).json({ status: 'success', data: result });
});

const getAnalytics = catchAsync(async (req, res) => {
  const result = await adminService.getAnalytics();
  res.status(200).json({ status: 'success', data: result });
});

const getAuditLogs = catchAsync(async (req, res) => {
  const result = await adminService.getAuditLogs(req.query);
  res.status(200).json({ status: 'success', data: result });
});

// Notifications controller (shared)
const getNotifications = catchAsync(async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 20;
  const skip = (page - 1) * limit;

  const [notifications, total, unreadCount] = await Promise.all([
    Notification.find({ userId: req.user._id }).sort('-createdAt').skip(skip).limit(limit),
    Notification.countDocuments({ userId: req.user._id }),
    Notification.countDocuments({ userId: req.user._id, read: false }),
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      notifications,
      unreadCount,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    },
  });
});

const markNotificationRead = catchAsync(async (req, res) => {
  await Notification.findOneAndUpdate(
    { _id: req.params.id, userId: req.user._id },
    { read: true, readAt: new Date() }
  );
  res.status(200).json({ status: 'success' });
});

const markAllRead = catchAsync(async (req, res) => {
  await Notification.updateMany(
    { userId: req.user._id, read: false },
    { read: true, readAt: new Date() }
  );
  res.status(200).json({ status: 'success' });
});

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
  getNotifications,
  markNotificationRead,
  markAllRead,
};
