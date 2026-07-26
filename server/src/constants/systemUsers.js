/** Accounts created for catalogue ownership — not real platform users. */
const SYSTEM_USER_EMAILS = ['provider@afriror.com'];

const systemUserFilter = {
  email: { $nin: SYSTEM_USER_EMAILS },
};

module.exports = {
  SYSTEM_USER_EMAILS,
  systemUserFilter,
};
