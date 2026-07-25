const paymentService = require('../services/paymentService');
const catchAsync = require('../utils/catchAsync');
const config = require('../config');

const createCheckout = catchAsync(async (req, res) => {
  const { plan } = req.body;
  const result = await paymentService.createCheckoutSession(req.user._id, plan, req);
  res.status(200).json({
    status: 'success',
    data: result,
  });
});

const webhook = catchAsync(async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const stripe = require('stripe')(config.stripe.secretKey);

  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, config.stripe.webhookSecret);
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  await paymentService.handleWebhook(event);

  res.status(200).json({ received: true });
});

const cancelSubscription = catchAsync(async (req, res) => {
  const result = await paymentService.cancelSubscription(req.user._id, req);
  res.status(200).json({
    status: 'success',
    data: result,
  });
});

const getSubscription = catchAsync(async (req, res) => {
  const result = await paymentService.getSubscriptionStatus(req.user._id);
  res.status(200).json({
    status: 'success',
    data: result,
  });
});

module.exports = {
  createCheckout,
  webhook,
  cancelSubscription,
  getSubscription,
};
