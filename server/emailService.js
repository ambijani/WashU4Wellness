const nodemailer = require('nodemailer');
const crypto = require('crypto');

// In-memory storage for verification tokens (replace with a database in production)
const verificationTokens = new Map();

// Create a test account and transporter
let testAccount;
let transporter;

const initializeTransporter = async () => {
  // Generate test SMTP service account from ethereal.email
  testAccount = await nodemailer.createTestAccount();

  // Create a SMTP transporter object
  transporter = nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    secure: false, // TLS
    auth: {
      user: testAccount.user,
      pass: testAccount.pass
    }
  });
};

const generateToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

const sendVerificationEmail = async (_email) => {
  if (!transporter) {
    await initializeTransporter();
  }

  const token = generateToken();
  const expirationTime = Date.now() + 3600000; // Token expires in 1 hour

  // Store the token with the email and expiration time
  email = 'alybijani@gmail.com';
  verificationTokens.set(token, { email, expirationTime });
  const mailOptions = {
    from: '"WashuWellness" <noreply@washuwellness.com>',
    to: email,
    subject: 'Email Verification',
    text: `Please verify your email by clicking on this link: http://localhost:8080/verify/${token}`
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent: ' + info.response);
    console.log('Preview URL: ' + nodemailer.getTestMessageUrl(info));
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
};

const verifyEmail = (token) => {
  const tokenData = verificationTokens.get(token);

  if (!tokenData) {
    console.log(`No verification request found for token ${token}`);
    return { verified: false, email: null };
  }

  if (Date.now() > tokenData.expirationTime) {
    console.log(`Token ${token} has expired`);
    verificationTokens.delete(token);
    return { verified: false, email: null };
  }

  // Token is valid
  const email = tokenData.email;
  verificationTokens.delete(token); // Remove the used token
  console.log(`Email ${email} has been verified`);
  return { verified: true, email };
};

module.exports = {
  sendVerificationEmail,
  verifyEmail
};