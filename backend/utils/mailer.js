// utils/email.js
const nodemailer = require('nodemailer');

// Create a transporter using your email service


const sendRegistrationEmail = async (userEmail, userName, eventName,eventlocation,eventdate) => {
    const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 587, // Common port for SMTP (can also be 465 for SSL)
        secure: false,
        auth: {
            user: process.env.email, // Your email
            pass: process.env.googlepas, // Your email password (use environment variables in production)
        },
    });
    const mailOptions = {
        from: 'your_email@gmail.com',
        to: userEmail,
        subject: `Registration confirmation mail`,
        html: `
            <h3>Hi ${userName},</h3>
           <p>Thank you for registering for the event: <strong>${eventName}</strong>.</p>
           <p>We look forward to seeing you there!</p>
           <p>Best Regards,</p>
           <p>Event Team</p>

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
