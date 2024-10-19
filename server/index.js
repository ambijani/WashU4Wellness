// ------------- MONGO -------------
const mongoose = require('mongoose');
const uri = 'mongodb+srv://alybijani:benchode@pakiboy.rbqbd.mongodb.net/?retryWrites=true&w=majority&appName=pakiboy';
mongoose.connect(uri)
  .then(() => {
    console.log('Successfully connected to MongoDB Atlas!');
  })
  .catch((error) => {
    console.error('Error connecting to MongoDB Atlas: ', error);
  });

// ------------- SCHEMAs -------------
const User = require('./schema/User');

// ------------- JS -------------
const express = require('express');
const app = express();
const port = 3000;
const cors = require('cors');
app.use(cors());
app.use(express.json());

// ------------- MODULES -------------
const emailService = require('./emailService');

// ------------- CODE -------------
app.get('/', (req, res) => {
    res.send('Hello World!');
});

app.post('/register', async (req, res) => {
  // const { email } = req.body;
  const email = "alybijani@gmail.com";

  try {
    // Check if the email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    // Send verification email
    const emailSent = await emailService.sendVerificationEmail(email);
    
    if (emailSent) {
      res.json({ message: 'Verification email sent. Please check your email to complete registration.' });
    } else {
      res.status(500).json({ error: 'Failed to send verification email.' });
    }
  } catch (error) {
    console.error('Error in registration process:', error);
    res.status(500).json({ error: 'Error in registration process' });
  }
});

app.post('/verify/:token', async (req, res) => {
  const token = req.params.token;
  const { username, password } = req.body;
  const { verified, email } = emailService.verifyEmail(token);

  if (verified && email) {
    try {
      // Create a new user with the verified email
      const newUser = new User({
        username,
        email,
        password,
        verified: true
      });
      await newUser.save();
      res.json({ message: 'Email verified successfully. You can now log in.' });
    } catch (error) {
      console.error('Error saving verified user:', error);
      res.status(500).json({ error: 'Error completing registration' });
    }
  } else {
    res.status(400).json({ error: 'Invalid or expired verification link' });
  }
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});