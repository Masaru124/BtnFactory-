const mongoose = require("mongoose");

const CustomerHistorySchema = new mongoose.Schema({
  customerName: { type: String, required: true },
  token: { type: String, required: true },
  button: { type: String, required: true },
  orderQty: { type: Number, required: true },
  challanQty: { type: Number, required: true },
  laser: { type: String },
  createdDate: { type: Date, default: Date.now },
  action: { type: String },
});

module.exports = mongoose.model("CustomerHistory", CustomerHistorySchema);
