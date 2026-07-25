const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    type: {
      type: String,
      enum: [
        'application_submitted',
        'application_accepted',
        'application_rejected',
        'application_review',
        'new_scholarship',
        'scholarship_approved',
        'scholarship_rejected',
        'scholarship_expiring',
        'payment_success',
        'payment_failed',
        'account_suspended',
        'recommendation',
        'system',
      ],
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    link: { type: String },
    read: {
      type: Boolean,
      default: false,
    },
    readAt: { type: Date },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

notificationSchema.index({ userId: 1, read: 1 });
notificationSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);
