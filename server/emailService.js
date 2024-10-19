const sgMail = require('@sendgrid/mail');
const User = require('./schema/User');  // Import User model
const { generateUsername } = require('./helper.js');

// Set the SendGrid API key from your environment variables
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendVerificationEmail = async (email) => {
  if (!email) {
    return res.status(400).json({ message: 'Email is required' });
  }

  const username = generateUsername(email);
  if (!username) {
    throw new Error('Failed to generate valid username from email');
  }

  const token = Math.floor(100000 + Math.random() * 900000).toString();
  
  const user = await User.findOneAndUpdate(
    { email },
    {
      $setOnInsert: { username },
      twoFactorCode: token,
      twoFactorExpires: Date.now() + 10 * 60 * 1000,
      isVerified: false,
    },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );

  const msg = {
    to: email,
    from: 'washuwellnessdonotreply@gmail.com',
    subject: 'Your 2FA Verification Code',
    text: `Your verification code is: ${token}`,
    html: `<strong>Your verification code is: ${token}</strong>`,
  };

  try {
    await sgMail.send(msg);
    console.log('Verification email sent to:', email);
  } catch (error) {
    console.error('Error sending email:', error.response ? error.response.body : error);
    throw new Error('Failed to send verification email');
  }

  return user;
};


const verifyToken = async (email, token) => {
  if (!email || !token) {
    throw new Error('Email and token are required for verification.');
  }

  const user = await User.findOneAndUpdate(
    { 
      email, 
      twoFactorCode: token,
      twoFactorExpires: { $gt: Date.now() }
    },
    { 
      isVerified: true, 
      $unset: { twoFactorCode: "", twoFactorExpires: "" }
    },
    { new: true }
  );

  if (!user) {
    throw new Error('Invalid or expired token');
  }

  return user;
};

module.exports = { sendVerificationEmail, verifyToken };
