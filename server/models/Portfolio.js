const mongoose = require('mongoose');

const portfolioSchema = new mongoose.Schema({
  title: {
    type: String, required: [true, 'Title is required'],
    trim: true, maxlength: [200, 'Title too long']
  },
  description: {
    type: String, trim: true, maxlength: [1000, 'Description too long'], default: ''
  },
  category: {
    type: String, trim: true,
    enum: ['Beam Reinforcement', 'Slab Reinforcement', 'Column Reinforcement', 'Roof Reinforcement', 'Other'],
    default: 'Other'
  },
  mediaType: {
    type: String, enum: ['image', 'video', ''], default: ''  // empty = no media uploaded
  },
  cloudinaryUrl: {
    type: String, default: ''   // empty when no file uploaded
  },
  cloudinaryPublicId: {
    type: String, default: ''   // empty when no file uploaded
  },
  thumbnailUrl: {
    type: String, default: ''      // auto-generated thumbnail for videos
  },
  tonnage: {
    type: Number, default: 0       // steel tonnage for this project
  },
  city: {
    type: String, trim: true, default: ''  // city where the project was done
  },
  uploadedAt: { type: Date, default: Date.now }
}, { timestamps: true });

portfolioSchema.index({ category: 1, uploadedAt: -1 });

module.exports = mongoose.model('Portfolio', portfolioSchema);
