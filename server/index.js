require('dotenv').config();  // Load environment variables
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const { sendVerificationEmail, verifyToken } = require('./emailService');  // Import functions from emailService.js
const { generateUsername } = require('./helper.js');
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
  const { email } = req.body;
  try {
    // Validate email
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const username = generateUsername(email);
    
    // Validate generated username
    if (!username) {
      return res.status(400).json({ message: 'Failed to generate valid username from email' });
    }

    console.log(username);
    
    // Generate a 6-digit token
    const token = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Update or create a user with the generated token
    const user = await User.findOneAndUpdate(
      { email },
      {
        $setOnInsert: { username }, // Only set username if inserting a new document
        twoFactorCode: token,
        twoFactorExpires: Date.now() + 10 * 60 * 1000, // Token expires in 10 minutes
        isVerified: false,
      },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    // Send the verification email
    await sendVerificationEmail(user.email, token);
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
  const token = req.params.token;
  const { email } = req.body;  

  try {
    console.log(email);
    // Ensure email is provided
    if (!email) {
      return res.status(400).json({ message: 'Email is required for verification.' });
    }

    // Verify the token using the verifyToken function
    const isValid = await verifyToken(email, token);

    if (isValid) {
      await User.findOneAndUpdate(
        { email },
        { isVerified: true, twoFactorCode: null, twoFactorExpires: null }  // Mark the user as verified and clear the token
      );
      res.status(200).json({ message: 'Verification successful' });
    } else {
      res.status(400).json({ message: 'Invalid or expired token' });
    }
  } catch (error) {
    console.error('Error verifying token:', error);
    res.status(500).json({ message: 'Error verifying token', error: error.message });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
