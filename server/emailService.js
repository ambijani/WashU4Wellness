const sgMail = require('@sendgrid/mail');
const User = require('./models/User');  // Import User model

// Set the SendGrid API key from your environment variables
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

/**
 * Sends the verification email using SendGrid.
 * @param {string} email - The user's email address.
 * @param {string} token - The generated 6-digit token.
 */
const sendVerificationEmail = async (email, token) => {
  const msg = {
    to: email,  // Send email to the user's email address
    from: 'washuwellnessdonotreply@gmail.com',  // Use a verified sender email
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
};

/**
 * Verifies the provided token against the token stored in the database.
 * @param {string} email - The user's email address.
 * @param {string} token - The token entered by the user.
 * @returns {boolean} - Returns true if the token is valid, false otherwise.
 */
const verifyToken = async (email, token) => {
  try {
    const user = await User.findOne({ 
      email, 
      twoFactorCode: token,
      twoFactorExpires: { $gt: Date.now() }
    });

    return !!user; // Returns true if user is found, false otherwise
  } catch (error) {
    console.error('Error verifying token:', error);
    throw new Error('Error verifying token');
  }
};

module.exports = { sendVerificationEmail, verifyToken };
