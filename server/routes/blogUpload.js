'use strict';
const express            = require('express');
const router             = express.Router();
const cloudinary         = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer             = require('multer');

// ── Reuse the same Cloudinary credentials ─────────────────
// (env vars already set by the Portfolio route — no second config needed)
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// ── Blog-specific Cloudinary storage ──────────────────────
// Images land in np-construction/blog — separate from portfolio
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
  limits:  { fileSize: 10 * 1024 * 1024 }, // 10 MB max
  fileFilter: (_req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp'];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only JPG, PNG, and WEBP images are allowed'));
    }
  },
});

// ── Auth ───────────────────────────────────────────────────
let _requireAuth = (req, res, next) => next();
const setAuth = (fn) => { _requireAuth = fn; };
const auth    = (req, res, next) => _requireAuth(req, res, next);

// ── POST /api/blog/cover-image ────────────────────────────
// Accepts: multipart/form-data, field name "coverImage"
// Returns: { success: true, url: "https://res.cloudinary.com/…" }
router.post('/cover-image', auth, (req, res, next) => {
  blogUpload.single('coverImage')(req, res, (err) => {
    if (err) {
      // multer / cloudinary error (file type, size, etc.)
      return res.status(400).json({
        success: false,
        message: err.message || 'Upload failed',
      });
    }
    next();
  });
}, (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'No file received' });
  }
  return res.json({ success: true, url: req.file.path });
});

module.exports = { router, setAuth };
