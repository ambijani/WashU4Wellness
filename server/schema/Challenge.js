const mongoose = require('mongoose');

// Create a schema for the counter (unchanged)
const counterSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  seq: { type: Number, default: 0 }
});

const Counter = mongoose.model('Counter', counterSchema);

// Updated Challenge schema
const challengeSchema = new mongoose.Schema({
  challengeId: { type: Number, unique: true },
  challengeName: { type: String, required: true },
  challengeType: { type: String, required: true },
  challengeDescription: { type: String },
  startDateTime: { type: Date, required: true },
  endDateTime: { type: Date, required: true },
  goalAmount: { type: Number, required: true },
  challengeTags: {
    type: [[mongoose.Schema.Types.Mixed]],
    default: []
  },
  teams: [{
    teamTags: [mongoose.Schema.Types.Mixed],
    score: { type: Number, default: 0 }
  }],
  leaderboard: {
    users: [{
      userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      score: Number
    }],
    teams: [{
      teamTags: [mongoose.Schema.Types.Mixed],
      score: Number
    }]
  }
}, { timestamps: true });

// Add a pre-save hook to auto-increment challengeId (unchanged)
challengeSchema.pre('save', function(next) {
  const doc = this;
  Counter.findByIdAndUpdate(
    { _id: 'challengeId' },
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  )
  .then(function(counter) {
    doc.challengeId = counter.seq;
    next();
  })
  .catch(function(error) {
    return next(error);
  });
});

// Create a model
const Challenge = mongoose.model('Challenge', challengeSchema);

module.exports = Challenge;