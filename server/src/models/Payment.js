const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    stripeCustomerId: {
      type: String,
      required: true,
    },
    subscriptionId: {
      type: String,
    },
    plan: {
      type: String,
      enum: ['free', 'premium_monthly', 'premium_yearly'],
      required: true,
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'past_due', 'cancelled', 'trialing', 'failed'],
      default: 'inactive',
    },
    amount: {
      type: Number,
    },
    currency: {
      type: String,
      default: 'usd',
    },
    interval: {
      type: String,
      enum: ['month', 'year'],
    },
    currentPeriodStart: { type: Date },
    currentPeriodEnd: { type: Date },
    cancelAtPeriodEnd: { type: Boolean, default: false },
    cancelledAt: { type: Date },
    // Payment history
    invoices: [{
      invoiceId: String,
      amount: Number,
      status: String,
      paidAt: Date,
      invoiceUrl: String,
    }],
    // Metadata
    lastPaymentError: { type: String },
    failedPaymentCount: { type: Number, default: 0 },
  },
  {
    timestamps: true,
  }
);

paymentSchema.index({ userId: 1 });
paymentSchema.index({ stripeCustomerId: 1 });
paymentSchema.index({ subscriptionId: 1 });

module.exports = mongoose.model('Payment', paymentSchema);
