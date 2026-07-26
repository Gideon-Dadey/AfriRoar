const Job = require('../models/Job');
const APIFeatures = require('../utils/apiFeatures');
const { NotFoundError, ForbiddenError, BadRequestError } = require('../utils/errors');
const { createAuditLog } = require('../utils/auditLog');

const createJob = async (data, userId, req) => {
  const job = await Job.create({
    ...data,
    createdBy: userId,
    status: data.status || 'published',
  });

  await createAuditLog({
    action: 'job.create',
    userId,
    targetId: job._id,
    targetModel: 'Job',
    metadata: { title: job.title },
    req,
  });

  return job;
};

const getJobs = async (queryString, { admin = false } = {}) => {
  const baseFilter = {};
  if (!admin) {
    baseFilter.status = 'published';
  } else if (queryString.status) {
    baseFilter.status = queryString.status;
  }

  const q = { ...queryString };
  delete q.status;

  if (q.country) {
    baseFilter.country = { $regex: String(q.country).trim(), $options: 'i' };
    delete q.country;
  }

  if (q.open === '1' || q.open === 'true') {
    baseFilter.deadline = { ...(baseFilter.deadline || {}), $gte: new Date() };
    delete q.open;
  }

  if (q.closing === 'soon') {
    const now = new Date();
    const in30 = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    baseFilter.deadline = { $gte: now, $lte: in30 };
    delete q.closing;
  }

  const features = new APIFeatures(Job.find(baseFilter), q)
    .filter()
    .search(['title', 'description', 'company', 'field', 'location', 'tags'])
    .sort()
    .limitFields()
    .paginate();

  await features.countDocuments();
  const jobs = await features.query;

  return {
    jobs,
    pagination: {
      page: features.page,
      limit: features.limit,
      total: features.totalDocs,
      pages: Math.ceil(features.totalDocs / features.limit) || 1,
    },
  };
};

const getJobById = async (id, { increment = false } = {}) => {
  const job = await Job.findById(id);
  if (!job) throw new NotFoundError('Job not found.');
  if (increment) {
    job.viewCount += 1;
    await job.save({ validateBeforeSave: false });
  }
  return job;
};

const getJobBySlug = async (slug) => {
  const job = await Job.findOne({ slug, status: 'published' });
  if (!job) throw new NotFoundError('Job not found.');
  job.viewCount += 1;
  await job.save({ validateBeforeSave: false });
  return job;
};

const updateJob = async (id, data, userId, req) => {
  const job = await Job.findById(id);
  if (!job) throw new NotFoundError('Job not found.');

  Object.assign(job, data);
  await job.save();

  await createAuditLog({
    action: 'job.update',
    userId,
    targetId: job._id,
    targetModel: 'Job',
    metadata: { changes: Object.keys(data) },
    req,
  });

  return job;
};

const deleteJob = async (id, userId, req) => {
  const job = await Job.findById(id);
  if (!job) throw new NotFoundError('Job not found.');

  job.isDeleted = true;
  job.deletedAt = new Date();
  await job.save({ validateBeforeSave: false });

  await createAuditLog({
    action: 'job.delete',
    userId,
    targetId: job._id,
    targetModel: 'Job',
    metadata: { title: job.title },
    req,
  });

  return job;
};

const setFeatured = async (id, isFeatured, userId, req) => {
  const job = await Job.findById(id);
  if (!job) throw new NotFoundError('Job not found.');
  job.isFeatured = Boolean(isFeatured);
  await job.save({ validateBeforeSave: false });

  await createAuditLog({
    action: 'job.feature',
    userId,
    targetId: job._id,
    targetModel: 'Job',
    metadata: { isFeatured: job.isFeatured },
    req,
  });

  return job;
};

const assertJobOpenForApply = (job) => {
  if (!job) throw new NotFoundError('Job not found.');
  if (job.status !== 'published') {
    throw new BadRequestError('This job is not open for applications.');
  }
  if (job.deadline < new Date()) {
    throw new BadRequestError('This job application deadline has passed.');
  }
  if (!job.allowInternalApply) {
    throw new BadRequestError('This role only accepts applications on the employer site.');
  }
};

module.exports = {
  createJob,
  getJobs,
  getJobById,
  getJobBySlug,
  updateJob,
  deleteJob,
  setFeatured,
  assertJobOpenForApply,
};
