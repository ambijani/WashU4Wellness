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
const { sendVerificationEmail, verifyToken } = require('./emailService');  // Import functions from emailService.js
const { updateChallenge, getUserChallenges } = require('./challengeService');
const { range } = require('./helper');
const { logEvent } = require('./eventService');

// ------------- MONGO SETUP -------------
const uri = 'mongodb+srv://alybijani:benchode@pakiboy.rbqbd.mongodb.net/?retryWrites=true&w=majority&appName=pakiboy';
mongoose.connect(uri)
  .then(() => {
    console.log('Successfully connected to MongoDB Atlas!');
  })
  .catch((error) => {
    console.error('Error connecting to MongoDB Atlas: ', error);
  });

// ------------- ROUTES -------------

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


// -- HELPER FUNCTIONS --
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
    const yearOf = range(2020, 2025);
    const major = [
      'Computer Eng.',
      'Computer Sci.',
      'Software Eng.',
      'Electrical Eng.',
      'Mechanical Eng.',
      'Civil Eng.',
      'Biomedical Eng.',
      'Data Science',
      'Information Technology',
      'Physics',
      'Mathematics'
    ];
    const housing = [
      'Bear Beginnings',
      'Umrath House',
      'Liggett House',
      'Rubelmann Hall',
      'Eliot House',
      'Shanedling House',
      'Dardick House',
      'Thomas H. Eliot Residential College',
      'Park/Mudd Residential College',
      'Koenig Residential College',
      'South 40 House',
      'The Village',
      'Millbrook Apartments',
      'Lofts Apartments',
      'off campus'
    ];
    const clubs = ['ACM', 'DBF', 'MSA', 'IEEE', 'WU Racing', ''];
    const tags = {
      yearOf,
      major,
      housing,
      clubs
    }
    res.status(200).json(tags);
  } catch {
    console.error('Error in get-all-tag-choices:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
})


// -- CHALLENGES --
app.post('/create-challenge', async (req, res) => {
  try {
    await updateChallenge(req.body);
    res.status(200).json({ message: ' Challenge made successfully.'});
  } catch (error) {
    console.error('Error creating challenge:', error);
    res.status(500).json({ message: 'Error creating challenge', error: error.message });
  }
});

app.get('/get-user-challenge', async (req, res) => {
  try {
    const email = req.body.email;  // Get email from the query parameters
    console.log(email);
    // Ensure that the email is provided
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    // Call the abstracted function to get user challenges
    const userChallenges = await getUserChallenges(email);

    // Send the user challenges as a response
    res.status(200).json(userChallenges);
  } catch (error) {
    console.error('Error fetching user challenges:', error);
    res.status(500).json({ message: 'Error fetching user challenges', error: error.message });
  }
});

// POST /log-event route to log a new event
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

// Start the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
