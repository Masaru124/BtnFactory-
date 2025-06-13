const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { type: String, unique: true },
  password: String, // In production, hash passwords
  role: { type: String, enum: ['admin', 'staff', 'user'], default: 'user' },
});

module.exports = mongoose.model('User', userSchema);
