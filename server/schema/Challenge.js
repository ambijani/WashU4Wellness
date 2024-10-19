const mongoose = require('mongoose');

const challengeSchema = new mongoose.Schema({
  challengeId: { type: String, required: true, unique: true },
  challengeName: { type: String, required: true },
  challengeType: { type: String, required: true },
  challengeDescription: { type: String },
  startDateTime: { type: Date, required: true },
  endDateTime: { type: Date, required: true },
  goalAmount: { type: Number, required: true }
}, { timestamps: true });

// Create a model
const Challenge = mongoose.model('Challenge', challengeSchema);

module.exports = Challenge;