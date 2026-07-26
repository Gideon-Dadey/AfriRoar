const Content = require('../models/Content');
const { NotFoundError } = require('../utils/errors');

const getPublished = async (queryString) => {
  const page = parseInt(queryString.page, 10) || 1;
  const limit = parseInt(queryString.limit, 10) || 50;
  const skip = (page - 1) * limit;

  const filter = {
    status: 'published',
    isDeleted: { $ne: true },
  };
  if (queryString.category) filter.category = queryString.category;
  if (queryString.search) {
    filter.$or = [
      { title: { $regex: queryString.search, $options: 'i' } },
      { excerpt: { $regex: queryString.search, $options: 'i' } },
    ];
  }

  const [items, total] = await Promise.all([
    Content.find(filter).sort('-publishedAt -createdAt').skip(skip).limit(limit),
    Content.countDocuments(filter),
  ]);

  return {
    items,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) || 1 },
  };
};

const getBySlug = async (slug) => {
  const item = await Content.findOne({
    slug,
    status: 'published',
    isDeleted: { $ne: true },
  });
  if (!item) throw new NotFoundError('Content not found.');
  return item;
};

module.exports = { getPublished, getBySlug };
