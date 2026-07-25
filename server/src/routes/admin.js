const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { protect, restrictTo } = require('../middlewares/auth');

router.use(protect, restrictTo('admin'));

// Users
router.get('/users', adminController.getUsers);
router.patch('/users/:id/suspend', adminController.suspendUser);
router.patch('/users/:id/unsuspend', adminController.unsuspendUser);

// Scholarships moderation
router.get('/scholarships/pending', adminController.getPendingScholarships);
router.patch('/scholarships/:id/approve', adminController.approveScholarship);
router.patch('/scholarships/:id/reject', adminController.rejectScholarship);
router.patch('/scholarships/:id/feature', adminController.featureScholarship);

// Analytics
router.get('/analytics', adminController.getAnalytics);

// Audit logs
router.get('/audit-logs', adminController.getAuditLogs);

module.exports = router;
