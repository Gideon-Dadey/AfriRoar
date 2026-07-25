const jwt = require('jsonwebtoken');
const User = require('../models/User');
const config = require('../config');
const { UnauthorizedError, ForbiddenError } = require('../utils/errors');
const catchAsync = require('../utils/catchAsync');

// Protect routes - verify JWT
const protect = catchAsync(async (req, res, next) => {
  let token;

  // Get token from header or cookie
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies?.accessToken) {
    token = req.cookies.accessToken;
  }

  if (!token) {
    throw new UnauthorizedError('You are not logged in. Please log in to access this resource.');
  }

  // Verify token
  const decoded = jwt.verify(token, config.jwt.secret);

  // Check if user still exists
  const user = await User.findById(decoded.id).select('+password');
  if (!user) {
    throw new UnauthorizedError('The user belonging to this token no longer exists.');
  }

  // Check if user changed password after token was issued
  if (user.changedPasswordAfter(decoded.iat)) {
    throw new UnauthorizedError('User recently changed password. Please log in again.');
  }

  // Check if user is suspended
  if (user.isSuspended) {
    throw new ForbiddenError('Your account has been suspended. Contact support.');
  }

  req.user = user;
  next();
});

// Restrict to specific roles
const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      throw new ForbiddenError('You do not have permission to perform this action.');
    }
    next();
  };
};

// Optional auth - attach user if token exists but don't block
const optionalAuth = catchAsync(async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies?.accessToken) {
    token = req.cookies.accessToken;
  }

  if (token) {
    try {
      const decoded = jwt.verify(token, config.jwt.secret);
      req.user = await User.findById(decoded.id);
    } catch (err) {
      // Token invalid, continue without user
    }
  }

  next();
});

// Premium feature guard
const premiumOnly = (req, res, next) => {
  if (!req.user.isPremium && req.user.role !== 'admin') {
    throw new ForbiddenError('This feature requires a premium subscription. Upgrade to access.');
  }
  next();
};

module.exports = { protect, restrictTo, optionalAuth, premiumOnly };
