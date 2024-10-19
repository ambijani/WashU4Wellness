const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  eventId: { type: String, required: true, unique: true },
  username: { type: String, required: true },
  eventName: { type: String, required: true },
  activityType: { type: String, required: true },
  value: { type: Number, required: true },
  dateTimeLogged: { type: Date, default: Date.now }
}, { timestamps: true });

// Create a model
const Event = mongoose.model('Event', eventSchema);

module.exports = Event;