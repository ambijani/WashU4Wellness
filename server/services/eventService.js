const Event = require('../schemas/Event'); // Import your Event model
const User = require('../schemas/User'); // Import your User model
const { generateUsername } = require('../helper.js');

// Function to log an event
const logEvent = async (eventData) => {
  try {
    const { eventId, email, eventName, activityType, value, dateTimeLogged } = eventData;

    // Validate the required fields
    if (!email || !eventName || !activityType || !value) {
      throw new Error('Missing required fields');
    }

    // Find the user by email
    const user = await User.findOne({ email });

    if (!user) {
      throw new Error('User not found');
    }

    // Use the username from the User model, or generate one if it doesn't exist
    const username = user.username || generateUsername(email);

    // If the user doesn't have a username, update it
    if (!user.username) {
      user.username = username;
      await user.save();
    }

    // Create a new event document
    const newEvent = new Event({
      eventId,
      username,
      eventName,
      activityType,
      value,
      dateTimeLogged: dateTimeLogged || new Date() // Use provided dateTimeLogged or current date
    });

    // Save the event to the database
    const savedEvent = await newEvent.save();

    // Return the saved event
    return savedEvent;
  } catch (error) {
    console.error('Error logging event:', error);
    throw error; // Re-throw error to be caught by the calling function
  }
};

// Function to fetch logged events by user email (or userId)
const fetchUserLoggedEvents = async (email) => {
  try {
    const username = generateUsername(email);
    // Find all events logged by the user with the given email
    const events = await Event.find({ username });

    if (!events || events.length === 0) {
      throw new Error(`No events found for user with username ${username}`);
    }

    return events;
  } catch (error) {
    console.error(`Error fetching logged events for user with username ${username}:`, error);
    throw error;
  }
};

module.exports = { logEvent, fetchUserLoggedEvents };