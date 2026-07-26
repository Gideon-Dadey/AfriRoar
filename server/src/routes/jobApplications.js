const express = require('express');
const router = express.Router();
const jobApplicationController = require('../controllers/jobApplicationController');
const { protect } = require('../middlewares/auth');
const upload = require('../middlewares/upload');

router.use(protect);

router.get('/', jobApplicationController.getMine);
router.post('/', jobApplicationController.create);
router.get('/:id', jobApplicationController.getOne);
router.patch('/:id', jobApplicationController.update);
router.post('/:id/documents', upload.array('documents', 5), jobApplicationController.uploadDocuments);
router.delete('/:id/documents/:docIndex', jobApplicationController.removeDocument);
router.post('/:id/submit', jobApplicationController.submit);
router.post('/:id/withdraw', jobApplicationController.withdraw);

module.exports = router;
