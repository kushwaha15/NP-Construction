'use strict';
const express   = require('express');
const router    = express.Router();
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer    = require('multer');
const Portfolio = require('../models/Portfolio');

// ── Configure Cloudinary ───────────────────────────────────
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// ── Cloudinary multer storage ──────────────────────────────
const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    const isVideo = file.mimetype.startsWith('video/');
    return {
      folder:         'np-construction/portfolio',
      resource_type:  isVideo ? 'video' : 'image',
      allowed_formats: isVideo
        ? ['mp4', 'mov', 'avi', 'webm', 'mkv']
        : ['jpg', 'jpeg', 'png', 'webp', 'gif'],
      transformation: isVideo
        ? [{ quality: 'auto', fetch_format: 'mp4' }]
        : [{ quality: 'auto', fetch_format: 'auto' }],
    };
  },
});

const portfolioUpload = multer({
  storage,
  limits: { fileSize: 150 * 1024 * 1024 }, // 150 MB for video
});

// ── Auth ───────────────────────────────────────────────────
let _requireAuth = (req, res, next) => next();
const setAuth = (fn) => { _requireAuth = fn; };
const auth    = (req, res, next) => _requireAuth(req, res, next);

// ── PUBLIC: GET /api/portfolio/stats — live aggregation ──
router.get('/stats', async (req, res) => {
  try {
    const [totals] = await Portfolio.aggregate([
      {
        $group: {
          _id: null,
          totalProjects: { $sum: 1 },
          totalTonnage:  { $sum: '$tonnage' },
        },
      },
    ]);

    const byCity = await Portfolio.aggregate([
      { $match: { city: { $nin: [null, ''] } } },
      {
        $group: {
          _id:      '$city',
          projects: { $sum: 1 },
          tonnage:  { $sum: '$tonnage' },
        },
      },
      { $project: { _id: 0, city: '$_id', projects: 1, tonnage: 1 } },
      { $sort: { projects: -1 } },
    ]);

    res.json({
      success:        true,
      totalProjects:  totals?.totalProjects || 0,
      totalTonnage:   totals?.totalTonnage  || 0,
      citiesCovered:  byCity.length,            // distinct non-empty cities
      byCity,
    });
  } catch (err) {
    console.error('Portfolio stats error:', err.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ── PUBLIC: GET /api/portfolio ────────────────────────────
router.get('/', async (req, res) => {
  try {
    const { category, city } = req.query;
    const filter = {};
    if (category && category !== 'All') filter.category = category;
    if (city && city !== 'All') filter.city = { $regex: new RegExp(`^${city}$`, 'i') };
    const items = await Portfolio.find(filter).sort({ uploadedAt: -1 });
    res.json({ success: true, data: items });
  } catch {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ── ADMIN: POST /api/portfolio — upload ───────────────────
router.post('/', auth, portfolioUpload.single('file'), async (req, res) => {
  try {
    const { title, description, category, tonnage, city } = req.body;
    if (!title?.trim()) return res.status(400).json({ success: false, message: 'Title is required' });

    // Media is optional — only process if a file was actually uploaded
    let mediaType          = '';
    let cloudinaryUrl      = '';
    let cloudinaryPublicId = '';
    let thumbnailUrl       = '';

    if (req.file) {
      const isVideo    = req.file.mimetype?.startsWith('video/') ||
                         req.file.resource_type === 'video';
      cloudinaryPublicId = req.file.filename || req.file.public_id;
      cloudinaryUrl      = req.file.path;
      mediaType          = isVideo ? 'video' : 'image';

      // For videos generate a thumbnail via Cloudinary URL transformation
      if (isVideo && cloudinaryPublicId) {
        thumbnailUrl = cloudinary.url(cloudinaryPublicId, {
          resource_type: 'video',
          format: 'jpg',
          transformation: [{ width: 600, height: 400, crop: 'fill' }, { so: '2' }],
        });
      }
    }

    const item = await Portfolio.create({
      title: title.trim(),
      description:        description?.trim() || '',
      category:           category || 'Other',
      mediaType,
      cloudinaryUrl,
      cloudinaryPublicId,
      thumbnailUrl,
      tonnage: Number(tonnage) || 0,
      city:    city?.trim() || '',
    });

    res.json({ success: true, data: item });
  } catch (err) {
    console.error('Portfolio upload error:', err.message);
    res.status(500).json({ success: false, message: 'Upload failed: ' + err.message });
  }
});

// ── ADMIN: PATCH /api/portfolio/:id — edit metadata ───────
router.patch('/:id', auth, async (req, res) => {
  try {
    const { title, description, category, tonnage, city } = req.body;
    const update = {};
    if (title?.trim())             update.title       = title.trim();
    if (description !== undefined) update.description = description.trim();
    if (category)                  update.category    = category;
    if (tonnage !== undefined)     update.tonnage     = Number(tonnage) || 0;
    if (city !== undefined)        update.city        = city.trim();

    const item = await Portfolio.findByIdAndUpdate(req.params.id, update, { new: true });
    if (!item) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, data: item });
  } catch {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ── ADMIN: DELETE /api/portfolio/:id ─────────────────────
router.delete('/:id', auth, async (req, res) => {
  try {
    const item = await Portfolio.findById(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: 'Not found' });

    // Delete from Cloudinary only if a file was uploaded
    if (item.cloudinaryPublicId) {
      try {
        await cloudinary.uploader.destroy(item.cloudinaryPublicId, {
          resource_type: item.mediaType === 'video' ? 'video' : 'image',
        });
      } catch (e) {
        console.warn('Cloudinary delete warning:', e.message);
      }
    }

    await Portfolio.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});


module.exports = { router, setAuth };
