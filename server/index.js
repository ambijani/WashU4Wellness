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
const { sendVerificationEmail, verifyToken, updateUserTags } = require('./services/emailService');
const { createChallenge, updateChallenge } = require('./services/challengeService');
const { getAllTags } = require('./helper');

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




// ------------- CHALLENGE ROUTES -------------

// -- CREATE CHALLENGE --
app.post('/create-challenge', async (req, res) => {
  try {
    const newChallenge = await createChallenge(req.body);
    res.status(201).json({ message: 'Challenge created successfully', challenge: newChallenge });
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




// Start the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
