require('dotenv').config();  // Load environment variables
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

// ------------- APP SETUP -------------
const app = express();
const port = 3000;
app.use(cors());
app.use(express.json()); // To parse JSON bodies

// ------------- METHOD IMPORTS -------------
const { sendVerificationEmail, verifyToken, updateUserTags, getUserTags } = require('./services/emailService');
const { createChallenge, updateChallenge, fetchUserChallengesByEmail } = require('./services/challengeService');
const { getAllTags, getUserGoalInfo, updateUserGoalInfo, getUsernameById } = require('./helper');
const { logEvent, fetchUserLoggedEvents  } = require('./services/eventService');
const { getAllSingleChallengeInfo } = require('./services/leaderboardService');
// ------------- MONGO SETUP -------------
const uri = 'mongodb+srv://alybijani:benchode@pakiboy.rbqbd.mongodb.net/?retryWrites=true&w=majority&appName=pakiboy';
mongoose.connect(uri)
  .then(() => {
    console.log('Successfully connected to MongoDB Atlas!');
  })
  .catch((error) => {
    console.error('Error connecting to MongoDB Atlas: ', error);
  });

// ------------- USER ROUTES -------------

// -- SEND VERIFICATION EMAIL --
app.post('/send-verification', async (req, res) => {
  const { email } = req.body;
  try {
    await sendVerificationEmail(email);
    res.status(200).json({ message: 'Verification email sent successfully.' });
  } catch (error) {
    console.error('Error sending verification email:', error);
    if (error.code === 11000) {
      res.status(409).json({ message: 'Email already exists.' });
    } else {
      res.status(500).json({ message: 'Failed to send verification email.' });
    }
  }
});

// -- VERIFY TOKEN --
app.post('/verify-token/:token', async (req, res) => {
  try {
    await verifyToken(req.body.email, req.params.token);
    res.status(200).json({ message: 'Verification successful' });
  } catch (error) {
    console.error('Error verifying token:', error);
    res.status(error.message.includes('required') ? 400 : 401).json({ message: error.message });
  }
});

// -- UPDATE TAGS --
app.post('/update-user-tags', async (req, res) => {
  try {
    const { email, tags } = req.body;
    const updatedUser = await updateUserTags(email, tags);
    res.status(200).json({ message: 'User tags updated successfully', user: updatedUser });
  } catch (error) {
    console.error('Error updating user tags:', error);
    res.status(500).json({ message: 'Error updating user tags', error: error.message });
  }
});

// -- GET TAGS --
app.post('/get-user-tags', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }
    const userTags = await getUserTags(email);
    res.status(200).json({ message: 'User tags retrieved successfully', tags: userTags });
  } catch (error) {
    console.error('Error retrieving user tags:', error);
    if (error.message === 'User not found') {
      res.status(404).json({ message: 'User not found', error: error.message });
    } else {
      res.status(500).json({ message: 'Error retrieving user tags', error: error.message });
    }
  }
});

app.post('/get-username-by-id', async (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }
    const username = await getUsernameById(userId);
    res.status(200).json({ username });
  } catch (error) {
    console.error('Error in get username by ID route:', error);
    if (error.message === 'User not found') {
      res.status(404).json({ message: error.message });
    } else {
      res.status(500).json({ message: 'Internal server error', error: error.message });
    }
  }
});

// ------------- USER GOAL INFO -------------
// Route to get user goal info
app.post('/get-user-goal-info', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }
    const goalInfo = await getUserGoalInfo(email);
    res.status(200).json({ message: 'User goal info retrieved successfully', goalInfo });
  } catch (error) {
    console.error('Error retrieving user goal info:', error);
    if (error.message === 'User not found') {
      res.status(404).json({ message: 'User not found' });
    } else {
      res.status(500).json({ message: 'Error retrieving user goal info', error: error.message });
    }
  }
});

// Route to update user goal info
app.post('/update-user-goal-info', async (req, res) => {
  try {
    const { email, goalType, goalValue: rawValue } = req.body;
    if (!email || !goalType || rawValue === undefined) {
      return res.status(400).json({ message: 'Email, goalType, and goalValue are required' });
    }
    const goalValue = parseInt(rawValue);
    const updatedGoalInfo = await updateUserGoalInfo(email, goalType, goalValue);
    res.status(200).json({ message: 'User goal info updated successfully', goalInfo: updatedGoalInfo });
  } catch (error) {
    console.error('Error updating user goal info:', error);
    if (error.message === 'User not found') {
      res.status(404).json({ message: 'User not found' });
    } else {
      res.status(500).json({ message: 'Error updating user goal info', error: error.message });
    }
  }
});


// ------------- CHALLENGE ROUTES -------------

// -- CREATE CHALLENGE --
app.post('/create-challenge', async (req, res) => {
  try {
    await createChallenge(req.body);
    res.status(200).json({ message: ' Challenge made successfully.'});
  } catch (error) {
    console.error('Error creating challenge:', error);
    res.status(500).json({ message: 'Error creating challenge', error: error.message });
  }
});

app.put('/update-challenge/:challengeId', async (req, res) => {
  try {
    const updatedChallenge = await updateChallenge(req.params.challengeId, req.body);
    res.status(200).json({ message: 'Challenge updated successfully', challenge: updatedChallenge });
  } catch (error) {
    console.error('Error updating challenge:', error);
    res.status(500).json({ message: 'Error updating challenge', error: error.message });
  }
});

app.post('/get-user-challenges', async (req, res) => {
  try {
    const { email } = req.body; // Use query parameters for GET requests
    console.log('Email:', email);
    // Validate that email is provided
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    // Call the method from challengeService.js to fetch challenges
    const challenges = await fetchUserChallengesByEmail(email);

    // Respond with the user's challenges
    res.status(200).json({
      message: 'User challenges retrieved successfully',
      challenges: challenges
    });
  } catch (error) {
    console.error('Error fetching user challenges:', error);
    res.status(500).json({ message: 'Error fetching user challenges', error: error.message });
  }
});

app.post('/get-single-challenge/:challengeID', async (req, res) => {
  try {
    const { challengeID: rawID } = req.params;
    const { email } = req.body;
    const challengeID = parseInt(rawID);
    if (!email) {
      return res.status(400).json({ message: 'Email is required in the request body' });
    }

    const challenge = await getAllSingleChallengeInfo(parseInt(challengeID), email);
    res.status(200).json({
      message: `Challenge with ID ${challengeID} retrieved successfully`,
      challenge: challenge
    });
  } catch (error) {
    console.error('Error fetching challenge:', error);
    res.status(error.message.includes('not found') ? 404 : 500)
       .json({ message: 'Error fetching challenge', error: error.message });
  }
});

// ------------- HELPER ROUTES -------------
app.get('/get-all-activities', async (req, res) => {
  try {
    const activities = ['distance', 'steps', 'time', 'calories'];

    res.status(200).json(activities);
  } catch (error) {
    console.error('Error fetching activities:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.get('/get-all-tag-choices', async (req, res) => {
  try {
    tags = getAllTags();
    res.status(200).json(tags);
  } catch {
    console.error('Error in get-all-tag-choices:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
})


// ------------- ADMIN GET ALL CHALLENGES -------------
app.get('/get-all-challenges', async (req, res) => {
  try {
    // Fetch all challenges using the service method
    const challenges = await fetchAllChallenges();

    // Respond with the challenges
    res.status(200).json({
      message: 'All challenges retrieved successfully',
      challenges: challenges
    });
  } catch (error) {
    console.error('Error fetching all challenges:', error);
    res.status(500).json({ message: 'Error fetching all challenges', error: error.message });
  }
});

// ------------- EVENTS -------------

app.post('/log-event', async (req, res) => {
  try {
    const eventData = req.body.event; // Get event data from request body

    // Call the logEvent function
    const savedEvent = await logEvent(eventData);

    // Respond with the saved event
    res.status(201).json({
      message: 'Event logged successfully.',
      event: savedEvent
    });
  } catch (error) {
    console.error('Error logging event:', error);
    res.status(500).json({ message: 'Error logging event', error: error.message });
  }
});

app.post('/get-user-logged-events', async (req, res) => {
  try {
    const { email } = req.body; // Extract email from the request body

    // Validate that email is provided
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    // Call the service method to fetch the logged events
    const events = await fetchUserLoggedEvents(email);

    // Respond with the logged events
    res.status(200).json({
      message: `Logged events for user with email ${email} retrieved successfully`,
      events: events
    });
  } catch (error) {
    console.error('Error fetching user logged events:', error);
    res.status(500).json({ message: 'Error fetching user logged events', error: error.message });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
