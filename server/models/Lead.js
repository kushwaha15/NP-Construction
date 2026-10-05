const mongoose = require('mongoose');

const leadSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    trim: true,
    match: [/^[6-9]\d{9}$/, 'Please enter a valid 10-digit Indian mobile number']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    trim: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email address']
  },
  city: {
    type: String,
    required: [true, 'City is required'],
    trim: true,
    maxlength: [100, 'City cannot exceed 100 characters']
  },
  workType: {
    type: String,
    required: [true, 'Work type is required'],
    enum: ['Beam Reinforcement', 'Slab Reinforcement', 'Column Reinforcement', 'Roof Reinforcement', 'Other']
  },
  tonnage: {
    type: String,
    trim: true,
    default: 'Not specified'
  },
  message: {
    type: String,
    trim: true,
    maxlength: [1000, 'Message cannot exceed 1000 characters'],
    default: ''
  },
  status: {
    type: String,
    enum: ['New', 'Contacted', 'In Progress', 'Closed'],
    default: 'New'
  },
  ipAddress:  { type:String, default:'' },
  leadScore:  { type:String, enum:['🔥 Hot','🌤 Warm','❄️ Cold',''], default:'' },
  files:      [{ type:String }],
  notes:      [{ text:String, createdAt:{ type:Date, default:Date.now } }],
  replies:    [{ message:String, sentAt:{ type:Date, default:Date.now } }],
  submittedAt:{ type:Date, default:Date.now }
}, { timestamps:true });

// Index for faster queries
leadSchema.index({ submittedAt: -1 });
leadSchema.index({ workType: 1 });
leadSchema.index({ city: 1 });

module.exports = mongoose.model('Lead', leadSchema);
