const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const { protect } = require('../middlewares/auth');

// Webhook (must be before body parser - handled in main app)
router.post('/webhook', express.raw({ type: 'application/json' }), paymentController.webhook);

// Protected routes
router.use(protect);
router.post('/checkout', paymentController.createCheckout);
router.post('/cancel', paymentController.cancelSubscription);
router.get('/subscription', paymentController.getSubscription);

module.exports = router;
