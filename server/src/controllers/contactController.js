const contactService = require('../services/contactService');
const NewsletterSubscriber = require('../models/NewsletterSubscriber');
const catchAsync = require('../utils/catchAsync');

const submit = catchAsync(async (req, res) => {
  const result = await contactService.submitContact(req.body);
  res.status(200).json({
    status: 'success',
    data: result,
  });
});

const subscribeNewsletter = catchAsync(async (req, res) => {
  // Honeypot — bots fill this; humans leave it empty
  if (req.body.company) {
    return res.status(200).json({ status: 'success', data: { subscribed: true } });
  }

  const email = String(req.body.email || '').trim().toLowerCase();
  const source = String(req.body.source || 'footer').slice(0, 40);

  await NewsletterSubscriber.findOneAndUpdate(
    { email },
    { email, source, isActive: true },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  res.status(200).json({
    status: 'success',
    data: { subscribed: true },
  });
});

module.exports = { submit, subscribeNewsletter };
