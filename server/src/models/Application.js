const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  url: { type: String, required: true },
  publicId: { type: String }, // Cloudinary public ID
  fileType: { type: String },
  fileSize: { type: Number },
  uploadedAt: { type: Date, default: Date.now },
}, { _id: false });

const applicationStepSchema = new mongoose.Schema({
  stepNumber: { type: Number, required: true },
  title: { type: String, required: true },
  data: { type: mongoose.Schema.Types.Mixed, default: {} },
  completed: { type: Boolean, default: false },
  completedAt: { type: Date },
}, { _id: false });

const applicationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
    },
    scholarshipId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Scholarship',
      required: [true, 'Scholarship ID is required'],
    },
    status: {
      type: String,
      enum: ['draft', 'submitted', 'under_review', 'accepted', 'rejected', 'withdrawn'],
      default: 'draft',
    },
    // Multi-step form data
    steps: [applicationStepSchema],
    currentStep: { type: Number, default: 1 },
    // Personal info
    personalStatement: { type: String, maxlength: 5000 },
    motivation: { type: String, maxlength: 3000 },
    // Documents
    documents: [documentSchema],
    // Feedback
    feedback: { type: String },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    reviewedAt: { type: Date },
    submittedAt: { type: Date },
    // Auto-save
    lastSavedAt: { type: Date, default: Date.now },
    isDeleted: { type: Boolean, default: false },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Prevent duplicate applications
applicationSchema.index({ userId: 1, scholarshipId: 1 }, { unique: true });
applicationSchema.index({ userId: 1, status: 1 });
applicationSchema.index({ scholarshipId: 1 });
applicationSchema.index({ status: 1 });

// Virtual: scholarship details
applicationSchema.virtual('scholarship', {
  ref: 'Scholarship',
  localField: 'scholarshipId',
  foreignField: '_id',
  justOne: true,
});

// Virtual: user details
applicationSchema.virtual('user', {
  ref: 'User',
  localField: 'userId',
  foreignField: '_id',
  justOne: true,
});

// Exclude deleted
applicationSchema.pre(/^find/, function () {
  this.find({ isDeleted: { $ne: true } });
});

module.exports = mongoose.model('Application', applicationSchema);
