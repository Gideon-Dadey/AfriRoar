const Notification = require('../models/Notification');
const User = require('../models/User');
const Scholarship = require('../models/Scholarship');
const logger = require('../utils/logger');

const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * Notify students who saved a scholarship when its deadline is within 14 days.
 * Idempotent per user+scholarship+day window via metadata.key.
 */
const runDeadlineReminders = async () => {
  const now = new Date();
  const in14 = new Date(now.getTime() + 14 * DAY_MS);

  const closing = await Scholarship.find({
    status: 'approved',
    deadline: { $gte: now, $lte: in14 },
  })
    .select('_id title slug deadline')
    .lean();

  if (!closing.length) return { notified: 0 };

  let notified = 0;
  for (const scholarship of closing) {
    const daysLeft = Math.max(
      0,
      Math.ceil((new Date(scholarship.deadline).getTime() - now.getTime()) / DAY_MS)
    );
    const key = `deadline:${scholarship._id}:${now.toISOString().slice(0, 10)}`;

    const users = await User.find({
      savedScholarships: scholarship._id,
      isActive: true,
      isSuspended: { $ne: true },
    })
      .select('_id')
      .lean();

    for (const user of users) {
      const exists = await Notification.exists({
        userId: user._id,
        type: 'scholarship_expiring',
        'metadata.key': key,
      });
      if (exists) continue;

      await Notification.create({
        userId: user._id,
        type: 'scholarship_expiring',
        title: 'Deadline approaching',
        message:
          daysLeft === 0
            ? `"${scholarship.title}" closes today. Finish your application if you plan to apply.`
            : `"${scholarship.title}" closes in ${daysLeft} day${daysLeft === 1 ? '' : 's'}.`,
        link: `/scholarships/${scholarship.slug}`,
        metadata: { key, scholarshipId: String(scholarship._id), daysLeft },
      });
      notified += 1;
    }
  }

  if (notified > 0) {
    logger.info(`Deadline reminders: created ${notified} notification(s)`);
  }
  return { notified };
};

const startDeadlineReminderJob = () => {
  // Run once shortly after boot, then daily
  const kickoff = setTimeout(() => {
    runDeadlineReminders().catch((err) =>
      logger.warn(`Deadline reminder job failed: ${err.message}`)
    );
  }, 20_000);

  const interval = setInterval(() => {
    runDeadlineReminders().catch((err) =>
      logger.warn(`Deadline reminder job failed: ${err.message}`)
    );
  }, DAY_MS);

  if (typeof kickoff.unref === 'function') kickoff.unref();
  if (typeof interval.unref === 'function') interval.unref();
};

module.exports = { runDeadlineReminders, startDeadlineReminderJob };
