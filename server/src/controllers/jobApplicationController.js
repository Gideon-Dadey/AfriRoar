const jobApplicationService = require('../services/jobApplicationService');
const catchAsync = require('../utils/catchAsync');

const create = catchAsync(async (req, res) => {
  const application = await jobApplicationService.createJobApplication(
    req.body.jobId,
    req.user._id,
    req
  );
  res.status(201).json({ status: 'success', data: { application } });
});

const getMine = catchAsync(async (req, res) => {
  const result = await jobApplicationService.getMyJobApplications(req.user._id, req.query);
  res.status(200).json({ status: 'success', data: result });
});

const getOne = catchAsync(async (req, res) => {
  const application = await jobApplicationService.getJobApplicationById(
    req.params.id,
    req.user._id,
    req.user.role
  );
  res.status(200).json({ status: 'success', data: { application } });
});

const update = catchAsync(async (req, res) => {
  const application = await jobApplicationService.updateJobApplication(
    req.params.id,
    req.user._id,
    req.body,
    req
  );
  res.status(200).json({ status: 'success', data: { application } });
});

const uploadDocuments = catchAsync(async (req, res) => {
  if (!req.files?.length) {
    return res.status(400).json({ status: 'fail', message: 'No files uploaded.' });
  }
  const documents = await jobApplicationService.uploadJobDocuments(
    req.params.id,
    req.user._id,
    req.files
  );
  res.status(200).json({ status: 'success', data: { documents } });
});

const removeDocument = catchAsync(async (req, res) => {
  const documents = await jobApplicationService.removeJobDocument(
    req.params.id,
    req.user._id,
    req.params.docIndex
  );
  res.status(200).json({ status: 'success', data: { documents } });
});

const submit = catchAsync(async (req, res) => {
  const application = await jobApplicationService.submitJobApplication(
    req.params.id,
    req.user._id,
    req
  );
  res.status(200).json({ status: 'success', data: { application } });
});

const withdraw = catchAsync(async (req, res) => {
  const application = await jobApplicationService.withdrawJobApplication(
    req.params.id,
    req.user._id,
    req
  );
  res.status(200).json({ status: 'success', data: { application } });
});

const adminList = catchAsync(async (req, res) => {
  const result = await jobApplicationService.getAdminJobApplications(req.query);
  res.status(200).json({ status: 'success', data: result });
});

const adminGet = catchAsync(async (req, res) => {
  const application = await jobApplicationService.getJobApplicationById(
    req.params.id,
    req.user._id,
    'admin'
  );
  res.status(200).json({ status: 'success', data: { application } });
});

const adminUpdateStatus = catchAsync(async (req, res) => {
  const application = await jobApplicationService.updateJobApplicationStatus(
    req.params.id,
    req.body.status,
    req.body.feedback,
    req.user._id,
    req
  );
  res.status(200).json({ status: 'success', data: { application } });
});

module.exports = {
  create,
  getMine,
  getOne,
  update,
  uploadDocuments,
  removeDocument,
  submit,
  withdraw,
  adminList,
  adminGet,
  adminUpdateStatus,
};
