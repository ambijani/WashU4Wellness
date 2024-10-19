const mongoose = require('mongoose');

const teamSchema = new mongoose.Schema({
  teamTags: {
    type: [String],  // Changed to String for consistency
    required: true
  },
  challenges: [{
    challengeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Challenge' },
    score: { type: Number, default: 0 }
  }]
}, { timestamps: true });

const Team = mongoose.model('Team', teamSchema);
module.exports = Team;
