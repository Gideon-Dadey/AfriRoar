const Scholarship = require('../models/Scholarship');
const APIFeatures = require('../utils/apiFeatures');
const { NotFoundError, ForbiddenError } = require('../utils/errors');
const { createAuditLog } = require('../utils/auditLog');
const { normalizeScholarshipQuery } = require('../utils/scholarshipQuery');

const createScholarship = async (data, userId, req) => {
  const scholarship = await Scholarship.create({
    ...data,
    providerId: userId,
  });

  await createAuditLog({
    action: 'scholarship.create',
    userId,
    targetId: scholarship._id,
    targetModel: 'Scholarship',
    metadata: { title: scholarship.title },
    req,
  });

  return scholarship;
};

const getScholarships = async (queryString, user = null) => {
  const normalized = normalizeScholarshipQuery(queryString);

  // Base filter: only approved scholarships for non-admin users
  const baseFilter = {};
  if (!user || user.role !== 'admin') {
    baseFilter.status = 'approved';
  }

  // Hide early access from non-premium users
  if (!user?.isPremium && user?.role !== 'admin') {
    baseFilter.isEarlyAccess = { $ne: true };
  }

  // Strip custom keys that are not schema fields (already converted to gte/lte)
  const featuresQuery = { ...normalized };
  delete featuresQuery.closing;
  delete featuresQuery.open;

  // Country: case-insensitive contains (UK matches United Kingdom)
  if (featuresQuery.country) {
    baseFilter.country = { $regex: String(featuresQuery.country).trim(), $options: 'i' };
    delete featuresQuery.country;
  }

  const features = new APIFeatures(Scholarship.find(baseFilter), featuresQuery)
    .filter()
    .search(['title', 'description', 'field', 'country', 'tags'])
    .sort()
    .limitFields()
    .paginate();

  await features.countDocuments();
  const scholarships = await features.query.populate('providerId', 'name email profile.avatar');

  return {
    scholarships,
    pagination: {
      page: features.page,
      limit: features.limit,
      total: features.totalDocs,
      pages: Math.ceil(features.totalDocs / features.limit),
    },
  };
};

const getScholarshipById = async (id) => {
  const scholarship = await Scholarship.findById(id)
    .populate('providerId', 'name email profile.avatar');

  if (!scholarship) {
    throw new NotFoundError('Scholarship not found.');
  }

  // Increment view count
  scholarship.viewCount += 1;
  await scholarship.save({ validateBeforeSave: false });

  return scholarship;
};

const getScholarshipBySlug = async (slug) => {
  const scholarship = await Scholarship.findOne({ slug })
    .populate('providerId', 'name email profile.avatar');

  if (!scholarship) {
    throw new NotFoundError('Scholarship not found.');
  }

  scholarship.viewCount += 1;
  await scholarship.save({ validateBeforeSave: false });

  return scholarship;
};

const updateScholarship = async (id, data, userId, userRole, req) => {
  const scholarship = await Scholarship.findById(id);

  if (!scholarship) {
    throw new NotFoundError('Scholarship not found.');
  }

  // Only provider who created it or admin can update
  if (scholarship.providerId.toString() !== userId.toString() && userRole !== 'admin') {
    throw new ForbiddenError('You can only update your own scholarships.');
  }

  Object.assign(scholarship, data);
  // Reset status if provider updates (needs re-approval)
  if (userRole !== 'admin') {
    scholarship.status = 'pending';
  }
  await scholarship.save();

  await createAuditLog({
    action: 'scholarship.update',
    userId,
    targetId: scholarship._id,
    targetModel: 'Scholarship',
    metadata: { changes: Object.keys(data) },
    req,
  });

  return scholarship;
};

const deleteScholarship = async (id, userId, userRole, req) => {
  const scholarship = await Scholarship.findById(id);

  if (!scholarship) {
    throw new NotFoundError('Scholarship not found.');
  }

  if (scholarship.providerId.toString() !== userId.toString() && userRole !== 'admin') {
    throw new ForbiddenError('You can only delete your own scholarships.');
  }

  // Soft delete
  scholarship.isDeleted = true;
  scholarship.deletedAt = new Date();
  await scholarship.save({ validateBeforeSave: false });

  await createAuditLog({
    action: 'scholarship.delete',
    userId,
    targetId: scholarship._id,
    targetModel: 'Scholarship',
    metadata: { title: scholarship.title },
    req,
  });

  return scholarship;
};

const getFeaturedScholarships = async (limit = 6) => {
  return Scholarship.find({
    isFeatured: true,
    status: 'approved',
    deadline: { $gte: new Date() },
  })
    .sort('-createdAt')
    .limit(limit)
    .populate('providerId', 'name profile.avatar');
};

const getRecommendations = async (user, limit = 8) => {
  const query = {
    status: 'approved',
    deadline: { $gte: new Date() },
  };

  // Match based on user profile
  const orConditions = [];
  if (user.profile?.country) {
    orConditions.push({ country: { $regex: user.profile.country, $options: 'i' } });
  }
  if (user.profile?.educationLevel) {
    orConditions.push({ level: user.profile.educationLevel });
    orConditions.push({ level: 'any' });
  }
  if (user.profile?.fieldOfStudy) {
    orConditions.push({ field: { $regex: user.profile.fieldOfStudy, $options: 'i' } });
  }
  if (user.profile?.interests?.length > 0) {
    orConditions.push({ tags: { $in: user.profile.interests } });
  }

  if (orConditions.length > 0) {
    query.$or = orConditions;
  }

  const scholarships = await Scholarship.find(query)
    .sort('-isFeatured -createdAt')
    .limit(limit)
    .populate('providerId', 'name profile.avatar');

  // Simple scoring
  return scholarships.map((s) => {
    let score = 0;
    const scholarship = s.toObject();

    if (user.profile?.country && scholarship.country?.toLowerCase().includes(user.profile.country.toLowerCase())) score += 3;
    if (user.profile?.educationLevel && (scholarship.level === user.profile.educationLevel || scholarship.level === 'any')) score += 2;
    if (user.profile?.fieldOfStudy && scholarship.field?.toLowerCase().includes(user.profile.fieldOfStudy.toLowerCase())) score += 2;
    if (scholarship.isFeatured) score += 1;

    return { ...scholarship, matchScore: score };
  }).sort((a, b) => b.matchScore - a.matchScore);
};

const getProviderScholarships = async (providerId, queryString) => {
  const features = new APIFeatures(
    Scholarship.find({ providerId }).setOptions({ skipIsDeletedFilter: false }),
    queryString
  )
    .sort()
    .paginate();

  await features.countDocuments();
  const scholarships = await features.query;

  return {
    scholarships,
    pagination: {
      page: features.page,
      limit: features.limit,
      total: features.totalDocs,
      pages: Math.ceil(features.totalDocs / features.limit),
    },
  };
};

module.exports = {
  createScholarship,
  getScholarships,
  getScholarshipById,
  getScholarshipBySlug,
  updateScholarship,
  deleteScholarship,
  getFeaturedScholarships,
  getRecommendations,
  getProviderScholarships,
};
