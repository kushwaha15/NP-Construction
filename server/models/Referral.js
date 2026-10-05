const mongoose = require('mongoose');
const schema = new mongoose.Schema({
  referrerName:  { type:String, required:true, trim:true },
  referrerPhone: { type:String, required:true, trim:true },
  referredName:  { type:String, required:true, trim:true },
  referredPhone: { type:String, required:true, trim:true },
  projectType:   { type:String, trim:true, default:'' },
}, { timestamps: true });
module.exports = mongoose.model('Referral', schema);
