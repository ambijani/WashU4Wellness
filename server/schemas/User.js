const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { type: String, sparse: true, unique: true },
  email: { type: String, required: true, unique: true },
  twoFactorCode: { type: String },
  twoFactorExpires: { type: Date },
  isVerified: { type: Boolean, default: false },
  isAdmin: { type: Boolean, default: false },
  goalValue: { type: Number, default: 0 },
  goalType: { type: String },
  tags: {
    type: [[String]],  // Changed to String for consistency
    default: []
  },
  assignedChallenges: [{
    challengeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Challenge' },
    assignedTags: [String],  // Changed to String for consistency
    score: { type: Number, default: 0 }
  }],
  totalScore: { type: Number, default: 0 }
}, { timestamps: true });

const User = mongoose.model('User', userSchema);
module.exports = User;