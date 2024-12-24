const Attendee = require("../model/attendeeModel");

// In-memory store for OTPs
const otpStore = {};

// Send OTP
const sendOtp = async (req, res) => {
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

        res.json({ success: true, message: "success", email:attendee.email });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Failed to send OTP!" });
    }
};