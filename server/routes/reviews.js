'use strict';
const express = require('express');
const router  = express.Router();
const { body, validationResult } = require('express-validator');
const Review  = require('../models/Review');

// ── Auth middleware (reuse token set from admin.js) ────────
// We import requireAuth inline so reviews.js stays standalone;
// server.js passes it in via router options.
// Actually we expose it as a factory — server.js calls:
//   app.use('/api/reviews', reviewRoutes(requireAuth))
let _requireAuth = (req, res, next) => next(); // fallback (overridden by server)
const setAuth = (fn) => { _requireAuth = fn; };
const auth    = (req, res, next) => _requireAuth(req, res, next);

// ── PUBLIC: GET /api/reviews — approved reviews only ──────
router.get('/', async (req, res) => {
  try {
    const reviews = await Review.find({ isApproved: true })
      .sort({ submittedAt: -1 })
      .select('name rating reviewText projectName submittedAt');
    res.json({ success: true, data: reviews });
  } catch {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ── PUBLIC: POST /api/reviews — submit a review ───────────
router.post('/',
  [
    body('name').trim().notEmpty().withMessage('Name is required').isLength({ max: 100 }),
    body('email').trim().isEmail().withMessage('Valid email required').normalizeEmail(),
    body('rating').customSanitizer(v => parseInt(v, 10)).isInt({ min: 1, max: 5 }).withMessage('Rating must be 1–5'),
    body('reviewText').trim().notEmpty().withMessage('Review text is required').isLength({ max: 500 }),
    body('projectName').trim().optional().isLength({ max: 200 }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ success: false, errors: errors.array() });

    try {
      const { name, email, rating, reviewText, projectName } = req.body;
      await Review.create({ name, email, rating, reviewText, projectName: projectName || '', status: 'pending' });
      res.json({ success: true, message: 'Review submitted! It will appear after approval.' });
    } catch {
      res.status(500).json({ success: false, message: 'Server error' });
    }
  }
);

// ── ADMIN: GET /api/reviews/admin — all reviews ───────────
router.get('/admin', auth, async (req, res) => {
  try {
    const { status = 'pending' } = req.query;
    const legacyPending = { status: { $exists: false }, isApproved: false };
    const legacyApproved = { status: { $exists: false }, isApproved: true };
    const filters = {
      pending: { $or: [{ status: 'pending' }, legacyPending] },
      approved: { $or: [{ status: 'approved' }, legacyApproved] },
      rejected: { status: 'rejected' },
    };
    const filter = status === 'all' ? {} : (filters[status] || filters.pending);
    const reviews = await Review.find(filter).sort({ submittedAt: -1 });
    const pending  = await Review.countDocuments(filters.pending);
    const approved = await Review.countDocuments(filters.approved);
    const rejected = await Review.countDocuments({ status: 'rejected' });
    res.json({ success: true, data: reviews, counts: { pending, approved, rejected } });
  } catch {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ── ADMIN: PATCH /api/reviews/:id/approve ─────────────────
router.patch('/:id/approve', auth, async (req, res) => {
  try {
    const review = await Review.findByIdAndUpdate(
      req.params.id, { isApproved: true, status: 'approved' }, { new: true }
    );
    if (!review) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, data: review });
  } catch {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ── ADMIN: PATCH /api/reviews/:id/reject ──────────────────
router.patch('/:id/reject', auth, async (req, res) => {
  try {
    const review = await Review.findByIdAndUpdate(
      req.params.id, { isApproved: false, status: 'rejected' }, { new: true }
    );
    if (!review) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, data: review });
  } catch {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ── ADMIN: DELETE /api/reviews/:id ────────────────────────
router.delete('/:id', auth, async (req, res) => {
  try {
    const review = await Review.findByIdAndDelete(req.params.id);
    if (!review) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true });
  } catch {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = { router, setAuth };
