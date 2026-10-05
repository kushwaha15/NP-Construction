const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const Lead = require('../models/Lead');

// ─── Simple token store (in-memory, sufficient for single-admin use) ──────────
const activeSessions = new Set();

// Generate simple session token
const generateToken = () => {
  return Math.random().toString(36).substr(2) + Date.now().toString(36);
};

// ─── Auth Middleware ──────────────────────────────────────────────────────────
const requireAuth = (req, res, next) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token || !activeSessions.has(token)) {
    return res.status(401).json({ success: false, message: 'Unauthorized. Please login.' });
  }
  next();
};

// ─── POST /api/admin/login ────────────────────────────────────────────────────
router.post('/login', async (req, res) => {
  const { password } = req.body;

  if (!password) {
    return res.status(400).json({ success: false, message: 'Password is required' });
  }

  const adminPassword = process.env.ADMIN_PASSWORD || 'NP@Admin2025';

  if (password !== adminPassword) {
    return res.status(401).json({ success: false, message: 'Invalid password' });
  }

  const token = generateToken();
  activeSessions.add(token);

  // Auto-expire token after 8 hours
  setTimeout(() => activeSessions.delete(token), 8 * 60 * 60 * 1000);

  return res.json({ success: true, token, message: 'Login successful' });
});

// ─── POST /api/admin/logout ───────────────────────────────────────────────────
router.post('/logout', requireAuth, (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  activeSessions.delete(token);
  return res.json({ success: true, message: 'Logged out successfully' });
});

// ─── GET /api/admin/leads ─────────────────────────────────────────────────────
router.get('/leads', requireAuth, async (req, res) => {
  try {
    const { workType, city, status, page = 1, limit = 20, search } = req.query;

    const filter = {};
    if (workType && workType !== 'All') filter.workType = workType;
    if (city) filter.city = { $regex: city, $options: 'i' };
    if (status && status !== 'All') filter.status = status;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { city: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await Lead.countDocuments(filter);
    const leads = await Lead.find(filter)
      .sort({ submittedAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .select('-ipAddress -__v');

    return res.json({
      success: true,
      data: leads,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit))
      }
    });

  } catch (err) {
    console.error('Admin leads error:', err.message);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ─── GET /api/admin/leads/stats ───────────────────────────────────────────────
router.get('/leads/stats', requireAuth, async (req, res) => {
  try {
    const rangeStart = req.query.from ? new Date(req.query.from) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const rangeEnd = req.query.to ? new Date(new Date(req.query.to).getTime() + 24 * 60 * 60 * 1000) : new Date();
    const total = await Lead.countDocuments();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayCount = await Lead.countDocuments({ submittedAt: { $gte: today } });

    const byWorkType = await Lead.aggregate([
      { $group: { _id: '$workType', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    const byStatus = await Lead.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    const last7Days = await Lead.aggregate([
      {
        $match: {
          submittedAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$submittedAt' } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    const last30Days = await Lead.aggregate([
      { $match: { submittedAt: { $gte: rangeStart, $lt: rangeEnd } } },
      { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$submittedAt' } }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);

    return res.json({
      success: true,
      data: { total, todayCount, byWorkType, byStatus, last7Days, last30Days }
    });

  } catch (err) {
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ─── PATCH /api/admin/leads/:id/status ───────────────────────────────────────
router.patch('/leads/:id/status', requireAuth, async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['New', 'Contacted', 'In Progress', 'Closed'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    const lead = await Lead.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!lead) return res.status(404).json({ success: false, message: 'Lead not found' });
    return res.json({ success: true, data: lead });

  } catch (err) {
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ─── GET /api/admin/leads/export ─────────────────────────────────────────────
router.get('/leads/export', requireAuth, async (req, res) => {
  try {
    const { workType, city, status } = req.query;
    const filter = {};
    if (workType && workType !== 'All') filter.workType = workType;
    if (city) filter.city = { $regex: city, $options: 'i' };
    if (status && status !== 'All') filter.status = status;

    const leads = await Lead.find(filter)
      .sort({ submittedAt: -1 })
      .select('-ipAddress -__v -_id');

    // Manual CSV generation (avoids json2csv complexity)
    const headers = ['Name', 'Phone', 'Email', 'City', 'Work Type', 'Tonnage', 'Message', 'Status', 'Submitted At'];
    const rows = leads.map(lead => [
      `"${(lead.name || '').replace(/"/g, '""')}"`,
      `"${lead.phone || ''}"`,
      `"${lead.email || ''}"`,
      `"${(lead.city || '').replace(/"/g, '""')}"`,
      `"${lead.workType || ''}"`,
      `"${lead.tonnage || ''}"`,
      `"${(lead.message || '').replace(/"/g, '""')}"`,
      `"${lead.status || ''}"`,
      `"${new Date(lead.submittedAt).toLocaleString('en-IN')}"`
    ].join(','));

    const csv = [headers.join(','), ...rows].join('\n');
    const filename = `NP_Construction_Leads_${new Date().toISOString().split('T')[0]}.csv`;

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    return res.send(csv);

  } catch (err) {
    console.error('Export error:', err.message);
    return res.status(500).json({ success: false, message: 'Export failed' });
  }
});

module.exports = router;
module.exports.requireAuth = requireAuth;
