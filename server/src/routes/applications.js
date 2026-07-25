const express = require('express');
const router = express.Router();
const applicationController = require('../controllers/applicationController');
const { protect, restrictTo } = require('../middlewares/auth');
const upload = require('../middlewares/upload');

router.use(protect);

// Student routes
router.post('/', applicationController.create);
router.get('/', applicationController.getAll);
router.get('/:id', applicationController.getById);
router.patch('/:id', applicationController.update);
router.post('/:id/submit', applicationController.submit);
router.post('/:id/withdraw', applicationController.withdraw);
router.post('/:id/documents', upload.array('documents', 5), applicationController.uploadDocuments);

// Provider routes
router.get('/scholarship/:scholarshipId/applicants', restrictTo('provider', 'admin'), applicationController.getApplicants);
router.patch('/:id/status', restrictTo('provider', 'admin'), applicationController.updateStatus);

module.exports = router;
