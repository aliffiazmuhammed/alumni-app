const Event = require("../model/eventModel");
const Attendee = require('../model/attendeeModel')
const Registered = require("../model/registerModel");

// Fetch events for a specific admin
module.exports.getAllEvents = async (req, res) => {
    const { adminId } = req.body; // Admin ID passed from the frontend

    if (!adminId) {
        return res.status(400).json({ message: "Admin ID is required." });
    }

    try {
        const events = await Event.find({ adminId }).sort({ date: 1 }); // Fetch and sort by date
        res.status(200).json(events);
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch events", error });
    }
};

module.exports.addEvent = async (req, res) => {
    const { adminId, name, date, time, location, description } = req.body;

    // Validate required fields
    if (!adminId || !name || !date || !time || !location) {
        return res.status(400).json({ message: "Admin ID, name, date, time, and location are required." });
    }

    try {
        const newEvent = new Event({
            adminId,
            name,
            date,
            time,
            location,
            description,
        });

        await newEvent.save();
        res.status(201).json({ message: "Event created successfully.", event: newEvent });
    } catch (error) {
        res.status(500).json({ message: "Failed to create event", error });
    }
};

module.exports.updateEvent = async (req, res) => {
    const { adminId, eventId, name, date, time, location, description } = req.body;

    if (!adminId || !eventId) {
        return res.status(400).json({ message: "Admin ID and Event ID are required." });
    }

    try {
        const updatedEvent = await Event.findOneAndUpdate(
            { _id: eventId, adminId }, // Ensure event belongs to the admin
            { name, date, time, location, description },
            { new: true } // Return the updated document
        );

        if (!updatedEvent) {
            return res.status(404).json({ message: "Event not found or unauthorized." });
        }

        res.status(200).json({ message: "Event updated successfully.", event: updatedEvent });
    } catch (error) {
        res.status(500).json({ message: "Failed to update event", error });
    }
};


module.exports.deleteEvent = async (req, res) => {
    const { adminId, eventId } = req.body;

    if (!adminId || !eventId) {
        return res.status(400).json({ message: "Admin ID and Event ID are required." });
    }

    try {
        // Delete the event
        const event = await Event.findOneAndDelete({ _id: eventId, adminId });

        if (!event) {
            return res.status(404).json({ message: "Event not found or unauthorized." });
        }

        // Delete attendees related to the event
        const attendeesDeletion = await Attendee.deleteMany({ eventId });

        // Delete registered attendees related to the event
        const registeredDeletion = await Registered.deleteMany({ eventId });

        res.status(200).json({
            message: "Event and related attendees deleted successfully.",
            deletedAttendees: attendeesDeletion.deletedCount,
            deletedRegistered: registeredDeletion.deletedCount,
        });
    } catch (error) {
        res.status(500).json({ message: "Failed to delete event", error });
    }
};

module.exports.getEventById = async (req, res) => {
    const { eventId } = req.params;
    console.log(eventId)
    if (!eventId) {
        return res.status(400).json({ message: "Event ID are required." });
    }

    try {
        console.log("event")
        const event = await Event.findOne({ _id: eventId});

        if (!event) {
            console.log("event not found")
            return res.status(404).json({ message: "Event not found or unauthorized." });
        }

        res.status(200).json(event);
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch event", error });
    }
};

