'use strict';
const mongoose = require('mongoose');

const blogPostSchema = new mongoose.Schema({
  title: {
    type: String, required: [true, 'Title is required'],
    trim: true, maxlength: [300, 'Title too long'],
  },
  slug: {
    type: String, required: true, unique: true, trim: true, lowercase: true,
  },
  excerpt: {
    type: String, trim: true, maxlength: [500, 'Excerpt too long'], default: '',
  },
  content: {
    type: String, required: [true, 'Content is required'],
  },
  cover: {
    type: String, default: '',   // Cloudinary URL or empty
  },
  category: {
    type: String, trim: true,
    enum: ['Steel Tips', 'Industry News', 'Projects'],
    default: 'Steel Tips',
  },
  author: {
    type: String, trim: true, default: 'NP Construction Team',
  },
  readTime: {
    type: Number, default: 1,
  },
  publishedAt: {
    type: Date, default: Date.now,
  },
}, { timestamps: true });

blogPostSchema.index({ slug: 1 });
blogPostSchema.index({ publishedAt: -1 });

module.exports = mongoose.model('BlogPost', blogPostSchema);
