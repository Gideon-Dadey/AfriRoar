const stripe = require('stripe');
const config = require('../config');
const User = require('../models/User');
const Payment = require('../models/Payment');
const { BadRequestError, NotFoundError } = require('../utils/errors');
const { createAuditLog } = require('../utils/auditLog');
const logger = require('../utils/logger');

const stripeClient = config.stripe.secretKey ? stripe(config.stripe.secretKey) : null;

const PLANS = {
  premium_monthly: {
    priceId: config.stripe.priceMonthly,
    name: 'Premium Monthly',
    interval: 'month',
  },
  premium_yearly: {
    priceId: config.stripe.priceYearly,
    name: 'Premium Yearly',
    interval: 'year',
  },
};

const createCheckoutSession = async (userId, plan, req) => {
  if (!stripeClient) {
    throw new BadRequestError('Payment service is not configured.');
  }

  const planConfig = PLANS[plan];
  if (!planConfig) {
    throw new BadRequestError('Invalid plan selected.');
  }

  const user = await User.findById(userId);
  if (!user) {
    throw new NotFoundError('User not found.');
  }

  // Create or get Stripe customer
  let stripeCustomerId = user.stripeCustomerId;
  if (!stripeCustomerId) {
    const customer = await stripeClient.customers.create({
      email: user.email,
      name: user.name,
      metadata: { userId: user._id.toString() },
    });
    stripeCustomerId = customer.id;
    user.stripeCustomerId = stripeCustomerId;
    await user.save({ validateBeforeSave: false });
  }

  // Create checkout session
  const session = await stripeClient.checkout.sessions.create({
    customer: stripeCustomerId,
    payment_method_types: ['card'],
    line_items: [
      {
        price: planConfig.priceId,
        quantity: 1,
      },
    ],
    mode: 'subscription',
    success_url: `${config.clientUrl}/dashboard?payment=success`,
    cancel_url: `${config.clientUrl}/pricing?payment=cancelled`,
    metadata: {
      userId: user._id.toString(),
      plan,
    },
  });

  await createAuditLog({
    action: 'payment.subscribe',
    userId: user._id,
    metadata: { plan, sessionId: session.id },
    req,
  });

  return { sessionId: session.id, url: session.url };
};

const handleWebhook = async (event) => {
  if (!stripeClient) return;

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object;
      await handleCheckoutCompleted(session);
      break;
    }
    case 'invoice.payment_succeeded': {
      const invoice = event.data.object;
      await handlePaymentSucceeded(invoice);
      break;
    }
    case 'invoice.payment_failed': {
      const invoice = event.data.object;
      await handlePaymentFailed(invoice);
      break;
    }
    case 'customer.subscription.updated': {
      const subscription = event.data.object;
      await handleSubscriptionUpdated(subscription);
      break;
    }
    case 'customer.subscription.deleted': {
      const subscription = event.data.object;
      await handleSubscriptionDeleted(subscription);
      break;
    }
    default:
      logger.info(`Unhandled Stripe event: ${event.type}`);
  }
};

const handleCheckoutCompleted = async (session) => {
  const userId = session.metadata.userId;
  const plan = session.metadata.plan;

  const subscription = await stripeClient.subscriptions.retrieve(session.subscription);

  const user = await User.findById(userId);
  if (user) {
    user.subscriptionId = session.subscription;
    user.subscriptionPlan = plan;
    user.subscriptionStatus = 'active';
    user.subscriptionEndDate = new Date(subscription.current_period_end * 1000);
    await user.save({ validateBeforeSave: false });
  }

  // Create or update payment record
  await Payment.findOneAndUpdate(
    { userId },
    {
      userId,
      stripeCustomerId: session.customer,
      subscriptionId: session.subscription,
      plan,
      status: 'active',
      amount: session.amount_total / 100,
      currency: session.currency,
      interval: PLANS[plan]?.interval,
      currentPeriodStart: new Date(subscription.current_period_start * 1000),
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
    },
    { upsert: true, new: true }
  );

  logger.info(`Subscription activated for user ${userId}: ${plan}`);
};

const handlePaymentSucceeded = async (invoice) => {
  const payment = await Payment.findOne({ stripeCustomerId: invoice.customer });
  if (payment) {
    payment.invoices.push({
      invoiceId: invoice.id,
      amount: invoice.amount_paid / 100,
      status: 'paid',
      paidAt: new Date(),
      invoiceUrl: invoice.hosted_invoice_url,
    });
    payment.status = 'active';
    payment.failedPaymentCount = 0;
    await payment.save();

    await User.findByIdAndUpdate(payment.userId, {
      subscriptionStatus: 'active',
    });
  }
};

const handlePaymentFailed = async (invoice) => {
  const payment = await Payment.findOne({ stripeCustomerId: invoice.customer });
  if (payment) {
    payment.status = 'past_due';
    payment.failedPaymentCount += 1;
    payment.lastPaymentError = invoice.last_payment_error?.message || 'Payment failed';
    await payment.save();

    await User.findByIdAndUpdate(payment.userId, {
      subscriptionStatus: 'past_due',
    });

    await createAuditLog({
      action: 'payment.failed',
      userId: payment.userId,
      metadata: { error: payment.lastPaymentError, attemptCount: payment.failedPaymentCount },
    });
  }
};

const handleSubscriptionUpdated = async (subscription) => {
  const payment = await Payment.findOne({ subscriptionId: subscription.id });
  if (payment) {
    payment.currentPeriodStart = new Date(subscription.current_period_start * 1000);
    payment.currentPeriodEnd = new Date(subscription.current_period_end * 1000);
    payment.cancelAtPeriodEnd = subscription.cancel_at_period_end;
    payment.status = subscription.status;
    await payment.save();

    await User.findByIdAndUpdate(payment.userId, {
      subscriptionStatus: subscription.status,
      subscriptionEndDate: new Date(subscription.current_period_end * 1000),
    });
  }
};

const handleSubscriptionDeleted = async (subscription) => {
  const payment = await Payment.findOne({ subscriptionId: subscription.id });
  if (payment) {
    payment.status = 'cancelled';
    payment.cancelledAt = new Date();
    await payment.save();

    await User.findByIdAndUpdate(payment.userId, {
      subscriptionPlan: 'free',
      subscriptionStatus: 'inactive',
      subscriptionId: null,
    });

    await createAuditLog({
      action: 'payment.cancel',
      userId: payment.userId,
      metadata: { subscriptionId: subscription.id },
    });
  }
};

const cancelSubscription = async (userId, req) => {
  if (!stripeClient) {
    throw new BadRequestError('Payment service is not configured.');
  }

  const user = await User.findById(userId);
  if (!user?.subscriptionId) {
    throw new BadRequestError('No active subscription found.');
  }

  await stripeClient.subscriptions.update(user.subscriptionId, {
    cancel_at_period_end: true,
  });

  const payment = await Payment.findOne({ userId });
  if (payment) {
    payment.cancelAtPeriodEnd = true;
    await payment.save();
  }

  await createAuditLog({
    action: 'payment.cancel',
    userId,
    metadata: { subscriptionId: user.subscriptionId },
    req,
  });

  return { message: 'Subscription will be cancelled at the end of the billing period.' };
};

const getSubscriptionStatus = async (userId) => {
  const payment = await Payment.findOne({ userId }).sort('-updatedAt');
  const user = await User.findById(userId);

  return {
    plan: user?.subscriptionPlan || 'free',
    status: user?.subscriptionStatus || 'inactive',
    isPremium: user?.isPremium || false,
    currentPeriodEnd: payment?.currentPeriodEnd,
    cancelAtPeriodEnd: payment?.cancelAtPeriodEnd || false,
    invoices: payment?.invoices?.slice(-5) || [],
  };
};

module.exports = {
  createCheckoutSession,
  handleWebhook,
  cancelSubscription,
  getSubscriptionStatus,
  PLANS,
};
