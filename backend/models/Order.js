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

  // ✅ Raw Material Department
  rawMaterials: [
    {
      materialName: { type: String, required: true },
      quantity: { type: Number, required: true },
      totalPrice: { type: Number, required: true },
      updatedAt: { type: Date, default: Date.now },
    },
  ],

  // ✅ Casting Department
  castingProcess: {
    blankThickness: { type: Number }, // e.g., mm
    preparedQuantity: { type: Number }, // weight in grams/kg
    operator: { type: String },
    employeeId: { type: String },
    startDate: { type: Date },
    endDate: { type: Date },
  },

  // ✅ Turning Department
  turningProcess: {
    mcNo: { type: String }, // Machine number
    operator: { type: String },
    employeeId: { type: String },
    remark: { type: String },
    receivedDate: { type: Date },
    startTime: { type: Date },
    endTime: { type: Date },
    grossWeight: { type: Number },
    wtInKg: { type: Number },
    finishThickness: { type: Number },
  },

  // ✅ Polishing Department
  polishProcess: {
    readyThickness: { type: Number },
    weightInGram: { type: Number },
    weightInKg: { type: Number },
    gross: { type: Number, default: 144 }, // 1 gross = 144 buttons
    grossWeightInGram: { type: Number, default: 40 }, // 1 gross = 40g
    polishDate: { type: Date },
    receivedDate: { type: Date },
    startTime: { type: Date },
    endTime: { type: Date },
    operator: { type: String },
    employeeId: { type: String },
  },
});

module.exports = mongoose.model("Order", OrderSchema);
