const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { protect } = require('../middlewares/auth');

router.use(protect);

router.get('/', adminController.getNotifications);
router.patch('/:id/read', adminController.markNotificationRead);
router.patch('/read-all', adminController.markAllRead);

module.exports = router;
