const Job = require('../models/Job');
const JobApplication = require('../models/JobApplication');
const User = require('../models/User');
const Notification = require('../models/Notification');
const { NotFoundError, ForbiddenError, BadRequestError } = require('../utils/errors');
const { createAuditLog } = require('../utils/auditLog');
const { assertJobOpenForApply } = require('./jobService');
const { uploadToCloudinary } = require('../utils/cloudinary');
const { sendEmail, templates } = require('../utils/email');

const splitName = (name = '') => {
  const parts = String(name).trim().split(/\s+/).filter(Boolean);
  return {
    firstName: parts[0] || '',
    lastName: parts.length > 1 ? parts[parts.length - 1] : '',
    otherName: parts.length > 2 ? parts.slice(1, -1).join(' ') : '',
  };
};

const createJobApplication = async (jobId, userId, req) => {
  const job = await Job.findById(jobId);
  assertJobOpenForApply(job);

  const existing = await JobApplication.findOne({ userId, jobId });
  if (existing) {
    throw new BadRequestError('You already have an application for this job.');
  }

  const user = await User.findById(userId);
  const names = splitName(user?.name);

  const application = await JobApplication.create({
    userId,
    jobId,
    currentStep: 1,
    personal: {
      firstName: names.firstName,
      lastName: names.lastName,
      otherName: names.otherName,
      email: user?.email || '',
      phone: user?.profile?.phone || '',
      country: user?.profile?.country || '',
      linkedIn: '',
    },
    coverLetter: '',
    documents: [],
  });

  await createAuditLog({
    action: 'job_application.create',
    userId,
    targetId: application._id,
    targetModel: 'JobApplication',
    metadata: { jobId },
    req,
  });

  await application.populate(
    'jobId',
    'title company slug deadline country employmentType workplaceType coverImage'
  );
  return application;
};

const getMyJobApplications = async (userId, query = {}) => {
  const filter = { userId };
  if (query.status) filter.status = query.status;

  const page = parseInt(query.page, 10) || 1;
  const limit = Math.min(parseInt(query.limit, 10) || 20, 50);
  const skip = (page - 1) * limit;

  const [applications, total] = await Promise.all([
    JobApplication.find(filter)
      .sort('-updatedAt')
      .skip(skip)
      .limit(limit)
      .populate('jobId', 'title company slug deadline country employmentType workplaceType coverImage status'),
    JobApplication.countDocuments(filter),
  ]);

  return {
    applications,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) || 1 },
  };
};

const getJobApplicationById = async (id, userId, role) => {
  const application = await JobApplication.findById(id)
    .populate('jobId')
    .populate('userId', 'name email profile');

  if (!application) throw new NotFoundError('Job application not found.');
  if (role !== 'admin' && String(application.userId._id || application.userId) !== String(userId)) {
    throw new ForbiddenError('Not authorized to view this application.');
  }
  return application;
};

const updateJobApplication = async (id, userId, payload, req) => {
  const application = await JobApplication.findById(id);
  if (!application) throw new NotFoundError('Job application not found.');
  if (String(application.userId) !== String(userId)) {
    throw new ForbiddenError('Not authorized.');
  }
  if (['submitted', 'under_review', 'accepted', 'rejected'].includes(application.status)) {
    throw new BadRequestError('This application is locked and cannot be edited.');
  }

  if (payload.personal) {
    application.personal = { ...application.personal.toObject?.() || application.personal, ...payload.personal };
  }
  if (typeof payload.coverLetter === 'string') {
    application.coverLetter = payload.coverLetter;
  }
  if (payload.currentStep != null) {
    application.currentStep = Math.min(3, Math.max(1, Number(payload.currentStep) || 1));
  }

  application.lastSavedAt = new Date();
  await application.save();

  await createAuditLog({
    action: 'job_application.update',
    userId,
    targetId: application._id,
    targetModel: 'JobApplication',
    req,
  });

  await application.populate(
    'jobId',
    'title company slug deadline country employmentType workplaceType coverImage'
  );
  return application;
};

const uploadJobDocuments = async (id, userId, files) => {
  const application = await JobApplication.findById(id);
  if (!application) throw new NotFoundError('Job application not found.');
  if (String(application.userId) !== String(userId)) {
    throw new ForbiddenError('Not authorized.');
  }
  if (['submitted', 'under_review', 'accepted', 'rejected'].includes(application.status)) {
    throw new BadRequestError('Cannot upload documents to a locked application.');
  }

  const uploaded = await Promise.all(
    files.map(async (file) => {
      const result = await uploadToCloudinary(file.buffer, {
        folder: `afriror/job-applications/${id}`,
        filename: file.originalname,
        mimetype: file.mimetype,
        resource_type: 'raw',
      });
      return {
        name: file.originalname,
        url: result.secure_url,
        publicId: result.public_id,
        fileType: file.mimetype,
        fileSize: file.size,
        uploadedAt: new Date(),
      };
    })
  );

  application.documents = [...(application.documents || []), ...uploaded];
  application.lastSavedAt = new Date();
  await application.save({ validateBeforeSave: false });
  return application.documents;
};

const removeJobDocument = async (id, userId, docIndex) => {
  const application = await JobApplication.findById(id);
  if (!application) throw new NotFoundError('Job application not found.');
  if (String(application.userId) !== String(userId)) {
    throw new ForbiddenError('Not authorized.');
  }
  if (['submitted', 'under_review', 'accepted', 'rejected'].includes(application.status)) {
    throw new BadRequestError('Cannot modify documents on a locked application.');
  }

  const index = Number(docIndex);
  if (Number.isNaN(index) || index < 0 || index >= (application.documents || []).length) {
    throw new BadRequestError('Document not found.');
  }
  application.documents.splice(index, 1);
  application.lastSavedAt = new Date();
  await application.save({ validateBeforeSave: false });
  return application.documents;
};

const submitJobApplication = async (id, userId, req) => {
  const application = await JobApplication.findById(id);
  if (!application) throw new NotFoundError('Job application not found.');
  if (String(application.userId) !== String(userId)) {
    throw new ForbiddenError('Not authorized.');
  }
  if (application.status !== 'draft') {
    throw new BadRequestError('Only draft applications can be submitted.');
  }

  const job = await Job.findById(application.jobId);
  assertJobOpenForApply(job);

  const p = application.personal || {};
  if (!p.firstName?.trim() || !p.lastName?.trim() || !p.email?.trim() || !p.phone?.trim()) {
    throw new BadRequestError('Complete your personal details before submitting.');
  }
  if (!application.coverLetter || application.coverLetter.trim().length < 80) {
    throw new BadRequestError('Cover letter must be at least 80 characters.');
  }
  if (!application.documents?.length) {
    throw new BadRequestError('Upload at least one document (CV / resume).');
  }

  application.status = 'submitted';
  application.submittedAt = new Date();
  application.currentStep = 3;
  application.lastSavedAt = new Date();
  await application.save();

  job.applicationCount = (job.applicationCount || 0) + 1;
  await job.save({ validateBeforeSave: false });

  const user = await User.findById(userId).select('name email');
  if (user?.email) {
    const emailTemplate = templates.jobApplicationSubmitted(
      user.name,
      job.title,
      job.company,
    );
    sendEmail({ to: user.email, ...emailTemplate });
  }

  await Notification.create({
    userId,
    type: 'application_submitted',
    title: 'Job application submitted',
    message: `Your application for ${job.title} at ${job.company} was submitted.`,
    link: `/dashboard/job-applications/${application._id}`,
    metadata: { jobApplicationId: String(application._id), jobId: String(job._id) },
  });

  await createAuditLog({
    action: 'job_application.submit',
    userId,
    targetId: application._id,
    targetModel: 'JobApplication',
    metadata: { jobId: job._id },
    req,
  });

  await application.populate(
    'jobId',
    'title company slug deadline country employmentType workplaceType coverImage'
  );
  return application;
};

const withdrawJobApplication = async (id, userId, req) => {
  const application = await JobApplication.findById(id);
  if (!application) throw new NotFoundError('Job application not found.');
  if (String(application.userId) !== String(userId)) {
    throw new ForbiddenError('Not authorized.');
  }
  if (!['draft', 'submitted', 'under_review'].includes(application.status)) {
    throw new BadRequestError('This application cannot be withdrawn.');
  }

  application.status = 'withdrawn';
  application.lastSavedAt = new Date();
  await application.save({ validateBeforeSave: false });

  await createAuditLog({
    action: 'job_application.withdraw',
    userId,
    targetId: application._id,
    targetModel: 'JobApplication',
    req,
  });

  return application;
};

const updateJobApplicationStatus = async (id, status, feedback, adminId, req) => {
  const allowed = ['under_review', 'accepted', 'rejected'];
  if (!allowed.includes(status)) {
    throw new BadRequestError('Invalid status.');
  }

  const application = await JobApplication.findById(id)
    .populate('jobId', 'title company')
    .populate('userId', 'name email');
  if (!application) throw new NotFoundError('Job application not found.');

  application.status = status;
  application.feedback = feedback || application.feedback || '';
  application.reviewedBy = adminId;
  application.reviewedAt = new Date();
  await application.save();

  const type =
    status === 'accepted'
      ? 'application_accepted'
      : status === 'rejected'
        ? 'application_rejected'
        : 'application_review';

  if (application.userId?.email) {
    const emailTemplate = templates.jobApplicationStatusUpdate(
      application.userId.name,
      application.jobId?.title,
      application.jobId?.company,
      status,
    );
    sendEmail({ to: application.userId.email, ...emailTemplate });
  }

  await Notification.create({
    userId: application.userId?._id || application.userId,
    type,
    title: `Job application ${status.replace('_', ' ')}`,
    message: `Your application for ${application.jobId?.title || 'a role'} was marked ${status.replace('_', ' ')}.`,
    link: `/dashboard/job-applications/${application._id}`,
    metadata: { jobApplicationId: String(application._id) },
  });

  await createAuditLog({
    action: 'job_application.status',
    userId: adminId,
    targetId: application._id,
    targetModel: 'JobApplication',
    metadata: { status },
    req,
  });

  return application;
};

const getAdminJobApplications = async (query = {}) => {
  const filter = {};
  if (query.status) filter.status = query.status;
  if (query.jobId) filter.jobId = query.jobId;

  if (query.search && String(query.search).trim()) {
    const term = String(query.search).trim();
    const users = await User.find({
      $or: [
        { name: { $regex: term, $options: 'i' } },
        { email: { $regex: term, $options: 'i' } },
      ],
    }).select('_id');
    filter.userId = { $in: users.map((u) => u._id) };
  }

  const page = parseInt(query.page, 10) || 1;
  const limit = Math.min(parseInt(query.limit, 10) || 20, 50);
  const skip = (page - 1) * limit;

  const [applications, total] = await Promise.all([
    JobApplication.find(filter)
      .sort('-createdAt')
      .skip(skip)
      .limit(limit)
      .populate('jobId', 'title company slug')
      .populate('userId', 'name email'),
    JobApplication.countDocuments(filter),
  ]);

  return {
    applications,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) || 1 },
  };
};

module.exports = {
  createJobApplication,
  getMyJobApplications,
  getJobApplicationById,
  updateJobApplication,
  uploadJobDocuments,
  removeJobDocument,
  submitJobApplication,
  withdrawJobApplication,
  updateJobApplicationStatus,
  getAdminJobApplications,
};
