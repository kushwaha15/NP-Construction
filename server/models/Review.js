const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  name: {
    type: String, required: [true, 'Name is required'],
    trim: true, maxlength: [100, 'Name too long']
  },
  email: {
    type: String, required: [true, 'Email is required'],
    trim: true, lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Invalid email']
  },
  rating: {
    type: Number, required: true,
    min: 1, max: 5
  },
  reviewText: {
    type: String, required: [true, 'Review text is required'],
    trim: true, maxlength: [500, 'Review too long']
  },
  projectName: {
    type: String, trim: true, maxlength: [200, 'Project name too long'], default: ''
  },
  isApproved: { type: Boolean, default: false },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  submittedAt: { type: Date, default: Date.now }
}, { timestamps: true });

reviewSchema.index({ isApproved: 1, submittedAt: -1 });

module.exports = mongoose.model('Review', reviewSchema);
