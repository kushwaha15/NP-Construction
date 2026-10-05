const mongoose = require('mongoose');
const schema = new mongoose.Schema({
  name:          { type:String, required:true, trim:true },
  phone:         { type:String, required:true, trim:true },
  preferredTime: { type:String, default:'Morning', enum:['Morning (9am–12pm)','Afternoon (12pm–4pm)','Evening (4pm–7pm)'] },
  status:        { type:String, default:'Pending', enum:['Pending','Called'] },
}, { timestamps: true });
module.exports = mongoose.model('CallbackRequest', schema);
