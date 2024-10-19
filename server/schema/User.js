const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { type: String, sparse: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String },
  twoFactorCode: { type: String },
  twoFactorExpires: { type: Date },
  isVerified: { type: Boolean, default: false },
  // Add other fields as needed
}, { timestamps: true });

// Create a model
const User = mongoose.model('User', userSchema);

module.exports = User;