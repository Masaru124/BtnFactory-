const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
  companyName: { type: String, required: true },
  poNumber: { type: String, required: true },
  poDate: { type: Date, required: true },
  poImage: { type: String },
  casting: { type: String, required: true },
  thickness: { type: String, required: true },
  holes: { type: String, required: true },
  boxType: { type: String, required: true },
  rate: { type: Number, required: true },
  status: { type: String, default: 'Pending' },
  createdDate: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Order', OrderSchema);
