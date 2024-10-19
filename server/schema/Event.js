const mongoose = require('mongoose');

// Avoid overwriting the Counter model if it has already been registered
const Counter = mongoose.models.Counter || mongoose.model('Counter', new mongoose.Schema({
  _id: { type: String, required: true },
  seq: { type: Number, default: 0 }
}));

const eventSchema = new mongoose.Schema({
  eventId: { type: String, unique: true },
  username: { type: String, required: true },
  eventName: { type: String, required: true },
  activityType: { type: String, required: true },
  value: { type: Number, required: true },
  dateTimeLogged: { type: Date, default: Date.now }
}, { timestamps: true });

eventSchema.pre('save', function(next) {
  const doc = this;
  Counter.findByIdAndUpdate(
    { _id: 'eventId' },
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  )
  .then(function(counter) {
    doc.eventId = counter.seq;
    next();
  })
  .catch(function(error) {
    return next(error);
  });
});

// Create the Event model
const Event = mongoose.models.Event || mongoose.model('Event', eventSchema);
module.exports = Event;