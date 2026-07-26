const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { protect } = require('../middlewares/auth');
const {
  validate,
  registerSchema,
  loginSchema,
  googleAuthSchema,
  verifyEmailSchema,
  resendVerificationSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  updateProfileSchema,
} = require('../middlewares/validate');
const upload = require('../middlewares/upload');
const { uploadToCloudinary } = require('../utils/cloudinary');
const catchAsync = require('../utils/catchAsync');

// Public routes
router.post('/register', validate(registerSchema), authController.register);
router.post('/verify-email', validate(verifyEmailSchema), authController.verifyEmail);
router.post('/resend-verification', validate(resendVerificationSchema), authController.resendVerification);
router.post('/login', validate(loginSchema), authController.login);
router.post('/google', validate(googleAuthSchema), authController.googleAuth);
router.post('/forgot-password', validate(forgotPasswordSchema), authController.forgotPassword);
router.post('/reset-password', validate(resetPasswordSchema), authController.resetPassword);
router.post('/refresh', authController.refreshToken);
// Public so the refresh cookie is always cleared, even if the access token already expired
router.post('/logout', authController.logout);

// Protected routes
router.use(protect);
router.get('/me', authController.getMe);
router.patch('/profile', validate(updateProfileSchema), authController.updateProfile);
router.post('/save-scholarship/:scholarshipId', authController.saveScholarship);

router.post('/avatar', upload.single('avatar'), catchAsync(async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ status: 'fail', message: 'No file uploaded.' });
  }

  if (!req.file.mimetype?.startsWith('image/')) {
    return res.status(400).json({ status: 'fail', message: 'Please upload an image (JPG, PNG, or WEBP).' });
  }

  const result = await uploadToCloudinary(req.file.buffer, {
    folder: 'afriror/avatars',
    mimetype: req.file.mimetype,
    filename: req.file.originalname,
    transformation: [{ width: 200, height: 200, crop: 'fill' }],
  });

  const User = require('../models/User');
  const user = await User.findById(req.user._id);
  user.profile.avatar = result.secure_url;
  await user.save({ validateBeforeSave: false });

  res.status(200).json({
    status: 'success',
    data: { avatar: result.secure_url },
  });
}));

module.exports = router;
