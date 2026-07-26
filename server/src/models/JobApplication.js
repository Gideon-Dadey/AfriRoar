const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    url: { type: String, required: true },
    publicId: { type: String },
    fileType: { type: String },
    fileSize: { type: Number },
    uploadedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const jobApplicationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    jobId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Job',
      required: true,
    },
    status: {
      type: String,
      enum: ['draft', 'submitted', 'under_review', 'accepted', 'rejected', 'withdrawn'],
      default: 'draft',
    },
    currentStep: { type: Number, default: 1 },
    personal: {
      firstName: { type: String, default: '' },
      lastName: { type: String, default: '' },
      otherName: { type: String, default: '' },
      email: { type: String, default: '' },
      phone: { type: String, default: '' },
      country: { type: String, default: '' },
      linkedIn: { type: String, default: '' },
    },
    coverLetter: {
      type: String,
      maxlength: 5000,
      default: '',
    },
    documents: [documentSchema],
    feedback: { type: String, default: '' },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    reviewedAt: { type: Date },
    submittedAt: { type: Date },
    lastSavedAt: { type: Date, default: Date.now },
    isDeleted: { type: Boolean, default: false },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

jobApplicationSchema.index({ userId: 1, jobId: 1 }, { unique: true });
jobApplicationSchema.index({ userId: 1, status: 1 });
jobApplicationSchema.index({ jobId: 1 });
jobApplicationSchema.index({ status: 1 });
jobApplicationSchema.index({ createdAt: -1 });

jobApplicationSchema.virtual('job', {
  ref: 'Job',
  localField: 'jobId',
  foreignField: '_id',
  justOne: true,
});

jobApplicationSchema.virtual('user', {
  ref: 'User',
  localField: 'userId',
  foreignField: '_id',
  justOne: true,
});

jobApplicationSchema.pre(/^find/, function () {
  this.find({ isDeleted: { $ne: true } });
});

module.exports = mongoose.model('JobApplication', jobApplicationSchema);
