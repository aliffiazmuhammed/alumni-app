const Attendee = require("../model/attendeeModel");
const Registered = require("../model/registerModel");
const Event = require("../model/eventModel");
const sendRegistrationEmail = require('../utils/mailer')
// Update guest count for an attendee
exports.updateGuestCount = async (req, res) => {
    try {
        const { email, morningGuestCount, eveningGuestCount, foodChoice } = req.body;

        // Find attendee by email
        const attendee = await Attendee.findOne({ email });
        if (!attendee) {
            return res.status(404).json({ message: "User not found" });
        }

        // Update guest count
        attendee.morningGuestCount = morningGuestCount || attendee.morningGuestCount;
        attendee.eveningGuestCount = eveningGuestCount || attendee.eveningGuestCount;
        attendee.foodChoice = foodChoice || attendee.foodChoice;
        await attendee.save();

        res.status(200).json({ message: "Details updated successfully" });
    } catch (error) {
        console.error("Error updating guest count:", error);
        res.status(500).json({ message: "Failed to update guest count" });
    }
};




// Register a user for an event
exports.registerUser = async (req, res) => {
    try {
        const { eventId } = req.params;
        const { name, email, eventname,eventlocation,eventdate } = req.body;

        // Check if the user already exists
        let attendee = await Attendee.findOne({ email });

        // Check if the user is already registered for the event
        const existingRegistration = await Registered.findOne({
            userId: attendee._id,
            eventId,
        });
        if (existingRegistration) {
            return res.status(400).json({ message: "User is already registered for this event" });
        }

        // Register the user for the event
        const registration = new Registered({
            userId: attendee._id,
            eventId,
        });
        await registration.save();
        await sendRegistrationEmail(email, name, eventname,eventlocation,eventdate);
        res.status(200).json({ message: "User registered successfully" });
    } catch (error) {
        console.error("Error during registration:", error);
        res.status(500).json({ message: "Registration failed" });
    }
};

// Check-in a user for an event
exports.checkInUser = async (req, res) => {
    try {
        const { eventId } = req.params;
        const { email } = req.body;

        // Find the attendee by email
        const attendee = await Attendee.findOne({ email });
        if (!attendee) {
            return res.status(404).json({ message: "User not found" });
        }

        // Find the registration entry
        // const registration = await Registered.findOne({
        //     userId: attendee._id,
        //     eventId,
        // });
        // if (!registration) {
        //     return res.status(404).json({ message: "Registration not found" });
        // }

        // Update check-in status
        attendee.checkIn = true;
        await attendee.save();

        res.status(200).json({ message: "Check-in successful" });
    } catch (error) {
        console.error("Error during check-in:", error);
        res.status(500).json({ message: "Check-in failed" });
    }
};



// Fetch event details
exports.getEventDetails = async (req, res) => {
    try {
        const { eventId } = req.params;
        console.log(eventId)
        const event = await Event.findById(eventId);
        if (!event) {
            return res.status(404).json({ message: "Event not found" });
        }

        res.status(200).json({ event });
    } catch (error) {
        
        console.error("Error fetching event details:", error);
        res.status(500).json({ message: "Failed to fetch event details" });
    }
};

// Fetch user registration status
exports.getRegistrationStatus = async (req, res) => {
    try {
        const { eventId } = req.params;
        const { email } = req.query;
        // Find attendee by email
        const attendee = await Attendee.findOne({ email });
        if (!attendee) {
            return res.status(404).json({ message: "User not found" });
        }

        // Check registration status
        const registration = await Registered.findOne({
            userId: attendee._id,
            eventId,
        });

        if (!registration) {
            return res.status(200).json({ registered: false });
        }

        res.status(200).json({
            registered: true,
            checkedIn: registration.checkIn,
            user: attendee,
        });
    } catch (error) {
        console.error("Error fetching registration status:", error);
        res.status(500).json({ message: "Failed to fetch registration status" });
    }
};

exports.fetchuserdetails = async (req, res) => {
    const { email, eventId } = req.query;

    if (!email || !eventId) {
        return res.status(400).send("Email and Event ID are required.");
    }

    try {
        const user = await Attendee.findOne({ email, eventId });

        if (!user) {
            return res.status(404).send("User not found for this event.");
        }

        res.status(200).send({ user });
    } catch (error) {
        console.error("Error fetching user details:", error);
        res.status(500).send("Failed to fetch user details.");
    }
};