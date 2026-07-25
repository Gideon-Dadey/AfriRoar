const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const profileSchema = new mongoose.Schema({
  country: { type: String, default: '' },
  dateOfBirth: { type: Date },
  phone: { type: String, default: '' },
  bio: { type: String, default: '' },
  educationLevel: {
    type: String,
    enum: ['high-school', 'bachelors', 'masters', 'phd', 'postdoc', ''],
    default: '',
  },
  fieldOfStudy: { type: String, default: '' },
  institution: { type: String, default: '' },
  gpa: { type: Number, min: 0, max: 4.0 },
  interests: [{ type: String }],
  languages: [{ type: String }],
  resume: { type: String, default: '' }, // Cloudinary URL
  avatar: { type: String, default: '' }, // Cloudinary URL
}, { _id: false });

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [8, 'Password must be at least 8 characters'],
      select: false,
    },
    role: {
      type: String,
      enum: ['student', 'provider', 'admin'],
      default: 'student',
    },
    profile: {
      type: profileSchema,
      default: () => ({}),
    },
    profileCompletionScore: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    savedScholarships: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Scholarship',
    }],
    // Subscription
    stripeCustomerId: { type: String },
    subscriptionId: { type: String },
    subscriptionPlan: {
      type: String,
      enum: ['free', 'premium_monthly', 'premium_yearly'],
      default: 'free',
    },
    subscriptionStatus: {
      type: String,
      enum: ['active', 'inactive', 'past_due', 'cancelled', 'trialing'],
      default: 'inactive',
    },
    subscriptionEndDate: { type: Date },
    // Account status
    isActive: { type: Boolean, default: true },
    isSuspended: { type: Boolean, default: false },
    suspendedReason: { type: String },
    isEmailVerified: { type: Boolean, default: false },
    emailVerificationCode: { type: String, select: false },
    emailVerificationExpires: { type: Date, select: false },
    lastLogin: { type: Date },
    refreshToken: { type: String, select: false },
    passwordChangedAt: { type: Date },
    isDeleted: { type: Boolean, default: false },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes
userSchema.index({ email: 1 });
userSchema.index({ role: 1 });
userSchema.index({ 'profile.country': 1 });
userSchema.index({ subscriptionPlan: 1 });

// Hash password before saving
userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 12);
  this.passwordChangedAt = Date.now() - 1000;
});

// Calculate profile completion score
userSchema.pre('save', function () {
  if (this.role !== 'student') return;

  const fields = [
    this.name,
    this.email,
    this.profile?.country,
    this.profile?.dateOfBirth,
    this.profile?.phone,
    this.profile?.bio,
    this.profile?.educationLevel,
    this.profile?.fieldOfStudy,
    this.profile?.institution,
    this.profile?.avatar,
    this.profile?.interests?.length > 0,
    this.profile?.languages?.length > 0,
  ];

  const filledFields = fields.filter(Boolean).length;
  this.profileCompletionScore = Math.round((filledFields / fields.length) * 100);
});

// Compare passwords
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Check if password was changed after token was issued
userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10);
    return JWTTimestamp < changedTimestamp;
  }
  return false;
};

// Virtual for isPremium
userSchema.virtual('isPremium').get(function () {
  return (
    this.subscriptionPlan !== 'free' &&
    this.subscriptionStatus === 'active'
  );
});

// Exclude deleted users from queries
userSchema.pre(/^find/, function () {
  this.find({ isDeleted: { $ne: true } });
});

module.exports = mongoose.model('User', userSchema);
