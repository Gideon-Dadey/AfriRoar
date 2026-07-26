const mongoose = require('mongoose');
const slugify = require('slugify');

const contentSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: 200,
    },
    slug: {
      type: String,
      unique: true,
    },
    category: {
      type: String,
      required: true,
      enum: ['guide', 'internship', 'list', 'job'],
    },
    excerpt: {
      type: String,
      maxlength: 400,
      default: '',
    },
    body: {
      type: String,
      required: [true, 'Body content is required'],
      maxlength: 50000,
    },
    coverImage: {
      type: String,
      default: '',
    },
    country: {
      type: String,
      trim: true,
      default: '',
    },
    tags: [{ type: String, trim: true }],
    status: {
      type: String,
      enum: ['draft', 'published'],
      default: 'draft',
    },
    publishedAt: { type: Date },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date },
  },
  { timestamps: true }
);

contentSchema.index({ title: 'text', excerpt: 'text', body: 'text' });
contentSchema.index({ category: 1, status: 1 });
contentSchema.index({ slug: 1 });
contentSchema.index({ createdAt: -1 });

contentSchema.pre('save', function () {
  if (!this.slug && this.title) {
    this.slug = `${slugify(this.title, { lower: true, strict: true })}-${Date.now().toString(36)}`;
  }
  if (this.isModified('status') && this.status === 'published' && !this.publishedAt) {
    this.publishedAt = new Date();
  }
});

module.exports = mongoose.model('Content', contentSchema);
