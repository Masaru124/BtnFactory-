const mongoose = require('mongoose');

const PromotionSchemeSchema = new mongoose.Schema({
  totalQR: { type: Number, default: 0 },
  usedQR: { type: Number, default: 0 },
  unusedQR: { type: Number, default: 0 },
  creationDate: { type: Date, default: Date.now },
  totalApproved: { type: Number, default: 0 },
  totalUnapproved: { type: Number, default: 0 },
  positiveResponse: { type: Number, default: 0 },
  negativeResponse: { type: Number, default: 0 },
});

module.exports = mongoose.model('PromotionScheme', PromotionSchemeSchema);
