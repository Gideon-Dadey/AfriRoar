const express = require('express');
const router = express.Router();
const scholarshipController = require('../controllers/scholarshipController');
const { protect, restrictTo, optionalAuth, premiumOnly } = require('../middlewares/auth');
const { validate, createScholarshipSchema, updateScholarshipSchema } = require('../middlewares/validate');

// Public routes
router.get('/featured', scholarshipController.getFeatured);
router.get('/slug/:slug', scholarshipController.getBySlug);
router.get('/', optionalAuth, scholarshipController.getAll);
router.get('/:id', scholarshipController.getById);

// Protected routes
router.use(protect);

// Student routes
router.get('/user/recommendations', scholarshipController.getRecommendations);

// Provider routes
router.get('/provider/my-listings', restrictTo('provider', 'admin'), scholarshipController.getMyScholarships);
router.post('/', restrictTo('provider', 'admin'), validate(createScholarshipSchema), scholarshipController.create);
router.put('/:id', restrictTo('provider', 'admin'), validate(updateScholarshipSchema), scholarshipController.update);
router.delete('/:id', restrictTo('provider', 'admin'), scholarshipController.remove);

module.exports = router;
