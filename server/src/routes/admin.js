const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { protect, restrictTo } = require('../middlewares/auth');
const {
  validate,
  adminScholarshipSchema,
  updateScholarshipSchema,
  adminJobSchema,
  updateJobSchema,
  contentSchema,
  updateContentSchema,
} = require('../middlewares/validate');
const upload = require('../middlewares/upload');
const jobController = require('../controllers/jobController');
const jobApplicationController = require('../controllers/jobApplicationController');

router.use(protect, restrictTo('admin'));

// Users
router.get('/users', adminController.getUsers);
router.patch('/users/:id/suspend', adminController.suspendUser);
router.patch('/users/:id/unsuspend', adminController.unsuspendUser);

// Scholarships
router.get('/scholarships', adminController.getScholarships);
router.get('/scholarships/pending', adminController.getPendingScholarships);
router.post('/scholarships', validate(adminScholarshipSchema), adminController.createScholarship);
router.put('/scholarships/:id', validate(updateScholarshipSchema), adminController.updateScholarship);
router.delete('/scholarships/:id', adminController.deleteScholarship);
router.post(
  '/scholarships/:id/cover',
  upload.single('cover'),
  adminController.uploadScholarshipCover,
);
router.patch('/scholarships/:id/approve', adminController.approveScholarship);
router.patch('/scholarships/:id/reject', adminController.rejectScholarship);
router.patch('/scholarships/:id/feature', adminController.featureScholarship);

// Jobs
router.get('/jobs', jobController.adminList);
router.get('/jobs/:id', jobController.adminGet);
router.post('/jobs', validate(adminJobSchema), jobController.adminCreate);
router.put('/jobs/:id', validate(updateJobSchema), jobController.adminUpdate);
router.delete('/jobs/:id', jobController.adminDelete);
router.patch('/jobs/:id/feature', jobController.adminFeature);
router.post('/jobs/:id/cover', upload.single('cover'), jobController.adminUploadCover);

// Job applications
router.get('/job-applications', jobApplicationController.adminList);
router.get('/job-applications/:id', jobApplicationController.adminGet);
router.patch('/job-applications/:id/status', jobApplicationController.adminUpdateStatus);

// Applications
router.get('/applications', adminController.getApplications);
router.get('/applications/:id', adminController.getApplication);

// Content CMS (guides, internships, lists, jobs)
router.get('/content', adminController.getContents);
router.get('/content/:id', adminController.getContent);
router.post('/content', validate(contentSchema), adminController.createContent);
router.put('/content/:id', validate(updateContentSchema), adminController.updateContent);
router.delete('/content/:id', adminController.deleteContent);
router.post('/content/:id/cover', upload.single('cover'), adminController.uploadContentCover);

// Analytics + activity
router.get('/analytics', adminController.getAnalytics);
router.get('/audit-logs', adminController.getAuditLogs);

module.exports = router;
