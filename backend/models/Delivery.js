const mongoose = require('mongoose');

const deliverySchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
  quantity: Number,
  status: { type: String, enum: ['pending', 'shipped', 'delivered'], default: 'pending' },
});

module.exports = mongoose.model('Delivery', deliverySchema);
