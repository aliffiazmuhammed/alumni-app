const express = require("express");
const router = express.Router();
const Attendee = require("../model/attendeeModel"); // Import Attendee model
const Event = require("../model/eventModel"); // Import Event model

// Get all events linked to a user
module.exports.userevents = async (req, res) => {
    try {
        const { email } = req.query;

        if (!email) {
            return res.status(400).json({ message: "User email is required" });
        }

        // Find all attendee entries for the user
        const attendeeRecords = await Attendee.find({ email }).populate("eventId");

        if (!attendeeRecords.length) {
            return res.status(404).json({ message: "No events found for this user" });
        }

        // Extract event details
        const events = attendeeRecords.map((attendee) => attendee.eventId);

        // Get current date to filter events
        const currentDate = new Date();

        // Separate events into Live, Upcoming, and Completed
        const liveEvents = events.filter(event => new Date(event.date).toDateString() === currentDate.toDateString());
        const upcomingEvents = events.filter(event => new Date(event.date) > currentDate);
        const completedEvents = events.filter(event => new Date(event.date) < currentDate);

        res.status(200).json({
            success: true,
            liveEvents,
            upcomingEvents,
            completedEvents
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Server error" });
    }
};


