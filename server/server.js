'use strict';
require('dotenv').config({ path: __dirname + '/.env' });

const express    = require('express');
const cors       = require('cors');
const mongoose   = require('mongoose');
const path       = require('path');
const rateLimit  = require('express-rate-limit');
const multer     = require('multer');
const fs         = require('fs');
const nodemailer = require('nodemailer');

const contactRoutes  = require('./routes/contact');
const adminRoutes    = require('./routes/admin');
const { router: reviewRoutes,   setAuth: setReviewAuth }    = require('./routes/reviews');
const { router: portfolioRoutes, setAuth: setPortfolioAuth } = require('./routes/portfolio');
const { router: blogRoutes,      setAuth: setBlogAuth }      = require('./routes/blog');
const Lead           = require('./models/Lead');
const CallbackRequest = require('./models/CallbackRequest');
const Referral       = require('./models/Referral');
const Review         = require('./models/Review');
const Portfolio      = require('./models/Portfolio');
const BlogPost       = require('./models/BlogPost');                                                                                                                                                

const app  = express();
const PORT = process.env.PORT || 5000;

// ── Ensure uploads dir ────────────────────────────────────
const UPLOADS_DIR = path.join(__dirname, 'uploads');
if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });

// ── Multer ─────────────────────────────────────────────────
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOADS_DIR),
  filename:    (_req, file, cb) => cb(null, `${Date.now()}-${file.originalname.replace(/[^a-zA-Z0-9._-]/g,'')}`)
});
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024, files: 3 },
  fileFilter: (_req, file, cb) => {
    const allowed = ['application/pdf','image/jpeg','image/png'];
    cb(null, allowed.includes(file.mimetype));
  }
});

// ── Rate limiters ─────────────────────────────────────────
const apiLimiter  = rateLimit({ windowMs:15*60*1000, max:100, standardHeaders:true, legacyHeaders:false });
const formLimiter = rateLimit({ windowMs:60*60*1000, max:10,  standardHeaders:true, legacyHeaders:false });

// ── Middleware ────────────────────────────────────────────
app.use(cors({ origin: process.env.CLIENT_URL || '*', methods:['GET','POST','PATCH','DELETE'], allowedHeaders:['Content-Type','Authorization'] }));
app.use(express.json({ limit:'10kb' }));
app.use(express.urlencoded({ extended:true, limit:'10kb' }));

// ── Serve uploaded files ──────────────────────────────────
app.use('/uploads', express.static(UPLOADS_DIR));

// ── Serve React build ──────────────────────────────────────
const REACT_BUILD = path.join(__dirname, 'public');
app.use(express.static(REACT_BUILD));

// ── API Test ──────────────────────────────────────────────
app.get('/api/test', (_req, res) => res.json({
  success:true, message:'✅ NP Construction API is working!',
  mongoStatus: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
  timestamp: new Date().toISOString()
}));

// ── Wire auth into new route modules ─────────────────────
const { requireAuth } = require('./routes/admin');
setReviewAuth(requireAuth);
setPortfolioAuth(requireAuth);
setBlogAuth(requireAuth);

// ── Contact (with file upload) ─────────────────────────────
app.use('/api/contact', formLimiter, upload.array('files', 3), contactRoutes);

// ── Admin routes ───────────────────────────────────────────
app.use('/api/admin', apiLimiter, adminRoutes);

// ── Reviews ────────────────────────────────────────────────
app.use('/api/reviews', apiLimiter, reviewRoutes);

// ── Portfolio ──────────────────────────────────────────────
app.use('/api/portfolio', apiLimiter, portfolioRoutes);

// ── Blog cover image upload ────────────────────────────────
app.use('/api/blog', apiLimiter, blogRoutes);

// ── Callback request ───────────────────────────────────────
app.post('/api/callback', formLimiter, async (req, res) => {
  try {
    const { name, phone, preferredTime } = req.body;
    if (!name?.trim() || !/^[6-9]\d{9}$/.test(phone?.trim()))
      return res.status(400).json({ success:false, message:'Invalid name or phone' });
    await CallbackRequest.create({ name:name.trim(), phone:phone.trim(), preferredTime: preferredTime || 'Morning (9am–12pm)' });
    return res.json({ success:true, message:'Callback request submitted!' });
  } catch (err) { return res.status(500).json({ success:false, message:'Server error' }); }
});

// ── Referral ───────────────────────────────────────────────
app.post('/api/referral', formLimiter, async (req, res) => {
  try {
    const { referrerName, referrerPhone, referredName, referredPhone, projectType } = req.body;
    if (!referrerName?.trim() || !referredName?.trim() ||
        !/^[6-9]\d{9}$/.test(referrerPhone?.trim()) ||
        !/^[6-9]\d{9}$/.test(referredPhone?.trim()))
      return res.status(400).json({ success:false, message:'Invalid data' });
    await Referral.create({ referrerName:referrerName.trim(), referrerPhone:referrerPhone.trim(), referredName:referredName.trim(), referredPhone:referredPhone.trim(), projectType:projectType||'' });
    return res.json({ success:true, message:'Referral submitted!' });
  } catch { return res.status(500).json({ success:false, message:'Server error' }); }
});

// ── Brochure lead ──────────────────────────────────────────
app.post('/api/brochure-lead', formLimiter, async (req, res) => {
  try {
    const { name, email } = req.body;
    if (!name?.trim() || !/\S+@\S+\.\S+/.test(email?.trim()))
      return res.status(400).json({ success:false, message:'Invalid data' });
    // Save as a lead
    await Lead.create({ name:name.trim(), phone:'0000000000', email:email.trim().toLowerCase(), city:'N/A', workType:'Other', message:'Brochure download request' });
    return res.json({ success:true });
  } catch { return res.status(500).json({ success:false, message:'Server error' }); }
});

// ── Admin: Notes ────────────────────────────────────────────
app.post('/api/admin/leads/:id/notes', apiLimiter, async (req, res) => {
  try {
    const { note } = req.body;
    if (!note?.trim()) return res.status(400).json({ success:false });
    const lead = await Lead.findByIdAndUpdate(
      req.params.id,
      { $push: { notes: { text: note.trim() } } },
      { new:true }
    );
    return res.json({ success:true, notes: lead.notes });
  } catch { return res.status(500).json({ success:false }); }
});

// ── Admin: Email reply ─────────────────────────────────────
app.post('/api/admin/leads/:id/reply', apiLimiter, async (req, res) => {
  try {
    const { message } = req.body;
    const lead = await Lead.findById(req.params.id);
    if (!lead) return res.status(404).json({ success:false });

    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      const transporter = nodemailer.createTransport({
        service:'gmail', auth:{ user:process.env.EMAIL_USER, pass:process.env.EMAIL_PASS }
      });
      await transporter.sendMail({
        from:`"NP Construction" <${process.env.EMAIL_USER}>`,
        to: lead.email,
        subject: 'Re: Your inquiry to NP Construction',
        html: `<p>${message.replace(/\n/g,'<br>')}</p><br><p>— NP Construction Team<br>+91 70165 93309</p>`
      });
    }
    await Lead.findByIdAndUpdate(req.params.id, { $push:{ replies:{ message } } });
    return res.json({ success:true });
  } catch { return res.status(500).json({ success:false }); }
});

// ── Admin: Lead score ──────────────────────────────────────
app.patch('/api/admin/leads/:id/score', apiLimiter, async (req, res) => {
  try {
    const lead = await Lead.findByIdAndUpdate(req.params.id, { leadScore: req.body.leadScore }, { new:true });
    return res.json({ success:true, data:lead });
  } catch { return res.status(500).json({ success:false }); }
});

// ── Admin: Callbacks ────────────────────────────────────────
app.get('/api/admin/callbacks', apiLimiter, async (req, res) => {
  try {
    const data = await CallbackRequest.find().sort({ createdAt:-1 });
    return res.json({ success:true, data });
  } catch { return res.status(500).json({ success:false }); }
});
app.patch('/api/admin/callbacks/:id', apiLimiter, async (req, res) => {
  try {
    const cb = await CallbackRequest.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new:true });
    return res.json({ success:true, data:cb });
  } catch { return res.status(500).json({ success:false }); }
});

// ── Admin: Monthly analytics ────────────────────────────────
app.get('/api/admin/leads/monthly', apiLimiter, async (req, res) => {
  try {
    const rangeStart = req.query.from ? new Date(req.query.from) : new Date(Date.now() - 180*24*60*60*1000);
    const rangeEnd = req.query.to ? new Date(new Date(req.query.to).getTime() + 24*60*60*1000) : new Date();
    const data = await Lead.aggregate([
      { $match:{ submittedAt:{ $gte: rangeStart, $lt: rangeEnd } } },
      { $group:{ _id:{ $dateToString:{ format:'%Y-%m', date:'$submittedAt' } }, count:{ $sum:1 } } },
      { $sort:{ _id:1 } }
    ]);
    return res.json({ success:true, data });
  } catch { return res.status(500).json({ success:false }); }
});

// ── Catch-all: serve React ─────────────────────────────────
app.get('*', (_req, res) => {
  const index = path.join(REACT_BUILD, 'index.html');
  if (fs.existsSync(index)) return res.sendFile(index);
  res.status(404).json({ message:'React build not found. Run: cd frontend && npm run build' });
});

// ── Connect MongoDB & start ────────────────────────────────
const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/np-construction';

const connectDB = async (retries=3, delayMs=3000) => {
  for (let i=1; i<=retries; i++) {
    try {
      await mongoose.connect(MONGO_URI, { serverSelectionTimeoutMS:5000 });
      console.log('✅ MongoDB connected →', MONGO_URI.replace(/:\/\/.*@/,'://<credentials>@'));
      return true;
    } catch (err) {
      console.error(`❌ MongoDB attempt ${i}/${retries}: ${err.message}`);
      if (i < retries) await new Promise(r => setTimeout(r, delayMs));
    }
  }
  return false;
};

connectDB().then(ok => {
  if (!ok) {
    console.warn('\n⚠️  MongoDB not connected — server will start anyway.');
    console.warn('   API routes that need the database will return errors.');
    console.warn('   Fix: whitelist your IP in MongoDB Atlas → Network Access\n');
  }
  app.listen(PORT, () => {
    console.log(`
╔═════════════════════════════════════════════════════╗
║  🏗️  NP Construction — Server Running              ║
╠═════════════════════════════════════════════════════╣
║  Website  →  http://localhost:${PORT}               ║
║  Test API →  http://localhost:${PORT}/api/test      ║
║  Admin    →  http://localhost:${PORT}/admin/leads   ║
╚═════════════════════════════════════════════════════╝
  Press Ctrl+C to stop.
    `);
  });
});

process.on('SIGINT', async () => {
  await mongoose.connection.close();
  console.log('\n👋 Server stopped.');
  process.exit(0);
});

// ── Prevent silent crashes ─────────────────────────────────
process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught Exception:', err.message);
  // Don't exit — keep server running
});

process.on('unhandledRejection', (reason) => {
  console.error('❌ Unhandled Rejection:', reason);
  // Don't exit — keep server running
});
