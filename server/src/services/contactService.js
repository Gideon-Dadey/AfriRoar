const config = require('../config');
const logger = require('../utils/logger');
const { sendEmail, templates } = require('../utils/email');
const { BadRequestError } = require('../utils/errors');

const TOPIC_LABELS = {
  account: 'Account & sign-in',
  application: 'Application help',
  listing: 'Listing correction',
  privacy: 'Privacy request',
  partnership: 'Partnership',
  other: 'Other',
};

/**
 * Accepts a public contact form submission.
 * Honeypot field `company` must be empty (bots fill hidden fields).
 */
const submitContact = async (body) => {
  const { name, email, topic, message, company } = body;

  // Silent success for bots - do not tip them off
  if (company && String(company).trim()) {
    logger.warn(`Contact honeypot triggered from ${email || 'unknown'}`);
    return {
      message: 'Thanks. Your message was received. We aim to reply within 2-3 business days.',
    };
  }

  const topicLabel = TOPIC_LABELS[topic] || topic;
  const supportTo = config.email.support || config.email.user;

  if (!supportTo) {
    throw new BadRequestError(
      'Contact email is not configured yet. Please try again later or email us directly.',
    );
  }

  const inbound = templates.contactMessage({
    name: name.trim(),
    email: email.trim().toLowerCase(),
    topic: topicLabel,
    message: message.trim(),
  });

  const result = await sendEmail({
    to: supportTo,
    replyTo: email.trim().toLowerCase(),
    ...inbound,
  });

  if (!result) {
    throw new BadRequestError('Could not send your message right now. Please try again shortly.');
  }

  if (result.skipped) {
    if (config.env === 'production') {
      throw new BadRequestError(
        'Contact email is temporarily unavailable. Please email us directly at afriroar.support@gmail.com.',
      );
    }
    logger.warn('Contact accepted but email skipped (SMTP not configured)');
  } else {
    // Best-effort acknowledgement; do not fail the request if this skips
    sendEmail({
      to: email.trim().toLowerCase(),
      ...templates.contactAcknowledgement(name.trim()),
    }).catch(() => {});
  }

  logger.info(`Contact message from ${email} topic=${topic}`);

  return {
    message: 'Thanks. Your message was received. We aim to reply within 2-3 business days.',
  };
};

module.exports = { submitContact, TOPIC_LABELS };
