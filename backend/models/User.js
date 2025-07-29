const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: { type: String, unique: true },
  password: String, // In production, hash passwords
  roles: {
    type: [String],
    enum: ["admin", "staff", "user"],
    default: ["user"],
  },
  departments: {
    type: [String],
    enum: ["Raw Material", "Casting", "Turning", "Polish", "Packing"],
    default: ["pending"],
  },
});

module.exports = mongoose.model("User", userSchema);
