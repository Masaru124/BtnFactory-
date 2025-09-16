const mongoose = require("mongoose");

const OrderSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: false,
  },

  // Core Order Info
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
  toolNumber: { type: Number, required: true },
  rate: { type: Number, required: true },
  quantity: { type: Number },
  packingOption: { type: String },
  buttonImage: { type: String },
  dispatchDate: { type: Date },
  destination: { type: String },
  status: { type: String, default: "Pending" },
  createdDate: { type: Date, default: Date.now },
  token: { type: String, required: true, unique: true },

  // ✅ Raw Material Department fields
  rawMaterials: [
    {
      materialName: { type: String, required: true },
      quantity: { type: Number, required: true },
      totalPrice: { type: Number, required: true },
      updatedAt: { type: Date, default: Date.now },
    },
  ],

  // ✅ Casting Department fields
  castingProcess: {
    rawMaterialsUsed: { type: String },
    sheetsMade: { type: Number },
    sheetsWasted: { type: Number },
    startTime: { type: Date },
    endTime: { type: Date },
  },

  // ✅ Polishing Department fields (fixed name to match routes)
  polishProcess: {
    totalSheets: { type: Number },
    polishDate: { type: Date },
    receivedDate: { type: Date },
    startTime: { type: Date },
    endTime: { type: Date },
    GrossWeight: { type: Number },
    WtinKg: { type: Number },
  },

  // ✅ Turning Department fields (added, missing before)
  turningProcess: {
    totalSheets: { type: Number },
    turningDate: { type: Date },
    receivedDate: { type: Date },
    startTime: { type: Date },
    endTime: { type: Date },
    GrossWeight: { type: Number },
    WtinKg: { type: Number },
    FinishThickness: { type: Number },
  },
});

module.exports = mongoose.model("Order", OrderSchema);
