const express = require("express");
const {
    getAllEvents,
    addEvent,
    updateEvent,
    deleteEvent,
    getEventById,
} = require("../controller/eventController");

const router = express.Router();

// Fetch all events for a specific admin
router.post("/", getAllEvents);

// Add a new event
router.post("/add", addEvent);

// Update an event
router.put("/update", updateEvent);

// Delete an event
router.delete("/delete", deleteEvent);

// Fetch a single event by ID
router.post("/get", getEventById);

module.exports = router;
