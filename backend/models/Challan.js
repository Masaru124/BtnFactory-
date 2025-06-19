const mongoose = require('mongoose');

const ChallanSchema = new mongoose.Schema({
  challanNumber: { type: String, required: true, unique: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  orderToken: { type: String, required: true },
  quantity: { type: Number, required: true },
  createdDate: { type: Date, default: Date.now },
  status: { type: String, default: 'Pending' },
});

module.exports = mongoose.model('Challan', ChallanSchema);
