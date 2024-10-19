const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { type: String, sparse: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String },
  twoFactorCode: { type: String },
  twoFactorExpires: { type: Date },
  isVerified: { type: Boolean, default: false },
  tags: {
    type: [[mongoose.Schema.Types.Mixed]],
    default: []
  },
  assignedChallenges: [{
    challengeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Challenge' },
    assignedTags: [mongoose.Schema.Types.Mixed],
    score: { type: Number, default: 0 }
  }],
  totalScore: { type: Number, default: 0 }
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

module.exports = User;