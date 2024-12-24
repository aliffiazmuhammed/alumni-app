const twilio = require('twilio');
const client = twilio(process.env.accountsid, process.env.auth);
const Attendee = require("../model/attendeeModel");

// In-memory store for OTPs
const otpStore = {};

// Send OTP
const sendOtp = async (req, res) => {
    console.log(process.env.accountsid)
    console.log(process.env.auth)
    console.log(process.env.servicesid)
    const { email, phoneNumber } = req.body;

    // Validate input
    if (!email || !phoneNumber) {
        return res.status(400).json({ success: false, message: "Email and Phone Number are required!" });
    }
    console.log(`${email} ${phoneNumber}`)
    try {
        // Check if attendee exists
        const attendee = await Attendee.findOne({ email });
        console.log(attendee)
        if (!attendee) {
            return res.status(404).json({ success: false, message: "Attendee not found!" });
        }

        // Send OTP using Twilio
        // client.verify.v2.services(process.env.servicesid)
        // .verifications.create({
        //     to: `+91${phoneNumber}`,
        //     channel: "sms"
        // }).then((resp)=>{
        //     console.log(resp)
        //     res.status(200).json({resp})
        // })

        res.json({ success: true, message: "success", email:attendee.email });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Failed to send OTP!" });
    }
};

// Verify OTP
const verifyOtp = (req, res) => {
    const { phoneNumber, otp } = req.body;

    // Validate OTP
    if (!otpStore[phoneNumber] || otpStore[phoneNumber] !== otp) {
        return res.status(400).json({ success: false, message: "Invalid OTP!" });
    }

    // Clear OTP after verification
    delete otpStore[phoneNumber];
    res.json({ success: true, message: "OTP verified successfully!" });
};

module.exports = { sendOtp, verifyOtp };
