const mongoose = require('mongoose');

// Team Schema
const teamSchema = new mongoose.Schema({
  teamTags: {
    type: [mongoose.Schema.Types.Mixed],
    required: true
  },
  challenges: [{
    challengeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Challenge' },
    score: { type: Number, default: 0 }
  }]
}, { timestamps: true });

const Team = mongoose.model('Team', teamSchema);

module.exports = { Team };