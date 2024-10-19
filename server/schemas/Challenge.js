const mongoose = require('mongoose');

const counterSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  seq: { type: Number, default: 0 }
});

const Counter = mongoose.model('Counter', counterSchema);

const challengeSchema = new mongoose.Schema({
  challengeId: { type: Number, unique: true },
  challengeName: { type: String, required: true },
  challengeType: { type: String, required: true },
  challengeDescription: { type: String },
  startDateTime: { type: Date, required: true },
  endDateTime: { type: Date, required: true },
  goalAmount: { type: Number, required: true },
  challengeTags: {
    type: [[String]],  // Changed to String for consistency
    default: []
  },
  teams: [{
    teamTags: [String],  // Changed to String for consistency
    score: { type: Number, default: 0 }
  }],
  leaderboard: {
    users: [{
      userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      score: Number
    }],
    teams: [{
      teamTags: [String],  // Changed to String for consistency
      score: Number
    }]
  }
}, { timestamps: true });

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

const Challenge = mongoose.model('Challenge', challengeSchema);
module.exports = Challenge;