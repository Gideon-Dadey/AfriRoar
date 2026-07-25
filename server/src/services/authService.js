const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const config = require('../config');
const { UnauthorizedError, ConflictError, BadRequestError } = require('../utils/errors');
const { sendEmail, templates } = require('../utils/email');
const { createAuditLog } = require('../utils/auditLog');
const logger = require('../utils/logger');

const CODE_TTL_MS = 15 * 60 * 1000;

const generateTokens = (userId) => {
  const accessToken = jwt.sign({ id: userId }, config.jwt.secret, {
    expiresIn: config.jwt.expire,
  });
  const refreshToken = jwt.sign({ id: userId }, config.jwt.refreshSecret, {
    expiresIn: config.jwt.refreshExpire,
  });
  return { accessToken, refreshToken };
};

const createVerificationCode = () => String(crypto.randomInt(100000, 999999));

const assignVerificationCode = async (user) => {
  const code = createVerificationCode();
  user.emailVerificationCode = code;
  user.emailVerificationExpires = new Date(Date.now() + CODE_TTL_MS);
  await user.save({ validateBeforeSave: false });

  const emailTemplate = templates.emailVerification(user.name, code);
  await sendEmail({ to: user.email, ...emailTemplate });

  logger.info(`Verification code generated for ${user.email}${config.env === 'development' ? `: ${code}` : ''}`);

  return {
    code: config.env === 'development' ? code : undefined,
  };
};

const register = async ({ name, email, password, role = 'student' }, req) => {
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    if (!existingUser.isEmailVerified) {
      const { code } = await assignVerificationCode(existingUser);
      return {
        requiresVerification: true,
        email: existingUser.email,
        message: 'Account already exists but is not verified. A new verification code has been sent.',
        devCode: code,
      };
    }
    throw new ConflictError('An account with this email already exists.');
  }

  const user = await User.create({
    name,
    email,
    password,
    role,
    isEmailVerified: false,
  });

  const { code } = await assignVerificationCode(user);

  await createAuditLog({
    action: 'user.register',
    userId: user._id,
    targetId: user._id,
    targetModel: 'User',
    metadata: { role, pendingVerification: true },
    req,
  });

  return {
    requiresVerification: true,
    email: user.email,
    message: 'Account created. Please verify your email with the code we sent you.',
    devCode: code,
  };
};

const verifyEmail = async ({ email, code }, req) => {
  const user = await User.findOne({ email }).select('+emailVerificationCode +emailVerificationExpires');

  if (!user) {
    throw new BadRequestError('Invalid email or verification code.');
  }

  if (user.isEmailVerified) {
    return { alreadyVerified: true, email: user.email, message: 'Email is already verified. You can log in.' };
  }

  if (
    !user.emailVerificationCode ||
    !user.emailVerificationExpires ||
    user.emailVerificationExpires.getTime() < Date.now()
  ) {
    throw new BadRequestError('Verification code has expired. Please request a new one.');
  }

  if (String(user.emailVerificationCode) !== String(code).trim()) {
    throw new BadRequestError('Invalid verification code.');
  }

  user.isEmailVerified = true;
  user.emailVerificationCode = undefined;
  user.emailVerificationExpires = undefined;
  await user.save({ validateBeforeSave: false });

  const welcome = templates.welcome(user.name);
  sendEmail({ to: user.email, ...welcome });

  await createAuditLog({
    action: 'user.email_verified',
    userId: user._id,
    targetId: user._id,
    targetModel: 'User',
    req,
  });

  return {
    email: user.email,
    message: 'Email verified successfully. You can now log in.',
  };
};

const resendVerificationCode = async ({ email }) => {
  const user = await User.findOne({ email });
  if (!user) {
    // Do not leak account existence
    return { message: 'If an account exists for this email, a verification code has been sent.' };
  }

  if (user.isEmailVerified) {
    throw new BadRequestError('Email is already verified. Please log in.');
  }

  const { code } = await assignVerificationCode(user);

  return {
    message: 'A new verification code has been sent to your email.',
    email: user.email,
    devCode: code,
  };
};

const login = async ({ email, password }, req) => {
  const user = await User.findOne({ email }).select('+password +refreshToken');

  if (!user || !(await user.comparePassword(password))) {
    throw new UnauthorizedError('Invalid email or password.');
  }

  if (user.isSuspended) {
    throw new UnauthorizedError('Your account has been suspended. Contact support.');
  }

  if (!user.isEmailVerified) {
    const err = new UnauthorizedError('Please verify your email before logging in.');
    err.code = 'EMAIL_NOT_VERIFIED';
    err.email = user.email;
    throw err;
  }

  const { accessToken, refreshToken } = generateTokens(user._id);

  user.refreshToken = refreshToken;
  user.lastLogin = new Date();
  await user.save({ validateBeforeSave: false });

  await createAuditLog({
    action: 'user.login',
    userId: user._id,
    targetId: user._id,
    targetModel: 'User',
    req,
  });

  user.password = undefined;
  user.refreshToken = undefined;

  return { user, accessToken, refreshToken };
};

const refreshAccessToken = async (token) => {
  if (!token) {
    throw new UnauthorizedError('No refresh token provided.');
  }

  const decoded = jwt.verify(token, config.jwt.refreshSecret);
  const user = await User.findById(decoded.id).select('+refreshToken');

  if (!user || user.refreshToken !== token) {
    throw new UnauthorizedError('Invalid refresh token.');
  }

  if (!user.isEmailVerified) {
    throw new UnauthorizedError('Please verify your email before continuing.');
  }

  const { accessToken, refreshToken } = generateTokens(user._id);

  user.refreshToken = refreshToken;
  await user.save({ validateBeforeSave: false });

  return { accessToken, refreshToken };
};

const logout = async (userId, req) => {
  await User.findByIdAndUpdate(userId, { refreshToken: null });

  await createAuditLog({
    action: 'user.logout',
    userId,
    targetId: userId,
    targetModel: 'User',
    req,
  });
};

module.exports = {
  register,
  login,
  verifyEmail,
  resendVerificationCode,
  refreshAccessToken,
  logout,
  generateTokens,
};
