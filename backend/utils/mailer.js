// utils/email.js
const nodemailer = require('nodemailer');

// Create a transporter using your email service
const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587, // Common port for SMTP (can also be 465 for SSL)
    secure: false,
    auth: {
        user: process.env.email, // Your email
        pass: process.env.googlepas, // Your email password (use environment variables in production)
    },
});

const sendRegistrationEmail = async (userEmail, userName, eventName,eventlocation,eventdate) => {
    const mailOptions = {
        from: 'your-email@gmail.com',
        to: userEmail,
        subject: `Registration Confirmation for ${eventName}`,
        html: `
      <h1>Hello ${userName},</h1>
      <p>Thank you for registering for <strong>${eventName}</strong>!</p>
      <p>We are excited to have you join us at the event. Below are your registration details:</p>
      <ul>
        <li><strong>Event:</strong> ${eventName}</li>
        <li><strong>Event date:</strong> ${eventdate}</li>
        <li><strong>Event location:</strong> ${eventlocation}</li>
        <li><strong>Name:</strong> ${userName}</li>
        <li><strong>Email:</strong> ${userEmail}</li>
      </ul>
      <p>If you have any questions or need assistance, feel free to contact us.</p>
      <p>Looking forward to seeing you at the event!</p>
      <p>Best regards,<br>Your Event Team</p>
    `,
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log('Registration confirmation email sent successfully.');
    } catch (error) {
        console.error('Error sending registration confirmation email:', error);
    }
};

module.exports = sendRegistrationEmail;
