const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false }, // ✅ changed
  companyName: { type: String, required: true },
  poNumber: { type: String, required: true },
  poDate: { type: Date, required: true },
  poImage: { type: String },
  casting: { type: String, required: true },
  thickness: { type: String, required: true },
  linings: { type: String },
  holes: { type: String, required: true },
  laser: { type: String },
  polishType: { type: String },
  boxType: { type: String, required: true },
  rate: { type: Number, required: true },
  quantity: { type: Number },
  packingOption: { type: String },
  buttonImage: { type: String },
  dispatchDate: { type: Date },
  status: { type: String, default: 'Pending' },
  createdDate: { type: Date, default: Date.now },
  token: { type: String, required: true, unique: true },
});

module.exports = mongoose.model('Order', OrderSchema);
