const applicationService = require('../services/applicationService');
const catchAsync = require('../utils/catchAsync');
const { uploadToCloudinary } = require('../utils/cloudinary');

const create = catchAsync(async (req, res) => {
  const application = await applicationService.createApplication(req.body, req.user._id, req);
  res.status(201).json({
    status: 'success',
    data: { application },
  });
});

const getAll = catchAsync(async (req, res) => {
  const result = await applicationService.getApplications(req.user._id, req.query);
  res.status(200).json({
    status: 'success',
    data: result,
  });
});

const getById = catchAsync(async (req, res) => {
  const application = await applicationService.getApplicationById(req.params.id, req.user._id, {
    role: req.user.role,
  });
  res.status(200).json({
    status: 'success',
    data: { application },
  });
});

const update = catchAsync(async (req, res) => {
  const application = await applicationService.updateApplication(
    req.params.id,
    req.body,
    req.user._id,
    req
  );
  res.status(200).json({
    status: 'success',
    data: { application },
  });
});

const submit = catchAsync(async (req, res) => {
  const application = await applicationService.submitApplication(req.params.id, req.user._id, req);
  res.status(200).json({
    status: 'success',
    data: { application },
  });
});

const updateStatus = catchAsync(async (req, res) => {
  const { status, feedback } = req.body;
  const application = await applicationService.updateApplicationStatus(
    req.params.id,
    status,
    feedback,
    req.user._id,
    req
  );
  res.status(200).json({
    status: 'success',
    data: { application },
  });
});

const getApplicants = catchAsync(async (req, res) => {
  const result = await applicationService.getScholarshipApplicants(
    req.params.scholarshipId,
    req.user._id,
    req.query
  );
  res.status(200).json({
    status: 'success',
    data: result,
  });
});

const withdraw = catchAsync(async (req, res) => {
  const application = await applicationService.withdrawApplication(req.params.id, req.user._id, req);
  res.status(200).json({
    status: 'success',
    data: { application },
  });
});

const uploadDocuments = catchAsync(async (req, res) => {
  const files = req.files;
  if (!files || files.length === 0) {
    return res.status(400).json({ status: 'fail', message: 'No files uploaded.' });
  }

  const Application = require('../models/Application');
  const application = await Application.findById(req.params.id);

  if (!application) {
    return res.status(404).json({ status: 'fail', message: 'Application not found.' });
  }

  if (String(application.userId) !== String(req.user._id) && req.user.role !== 'admin') {
    return res.status(403).json({ status: 'fail', message: 'Not authorized.' });
  }

  if (['submitted', 'accepted', 'rejected'].includes(application.status)) {
    return res.status(400).json({ status: 'fail', message: 'Cannot upload documents to a locked application.' });
  }

  const uploadPromises = files.map(async (file) => {
    const result = await uploadToCloudinary(file.buffer, {
      folder: `afriror/applications/${req.params.id}`,
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
  });

  const documents = await Promise.all(uploadPromises);
  application.documents = [...(application.documents || []), ...documents];
  application.lastSavedAt = new Date();

  const docsStep = application.steps?.find((s) => s.stepNumber === 4);
  if (docsStep) {
    docsStep.completed = application.documents.length > 0;
    docsStep.completedAt = docsStep.completed ? new Date() : undefined;
    docsStep.data = { ...(docsStep.data || {}), documentCount: application.documents.length };
  }

  await application.save();

  res.status(200).json({
    status: 'success',
    data: { documents: application.documents, application },
  });
});

module.exports = {
  create,
  getAll,
  getById,
  update,
  submit,
  updateStatus,
  getApplicants,
  withdraw,
  uploadDocuments,
};
