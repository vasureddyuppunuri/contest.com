const nodemailer = require('nodemailer');

// Configure the transporter
const transporter = nodemailer.createTransport({
  service: 'gmail', // Or your preferred service
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

/**
 * Send an email to multiple recipients
 * @param {string[]} to - Array of email addresses
 * @param {string} subject - Email subject
 * @param {string} html - HTML content of the email
 * @param {string} fromEmail - The email of the user sending it
 * @param {string} fromName - The name of the user sending it
 */
const sendEmail = async (to, subject, html, fromEmail = null, fromName = "Arena Command") => {
  try {
    const mailOptions = {
      from: fromEmail ? `"${fromName}" <${fromEmail}>` : `"Arena Command" <${process.env.EMAIL_USER}>`,
      replyTo: fromEmail || process.env.EMAIL_USER,
      to: to.join(','),
      subject: subject,
      html: html
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent: ' + info.response);
    return info;
  } catch (error) {
    console.error('Email sending failed:', error);
    // Don't throw error to prevent breaking the main flow
    return null;
  }
};

module.exports = { sendEmail };
