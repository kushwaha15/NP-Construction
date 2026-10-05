const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const nodemailer = require('nodemailer');
const Lead = require('../models/Lead');

// ─── Validation Rules ─────────────────────────────────────────────────────────
const contactValidation = [
  body('name')
    .trim()
    .notEmpty().withMessage('Name is required')
    .isLength({ min: 2, max: 100 }).withMessage('Name must be 2-100 characters'),

  body('phone')
    .trim()
    .notEmpty().withMessage('Phone number is required')
    .matches(/^[6-9]\d{9}$/).withMessage('Enter a valid 10-digit Indian mobile number'),

  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Enter a valid email address')
    .normalizeEmail(),

  body('city')
    .trim()
    .notEmpty().withMessage('City / Project Location is required')
    .isLength({ max: 100 }).withMessage('City name too long'),

  body('workType')
    .notEmpty().withMessage('Please select a type of work')
    .isIn(['Beam Reinforcement', 'Slab Reinforcement', 'Column Reinforcement', 'Roof Reinforcement', 'Other'])
    .withMessage('Invalid work type selected'),

  body('tonnage')
    .optional()
    .trim()
    .isLength({ max: 50 }).withMessage('Tonnage field too long'),

  body('message')
    .optional()
    .trim()
    .isLength({ max: 1000 }).withMessage('Message cannot exceed 1000 characters')
];

// ─── Email Transporter ────────────────────────────────────────────────────────
const createTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
};

// ─── Send Notification Email ──────────────────────────────────────────────────
const sendNotificationEmail = async (leadData) => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.log('⚠️  Email credentials not configured. Skipping email notification.');
    return;
  }

  const transporter = createTransporter();

  const mailOptions = {
    from: `"NP Construction Website" <${process.env.EMAIL_USER}>`,
    to: process.env.OWNER_EMAIL,
    subject: `🔔 New Lead: ${leadData.name} - ${leadData.workType}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; background: #f5f5f5; }
          .container { max-width: 600px; margin: 20px auto; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
          .header { background: #0A1628; padding: 20px; text-align: center; }
          .header h2 { color: #E07B39; margin: 0; }
          .header p { color: white; margin: 5px 0 0; }
          .body { padding: 30px; }
          .field { margin-bottom: 15px; border-bottom: 1px solid #eee; padding-bottom: 15px; }
          .label { font-weight: bold; color: #0A1628; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px; }
          .value { color: #333; font-size: 16px; margin-top: 4px; }
          .footer { background: #0A1628; padding: 15px; text-align: center; color: #888; font-size: 12px; }
          .badge { display: inline-block; background: #E07B39; color: white; padding: 4px 12px; border-radius: 20px; font-size: 13px; font-weight: bold; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2>🏗️ NP Construction</h2>
            <p>New Lead Received from Website</p>
          </div>
          <div class="body">
            <div class="field">
              <div class="label">Full Name</div>
              <div class="value">${leadData.name}</div>
            </div>
            <div class="field">
              <div class="label">Phone Number</div>
              <div class="value"><a href="tel:+91${leadData.phone}">+91 ${leadData.phone}</a></div>
            </div>
            <div class="field">
              <div class="label">Email Address</div>
              <div class="value"><a href="mailto:${leadData.email}">${leadData.email}</a></div>
            </div>
            <div class="field">
              <div class="label">City / Project Location</div>
              <div class="value">${leadData.city}</div>
            </div>
            <div class="field">
              <div class="label">Type of Work</div>
              <div class="value"><span class="badge">${leadData.workType}</span></div>
            </div>
            <div class="field">
              <div class="label">Estimated Tonnage</div>
              <div class="value">${leadData.tonnage || 'Not specified'}</div>
            </div>
            <div class="field">
              <div class="label">Message / Project Details</div>
              <div class="value">${leadData.message || 'No message provided'}</div>
            </div>
            <div class="field" style="border: none;">
              <div class="label">Submitted At</div>
              <div class="value">${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })} (IST)</div>
            </div>
          </div>
          <div class="footer">
            <p>This email was sent automatically from NP Construction website.</p>
            <p>View all leads: <a href="http://localhost:5000/admin.html" style="color: #E07B39;">Admin Panel</a></p>
          </div>
        </div>
      </body>
      </html>
    `
  };

  await transporter.sendMail(mailOptions);
  console.log('✅ Notification email sent to:', process.env.OWNER_EMAIL);
};

// ─── POST /api/contact ────────────────────────────────────────────────────────
router.post('/', contactValidation, async (req, res) => {
  // Check validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map(e => ({ field: e.path, message: e.msg }))
    });
  }
  
  try {
    const { name, phone, email, city, workType, tonnage, message } = req.body;

    // Get IP address
    const ipAddress = req.headers['x-forwarded-for'] ||
                      req.connection.remoteAddress ||
                      req.socket.remoteAddress || '';

    // Save to MongoDB
    const lead = new Lead({
      name,
      phone,
      email,
      city,
      workType,
      tonnage: tonnage || 'Not specified',
      message: message || '',
      ipAddress: String(ipAddress).split(',')[0].trim(),
      files: (req.files || []).map(f => f.filename),
    });

    await lead.save();
    console.log(`✅ New lead saved: ${name} - ${phone} - ${workType}`);

    // Send email notification (non-blocking)
    sendNotificationEmail({ name, phone, email, city, workType, tonnage, message })
      .catch(err => console.error('❌ Email send failed:', err.message));

    return res.status(201).json({
      success: true,
      message: 'Thank you! We will contact you shortly.',
      leadId: lead._id
    });

  } catch (err) {
    console.error('❌ Contact form error:', err.message);
    return res.status(500).json({
      success: false,
      message: 'Server error. Please try again or call us directly.'
    });
  }
});

module.exports = router;
