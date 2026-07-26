const contentService = require('../services/contentService');
const catchAsync = require('../utils/catchAsync');

const getPublished = catchAsync(async (req, res) => {
  const result = await contentService.getPublished(req.query);
  res.status(200).json({ status: 'success', data: result });
});

const getBySlug = catchAsync(async (req, res) => {
  const item = await contentService.getBySlug(req.params.slug);
  res.status(200).json({ status: 'success', data: { item } });
});

module.exports = { getPublished, getBySlug };
