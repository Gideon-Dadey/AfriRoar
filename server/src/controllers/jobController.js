const jobService = require('../services/jobService');
const catchAsync = require('../utils/catchAsync');
const { uploadToCloudinary } = require('../utils/cloudinary');

const getAll = catchAsync(async (req, res) => {
  const result = await jobService.getJobs(req.query, { admin: false });
  res.status(200).json({ status: 'success', data: result });
});

const getBySlug = catchAsync(async (req, res) => {
  const job = await jobService.getJobBySlug(req.params.slug);
  res.status(200).json({ status: 'success', data: { job } });
});

const getById = catchAsync(async (req, res) => {
  const job = await jobService.getJobById(req.params.id, { increment: false });
  res.status(200).json({ status: 'success', data: { job } });
});

const adminList = catchAsync(async (req, res) => {
  const result = await jobService.getJobs(req.query, { admin: true });
  res.status(200).json({ status: 'success', data: result });
});

const adminGet = catchAsync(async (req, res) => {
  const job = await jobService.getJobById(req.params.id);
  res.status(200).json({ status: 'success', data: { job } });
});

const adminCreate = catchAsync(async (req, res) => {
  const job = await jobService.createJob(req.body, req.user._id, req);
  res.status(201).json({ status: 'success', data: { job } });
});

const adminUpdate = catchAsync(async (req, res) => {
  const job = await jobService.updateJob(req.params.id, req.body, req.user._id, req);
  res.status(200).json({ status: 'success', data: { job } });
});

const adminDelete = catchAsync(async (req, res) => {
  await jobService.deleteJob(req.params.id, req.user._id, req);
  res.status(200).json({ status: 'success', message: 'Job deleted.' });
});

const adminFeature = catchAsync(async (req, res) => {
  const job = await jobService.setFeatured(req.params.id, req.body.isFeatured, req.user._id, req);
  res.status(200).json({ status: 'success', data: { job } });
});

const adminUploadCover = catchAsync(async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ status: 'fail', message: 'No image uploaded.' });
  }
  const result = await uploadToCloudinary(req.file.buffer, {
    folder: 'afriror/jobs',
    filename: req.file.originalname,
    mimetype: req.file.mimetype,
    transformation: [{ width: 1280, height: 720, crop: 'fill' }],
  });
  const job = await jobService.updateJob(
    req.params.id,
    { coverImage: result.secure_url },
    req.user._id,
    req
  );
  res.status(200).json({ status: 'success', data: { job, coverImage: result.secure_url } });
});

module.exports = {
  getAll,
  getBySlug,
  getById,
  adminList,
  adminGet,
  adminCreate,
  adminUpdate,
  adminDelete,
  adminFeature,
  adminUploadCover,
};
