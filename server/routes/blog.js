'use strict';
const express            = require('express');
const router             = express.Router();
const cloudinary         = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer             = require('multer');
const BlogPost           = require('../models/BlogPost');

// ── Reuse same Cloudinary credentials ─────────────────────
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// ── Blog-specific Cloudinary storage ──────────────────────
const blogStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder:          'np-construction/blog',
    resource_type:   'image',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation:  [{ quality: 'auto', fetch_format: 'auto', width: 1200, crop: 'limit' }],
  },
});

const blogUpload = multer({
  storage: blogStorage,
  limits:  { fileSize: 10 * 1024 * 1024 }, // 10 MB
  fileFilter: (_req, file, cb) => {
    const ok = ['image/jpeg', 'image/png', 'image/webp'].includes(file.mimetype);
    cb(ok ? null : new Error('Only JPG, PNG, and WEBP images are allowed'), ok);
  },
});

// ── Auth ───────────────────────────────────────────────────
let _requireAuth = (req, res, next) => next();
const setAuth = (fn) => { _requireAuth = fn; };
const auth    = (req, res, next) => _requireAuth(req, res, next);

// ── Slug helper ────────────────────────────────────────────
function makeSlug(title) {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

// ── Word count → read time ─────────────────────────────────
function calcReadTime(content = '') {
  const words = content.replace(/<[^>]+>/g, '').split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200));
}

// ─────────────────────────────────────────────────────────
// PUBLIC ROUTES
// ─────────────────────────────────────────────────────────

// GET /api/blog  — all posts, newest first
router.get('/', async (req, res) => {
  try {
    const { category } = req.query;
    const filter = category && category !== 'All' ? { category } : {};
    const posts = await BlogPost.find(filter)
      .sort({ publishedAt: -1 })
      .select('-content'); // omit heavy content in listing
    res.json({ success: true, data: posts });
  } catch {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// GET /api/blog/:slug  — single post (full content)
router.get('/:slug', async (req, res) => {
  try {
    const post = await BlogPost.findOne({ slug: req.params.slug });
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });
    res.json({ success: true, data: post });
  } catch {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ─────────────────────────────────────────────────────────
// ADMIN ROUTES  (all require auth + optional file upload)
// ─────────────────────────────────────────────────────────

// POST /api/blog  — create new post
router.post('/', auth, (req, res, next) => {
  blogUpload.single('coverImage')(req, res, (err) => {
    if (err) return res.status(400).json({ success: false, message: err.message });
    next();
  });
}, async (req, res) => {
  try {
    const { title, excerpt, content, category, author } = req.body;
    if (!title?.trim()) return res.status(400).json({ success: false, message: 'Title is required' });
    if (!content?.trim()) return res.status(400).json({ success: false, message: 'Content is required' });

    const slug = makeSlug(title);
    // Ensure slug is unique
    const exists = await BlogPost.findOne({ slug });
    if (exists) return res.status(400).json({ success: false, message: 'A post with this title already exists' });

    const cover = req.file ? req.file.path : '';

    const post = await BlogPost.create({
      title:    title.trim(),
      slug,
      excerpt:  excerpt?.trim()  || '',
      content:  content.trim(),
      cover,
      category: category || 'Steel Tips',
      author:   author?.trim()   || 'NP Construction Team',
      readTime: calcReadTime(content),
    });

    res.json({ success: true, data: post });
  } catch (err) {
    console.error('Blog create error:', err.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// PATCH /api/blog/:id  — update post (cover optional)
router.patch('/:id', auth, (req, res, next) => {
  blogUpload.single('coverImage')(req, res, (err) => {
    if (err) return res.status(400).json({ success: false, message: err.message });
    next();
  });
}, async (req, res) => {
  try {
    const { title, excerpt, content, category, author } = req.body;
    const update = {};
    if (title?.trim())    { update.title = title.trim(); update.slug = makeSlug(title); }
    if (excerpt !== undefined) update.excerpt  = excerpt.trim();
    if (content?.trim())  { update.content  = content.trim(); update.readTime = calcReadTime(content); }
    if (category)           update.category = category;
    if (author?.trim())     update.author   = author.trim();
    if (req.file)           update.cover    = req.file.path; // new Cloudinary URL

    const post = await BlogPost.findByIdAndUpdate(req.params.id, update, { new: true });
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });
    res.json({ success: true, data: post });
  } catch (err) {
    console.error('Blog update error:', err.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// DELETE /api/blog/:id
router.delete('/:id', auth, async (req, res) => {
  try {
    const post = await BlogPost.findByIdAndDelete(req.params.id);
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });
    res.json({ success: true });
  } catch {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = { router, setAuth };
