const mongoose = require('mongoose');
const slugify = require('slugify');

const scholarshipSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    slug: {
      type: String,
      unique: true,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      maxlength: [10000, 'Description cannot exceed 10000 characters'],
    },
    shortDescription: {
      type: String,
      maxlength: [300, 'Short description cannot exceed 300 characters'],
    },
    country: {
      type: String,
      required: [true, 'Country is required'],
      trim: true,
    },
    level: {
      type: String,
      required: [true, 'Education level is required'],
      enum: ['high-school', 'bachelors', 'masters', 'phd', 'postdoc', 'any'],
    },
    field: {
      type: String,
      required: [true, 'Field of study is required'],
      trim: true,
    },
    eligibility: {
      type: String,
      default: '',
    },
    fundingType: {
      type: String,
      required: [true, 'Funding type is required'],
      enum: ['full', 'partial', 'tuition', 'stipend', 'travel', 'research'],
    },
    amount: {
      value: { type: Number },
      currency: { type: String, default: 'USD' },
    },
    deadline: {
      type: Date,
      required: [true, 'Deadline is required'],
    },
    applicationUrl: {
      type: String,
      trim: true,
    },
    tags: [{
      type: String,
      trim: true,
    }],
    providerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Provider is required'],
    },
    // Moderation
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    rejectionReason: { type: String },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    approvedAt: { type: Date },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    isEarlyAccess: {
      type: Boolean,
      default: false,
    },
    // Stats
    viewCount: { type: Number, default: 0 },
    applicationCount: { type: Number, default: 0 },
    saveCount: { type: Number, default: 0 },
    // Soft delete
    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date },
    // Cover image
    coverImage: { type: String },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes
scholarshipSchema.index({ title: 'text', description: 'text', tags: 'text' });
scholarshipSchema.index({ country: 1 });
scholarshipSchema.index({ level: 1 });
scholarshipSchema.index({ field: 1 });
scholarshipSchema.index({ fundingType: 1 });
scholarshipSchema.index({ deadline: 1 });
scholarshipSchema.index({ status: 1 });
scholarshipSchema.index({ providerId: 1 });
scholarshipSchema.index({ isFeatured: 1 });
scholarshipSchema.index({ slug: 1 });
scholarshipSchema.index({ createdAt: -1 });

// Generate slug only when missing - never overwrite a provided catalogue slug
scholarshipSchema.pre('save', function () {
  if (!this.slug && this.title) {
    this.slug = slugify(this.title, { lower: true, strict: true }) + '-' + Date.now().toString(36);
  }
  // Auto-generate short description
  if (this.isModified('description') && !this.shortDescription) {
    this.shortDescription = this.description.substring(0, 250).trim() + '...';
  }
});

// Virtual: isExpired
scholarshipSchema.virtual('isExpired').get(function () {
  return this.deadline < new Date();
});

// Virtual: provider details
scholarshipSchema.virtual('provider', {
  ref: 'User',
  localField: 'providerId',
  foreignField: '_id',
  justOne: true,
});

// Exclude deleted scholarships
scholarshipSchema.pre(/^find/, function () {
  this.find({ isDeleted: { $ne: true } });
});

module.exports = mongoose.model('Scholarship', scholarshipSchema);
