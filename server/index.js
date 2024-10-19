require('dotenv').config();  // Load environment variables
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const { sendVerificationEmail, verifyToken } = require('./emailService');  // Import functions from emailService.js

// ------------- MONGO SETUP -------------
const uri = 'mongodb+srv://alybijani:benchode@pakiboy.rbqbd.mongodb.net/?retryWrites=true&w=majority&appName=pakiboy';
mongoose.connect(uri)
  .then(() => {
    console.log('Successfully connected to MongoDB Atlas!');
  })
  .catch((error) => {
    console.error('Error connecting to MongoDB Atlas: ', error);
  });

// ------------- SCHEMAS -------------
const User = require('./models/User');  // Adjust path based on your file structure

// ------------- APP SETUP -------------
const app = express();
const port = 3000;

app.use(cors());
app.use(express.json()); // To parse JSON bodies

// ------------- ROUTES -------------

// -- SEND VERIFICATION EMAIL --
app.post('/send-verification', async (req, res) => {
  try {
    await sendVerificationEmail(req.body);
    res.status(200).json({ message: 'Verification email sent successfully.' });
  } catch (error) {
    console.error('Error sending verification email:', error);
    if (error.code === 11000) {
      res.status(409).json({ message: 'Email or username already exists.' });
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


// -- GET: fitness data --





// Start the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
