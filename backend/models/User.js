const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { type: String, unique: true },
  password: String, // In production, hash passwords
  roles: {
    type: [String],
    enum: ['admin', 'staff', 'user'],
    default: ['user'],
  },
  departments: {
    type: [String],
    enum: ['Production', 'Quality', 'Packing', 'Accounting', 'Inventory'],
    default: [],
  },
});

module.exports = mongoose.model('User', userSchema);
