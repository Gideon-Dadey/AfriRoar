const authService = require('../services/authService');
const User = require('../models/User');
const catchAsync = require('../utils/catchAsync');
const config = require('../config');

const cookieOptions = {
  httpOnly: true,
  secure: config.env === 'production',
  sameSite: config.env === 'production' ? 'none' : 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

const register = catchAsync(async (req, res) => {
  const result = await authService.register(req.body, req);

  res.status(201).json({
    status: 'success',
    data: result,
  });
});

const verifyEmail = catchAsync(async (req, res) => {
  const result = await authService.verifyEmail(req.body, req);
  res.status(200).json({
    status: 'success',
    data: result,
  });
});

const resendVerification = catchAsync(async (req, res) => {
  const result = await authService.resendVerificationCode(req.body);
  res.status(200).json({
    status: 'success',
    data: result,
  });
});

const login = catchAsync(async (req, res) => {
  try {
    const { user, accessToken, refreshToken } = await authService.login(req.body, req);

    res.cookie('refreshToken', refreshToken, cookieOptions);

    res.status(200).json({
      status: 'success',
      data: { user, accessToken },
    });
  } catch (error) {
    if (error.code === 'EMAIL_NOT_VERIFIED') {
      return res.status(403).json({
        status: 'fail',
        code: 'EMAIL_NOT_VERIFIED',
        message: error.message,
        data: { email: error.email },
      });
    }
    throw error;
  }
});

const googleAuth = catchAsync(async (req, res) => {
  const { user, accessToken, refreshToken, isNewUser } = await authService.loginWithGoogle(
    req.body,
    req,
  );

  res.cookie('refreshToken', refreshToken, cookieOptions);

  res.status(isNewUser ? 201 : 200).json({
    status: 'success',
    data: { user, accessToken, isNewUser },
  });
});

const refreshToken = catchAsync(async (req, res) => {
  const token = req.cookies.refreshToken || req.body.refreshToken;

  const { accessToken, refreshToken: newRefreshToken } = await authService.refreshAccessToken(token);

  res.cookie('refreshToken', newRefreshToken, cookieOptions);

  res.status(200).json({
    status: 'success',
    data: { accessToken },
  });
});

const logout = catchAsync(async (req, res) => {
  await authService.logout(req.user._id, req);

  res.clearCookie('refreshToken');

  res.status(200).json({
    status: 'success',
    message: 'Logged out successfully.',
  });
});

const getMe = catchAsync(async (req, res) => {
  const user = await User.findById(req.user._id)
    .populate('savedScholarships', 'title slug country level deadline coverImage');

  res.status(200).json({
    status: 'success',
    data: { user },
  });
});

const updateProfile = catchAsync(async (req, res) => {
  const { name, profile } = req.body;

  const user = await User.findById(req.user._id);
  if (name) user.name = name;
  if (profile) {
    Object.assign(user.profile, profile);
  }
  await user.save();

  res.status(200).json({
    status: 'success',
    data: { user },
  });
});

const saveScholarship = catchAsync(async (req, res) => {
  const { scholarshipId } = req.params;
  const user = await User.findById(req.user._id);

  const index = user.savedScholarships.indexOf(scholarshipId);
  if (index > -1) {
    user.savedScholarships.splice(index, 1);
  } else {
    user.savedScholarships.push(scholarshipId);
  }
  await user.save({ validateBeforeSave: false });

  const Scholarship = require('../models/Scholarship');
  await Scholarship.findByIdAndUpdate(scholarshipId, {
    $inc: { saveCount: index > -1 ? -1 : 1 },
  });

  res.status(200).json({
    status: 'success',
    data: {
      saved: index === -1,
      savedScholarships: user.savedScholarships,
    },
  });
});

module.exports = {
  register,
  verifyEmail,
  resendVerification,
  login,
  googleAuth,
  refreshToken,
  logout,
  getMe,
  updateProfile,
  saveScholarship,
};
