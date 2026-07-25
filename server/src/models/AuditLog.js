const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema(
  {
    action: {
      type: String,
      required: true,
      enum: [
        'user.register',
        'user.login',
        'user.logout',
        'user.update',
        'user.suspend',
        'user.unsuspend',
        'user.delete',
        'scholarship.create',
        'scholarship.update',
        'scholarship.delete',
        'scholarship.approve',
        'scholarship.reject',
        'scholarship.feature',
        'application.create',
        'application.submit',
        'application.update',
        'application.accept',
        'application.reject',
        'application.withdraw',
        'payment.subscribe',
        'payment.cancel',
        'payment.renew',
        'payment.failed',
        'admin.action',
      ],
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    targetId: {
      type: mongoose.Schema.Types.ObjectId,
    },
    targetModel: {
      type: String,
      enum: ['User', 'Scholarship', 'Application', 'Payment'],
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    ipAddress: { type: String },
    userAgent: { type: String },
  },
  {
    timestamps: true,
  }
);

auditLogSchema.index({ action: 1 });
auditLogSchema.index({ userId: 1 });
auditLogSchema.index({ createdAt: -1 });

module.exports = mongoose.model('AuditLog', auditLogSchema);
