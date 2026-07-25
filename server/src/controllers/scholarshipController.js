const scholarshipService = require('../services/scholarshipService');
const catchAsync = require('../utils/catchAsync');

const create = catchAsync(async (req, res) => {
  const scholarship = await scholarshipService.createScholarship(req.body, req.user._id, req);
  res.status(201).json({
    status: 'success',
    data: { scholarship },
  });
});

const getAll = catchAsync(async (req, res) => {
  const result = await scholarshipService.getScholarships(req.query, req.user);
  res.status(200).json({
    status: 'success',
    data: result,
  });
});

const getById = catchAsync(async (req, res) => {
  const scholarship = await scholarshipService.getScholarshipById(req.params.id);
  res.status(200).json({
    status: 'success',
    data: { scholarship },
  });
});

const getBySlug = catchAsync(async (req, res) => {
  const scholarship = await scholarshipService.getScholarshipBySlug(req.params.slug);
  res.status(200).json({
    status: 'success',
    data: { scholarship },
  });
});

const update = catchAsync(async (req, res) => {
  const scholarship = await scholarshipService.updateScholarship(
    req.params.id,
    req.body,
    req.user._id,
    req.user.role,
    req
  );
  res.status(200).json({
    status: 'success',
    data: { scholarship },
  });
});

const remove = catchAsync(async (req, res) => {
  await scholarshipService.deleteScholarship(req.params.id, req.user._id, req.user.role, req);
  res.status(200).json({
    status: 'success',
    message: 'Scholarship deleted successfully.',
  });
});

const getFeatured = catchAsync(async (req, res) => {
  const scholarships = await scholarshipService.getFeaturedScholarships();
  res.status(200).json({
    status: 'success',
    data: { scholarships },
  });
});

const getRecommendations = catchAsync(async (req, res) => {
  const scholarships = await scholarshipService.getRecommendations(req.user);
  res.status(200).json({
    status: 'success',
    data: { scholarships },
  });
});

const getMyScholarships = catchAsync(async (req, res) => {
  const result = await scholarshipService.getProviderScholarships(req.user._id, req.query);
  res.status(200).json({
    status: 'success',
    data: result,
  });
});

module.exports = {
  create,
  getAll,
  getById,
  getBySlug,
  update,
  remove,
  getFeatured,
  getRecommendations,
  getMyScholarships,
};
