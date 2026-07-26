/**
 * Normalize public scholarship list query params to match the Scholarship schema.
 * Maps marketing URL aliases (undergraduate, postdoctoral, deadline=q1) → Mongo filters.
 */
const LEVEL_ALIASES = {
  undergraduate: 'bachelors',
  bachelor: 'bachelors',
  bachelors: 'bachelors',
  masters: 'masters',
  master: 'masters',
  phd: 'phd',
  doctoral: 'phd',
  doctorate: 'phd',
  postdoctoral: 'postdoc',
  postdoc: 'postdoc',
  'high-school': 'high-school',
  any: 'any',
};

const quarterRange = (quarter) => {
  const year = new Date().getFullYear();
  const ranges = {
    q1: [new Date(Date.UTC(year, 0, 1)), new Date(Date.UTC(year, 3, 0, 23, 59, 59, 999))],
    q2: [new Date(Date.UTC(year, 3, 1)), new Date(Date.UTC(year, 6, 0, 23, 59, 59, 999))],
    q3: [new Date(Date.UTC(year, 6, 1)), new Date(Date.UTC(year, 9, 0, 23, 59, 59, 999))],
    q4: [new Date(Date.UTC(year, 9, 1)), new Date(Date.UTC(year, 12, 0, 23, 59, 59, 999))],
  };
  return ranges[quarter] || null;
};

const mergeDeadlineBounds = (q, gte, lte) => {
  const current = q.deadline && typeof q.deadline === 'object' ? { ...q.deadline } : {};
  if (gte) current.gte = gte;
  if (lte) current.lte = lte;
  q.deadline = current;
};

const normalizeScholarshipQuery = (queryString = {}) => {
  const q = { ...queryString };

  // Level aliases from nav / marketing links
  if (q.level) {
    const raw = String(q.level).toLowerCase().trim();
    if (raw === 'training') {
      delete q.level;
      if (!q.search && !q.keyword) q.search = 'training';
    } else if (LEVEL_ALIASES[raw]) {
      q.level = LEVEL_ALIASES[raw];
    }
  }

  // Deadline quarters: ?deadline=q1|q2|q3|q4
  if (typeof q.deadline === 'string' && /^q[1-4]$/i.test(q.deadline)) {
    const range = quarterRange(String(q.deadline).toLowerCase());
    if (range) {
      mergeDeadlineBounds(q, range[0].toISOString(), range[1].toISOString());
    } else {
      delete q.deadline;
    }
  } else if (typeof q.deadline === 'string' && q.deadline.toLowerCase() === 'soon') {
    const now = new Date();
    const in30 = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    mergeDeadlineBounds(q, now.toISOString(), in30.toISOString());
  }

  // Closing soon: next 30 days
  if (q.closing === 'soon') {
    const now = new Date();
    const in30 = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    mergeDeadlineBounds(q, now.toISOString(), in30.toISOString());
    delete q.closing;
  }

  // Open only (not expired)
  if (q.open === '1' || q.open === 'true') {
    mergeDeadlineBounds(q, new Date().toISOString(), undefined);
    delete q.open;
  }

  if (q.sort === 'deadline' || q.sort === 'deadlineAsc') {
    q.sort = 'deadline';
  }

  return q;
};

module.exports = { normalizeScholarshipQuery, LEVEL_ALIASES };
