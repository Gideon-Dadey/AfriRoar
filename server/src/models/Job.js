const mongoose = require('mongoose');
const slugify = require('slugify');

const jobSchema = new mongoose.Schema(
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
    company: {
      type: String,
      required: [true, 'Company is required'],
      trim: true,
      maxlength: 120,
    },
    companyWebsite: {
      type: String,
      trim: true,
      default: '',
    },
    shortDescription: {
      type: String,
      maxlength: [300, 'Short description cannot exceed 300 characters'],
      default: '',
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      maxlength: [15000, 'Description cannot exceed 15000 characters'],
    },
    requirements: {
      type: String,
      default: '',
      maxlength: 10000,
    },
    responsibilities: {
      type: String,
      default: '',
      maxlength: 10000,
    },
    country: {
      type: String,
      required: [true, 'Country is required'],
      trim: true,
    },
    location: {
      type: String,
      trim: true,
      default: '',
    },
    employmentType: {
      type: String,
      required: true,
      enum: ['full-time', 'part-time', 'contract', 'internship', 'temporary'],
      default: 'full-time',
    },
    workplaceType: {
      type: String,
      required: true,
      enum: ['onsite', 'hybrid', 'remote'],
      default: 'onsite',
    },
    field: {
      type: String,
      trim: true,
      default: '',
    },
    salary: {
      min: { type: Number },
      max: { type: Number },
      currency: { type: String, default: 'USD' },
      period: {
        type: String,
        enum: ['hour', 'month', 'year', ''],
        default: '',
      },
    },
    deadline: {
      type: Date,
      required: [true, 'Application deadline is required'],
    },
    applicationUrl: {
      type: String,
      trim: true,
      default: '',
    },
    allowInternalApply: {
      type: Boolean,
      default: true,
    },
    tags: [{ type: String, trim: true }],
    coverImage: { type: String, default: '' },
    status: {
      type: String,
      enum: ['draft', 'published', 'closed'],
      default: 'published',
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    viewCount: { type: Number, default: 0 },
    applicationCount: { type: Number, default: 0 },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

jobSchema.index({ title: 'text', description: 'text', company: 'text', field: 'text', tags: 'text' });
jobSchema.index({ country: 1 });
jobSchema.index({ employmentType: 1 });
jobSchema.index({ workplaceType: 1 });
jobSchema.index({ status: 1 });
jobSchema.index({ deadline: 1 });
jobSchema.index({ slug: 1 });
jobSchema.index({ createdAt: -1 });
jobSchema.index({ isFeatured: 1 });

jobSchema.virtual('isExpired').get(function () {
  return this.deadline < new Date();
});

jobSchema.pre('save', function () {
  if (!this.slug && this.title) {
    this.slug = `${slugify(this.title, { lower: true, strict: true })}-${Date.now().toString(36)}`;
  }
  if (this.isModified('description') && !this.shortDescription) {
    this.shortDescription = `${this.description.substring(0, 250).trim()}...`;
  }
});

jobSchema.pre(/^find/, function () {
  this.find({ isDeleted: { $ne: true } });
});

module.exports = mongoose.model('Job', jobSchema);
