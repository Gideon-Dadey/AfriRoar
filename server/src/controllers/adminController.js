const adminService = require('../services/adminService');
const catchAsync = require('../utils/catchAsync');
const Notification = require('../models/Notification');
const { uploadToCloudinary } = require('../utils/cloudinary');
const { BadRequestError } = require('../utils/errors');

const getUsers = catchAsync(async (req, res) => {
  const result = await adminService.getUsers(req.query);
  res.status(200).json({ status: 'success', data: result });
});

const suspendUser = catchAsync(async (req, res) => {
  const user = await adminService.suspendUser(
    req.params.id,
    req.body.reason || 'Policy violation',
    req.user._id,
    req,
  );
  res.status(200).json({ status: 'success', data: { user } });
});

const unsuspendUser = catchAsync(async (req, res) => {
  const user = await adminService.unsuspendUser(req.params.id, req.user._id, req);
  res.status(200).json({ status: 'success', data: { user } });
});

const getScholarships = catchAsync(async (req, res) => {
  const result = await adminService.getAdminScholarships(req.query);
  res.status(200).json({ status: 'success', data: result });
});

const createScholarship = catchAsync(async (req, res) => {
  const scholarship = await adminService.createAdminScholarship(req.body, req.user._id, req);
  res.status(201).json({ status: 'success', data: { scholarship } });
});

const updateScholarship = catchAsync(async (req, res) => {
  const scholarship = await adminService.updateAdminScholarship(
    req.params.id,
    req.body,
    req.user._id,
    req,
  );
  res.status(200).json({ status: 'success', data: { scholarship } });
});

const deleteScholarship = catchAsync(async (req, res) => {
  await adminService.deleteAdminScholarship(req.params.id, req.user._id, req);
  res.status(200).json({ status: 'success', message: 'Scholarship deleted.' });
});

const uploadScholarshipCover = catchAsync(async (req, res) => {
  if (!req.file) throw new BadRequestError('No image uploaded.');
  const result = await uploadToCloudinary(req.file.buffer, {
    folder: 'afriror/scholarships',
    filename: req.file.originalname,
    transformation: [{ width: 1280, height: 720, crop: 'fill' }],
  });
  const scholarship = await adminService.setScholarshipCover(
    req.params.id,
    result.secure_url,
    req.user._id,
    req,
  );
  res.status(200).json({ status: 'success', data: { scholarship, coverImage: result.secure_url } });
});

const approveScholarship = catchAsync(async (req, res) => {
  const scholarship = await adminService.approveScholarship(req.params.id, req.user._id, req);
  res.status(200).json({ status: 'success', data: { scholarship } });
});

const rejectScholarship = catchAsync(async (req, res) => {
  const scholarship = await adminService.rejectScholarship(
    req.params.id,
    req.body.reason || 'Does not meet listing standards',
    req.user._id,
    req,
  );
  res.status(200).json({ status: 'success', data: { scholarship } });
});

const featureScholarship = catchAsync(async (req, res) => {
  const scholarship = await adminService.featureScholarship(
    req.params.id,
    Boolean(req.body.isFeatured),
    req.user._id,
    req,
  );
  res.status(200).json({ status: 'success', data: { scholarship } });
});

const getPendingScholarships = catchAsync(async (req, res) => {
  const result = await adminService.getPendingScholarships(req.query);
  res.status(200).json({ status: 'success', data: result });
});

const getApplications = catchAsync(async (req, res) => {
  const result = await adminService.getAdminApplications(req.query);
  res.status(200).json({ status: 'success', data: result });
});

const getContents = catchAsync(async (req, res) => {
  const result = await adminService.getContents(req.query);
  res.status(200).json({ status: 'success', data: result });
});

const getContent = catchAsync(async (req, res) => {
  const item = await adminService.getContentById(req.params.id);
  res.status(200).json({ status: 'success', data: { item } });
});

const createContent = catchAsync(async (req, res) => {
  const item = await adminService.createContent(req.body, req.user._id, req);
  res.status(201).json({ status: 'success', data: { item } });
});

const updateContent = catchAsync(async (req, res) => {
  const item = await adminService.updateContent(req.params.id, req.body, req.user._id, req);
  res.status(200).json({ status: 'success', data: { item } });
});

const deleteContent = catchAsync(async (req, res) => {
  await adminService.deleteContent(req.params.id, req.user._id, req);
  res.status(200).json({ status: 'success', message: 'Content deleted.' });
});

const uploadContentCover = catchAsync(async (req, res) => {
  if (!req.file) throw new BadRequestError('No image uploaded.');
  const result = await uploadToCloudinary(req.file.buffer, {
    folder: 'afriror/content',
    filename: req.file.originalname,
    transformation: [{ width: 1280, height: 720, crop: 'fill' }],
  });
  const item = await adminService.setContentCover(
    req.params.id,
    result.secure_url,
    req.user._id,
    req,
  );
  res.status(200).json({ status: 'success', data: { item, coverImage: result.secure_url } });
});

const getAnalytics = catchAsync(async (req, res) => {
  const result = await adminService.getAnalytics();
  res.status(200).json({ status: 'success', data: result });
});

const getAuditLogs = catchAsync(async (req, res) => {
  const result = await adminService.getAuditLogs(req.query);
  res.status(200).json({ status: 'success', data: result });
});

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
      pagination: { page, limit, total, pages: Math.ceil(total / limit) || 1 },
    },
  });
});

const markNotificationRead = catchAsync(async (req, res) => {
  await Notification.findOneAndUpdate(
    { _id: req.params.id, userId: req.user._id },
    { read: true, readAt: new Date() },
  );
  res.status(200).json({ status: 'success' });
});

const markAllRead = catchAsync(async (req, res) => {
  await Notification.updateMany(
    { userId: req.user._id, read: false },
    { read: true, readAt: new Date() },
  );
  res.status(200).json({ status: 'success' });
});

module.exports = {
  getUsers,
  suspendUser,
  unsuspendUser,
  getScholarships,
  createScholarship,
  updateScholarship,
  deleteScholarship,
  uploadScholarshipCover,
  approveScholarship,
  rejectScholarship,
  featureScholarship,
  getPendingScholarships,
  getApplications,
  getContents,
  getContent,
  createContent,
  updateContent,
  deleteContent,
  uploadContentCover,
  getAnalytics,
  getAuditLogs,
  getNotifications,
  markNotificationRead,
  markAllRead,
};
