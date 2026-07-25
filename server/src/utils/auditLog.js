const AuditLog = require('../models/AuditLog');
const logger = require('./logger');

const createAuditLog = async ({ action, userId, targetId, targetModel, metadata, req }) => {
  try {
    await AuditLog.create({
      action,
      userId,
      targetId,
      targetModel,
      metadata,
      ipAddress: req?.ip || req?.connection?.remoteAddress,
      userAgent: req?.headers?.['user-agent'],
    });
  } catch (error) {
    logger.error('Audit log creation failed:', error.message);
  }
};

module.exports = { createAuditLog };
