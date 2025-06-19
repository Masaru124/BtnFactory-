const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
  token: { type: String, required: true, unique: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  button: { type: String, required: true },
  orderQty: { type: Number, required: true },
  challanQty: { type: Number, required: true },
  laser: { type: String },
  createdDate: { type: Date, default: Date.now },
  status: { type: String, default: 'Pending' },
});

module.exports = mongoose.model('Order', OrderSchema);
