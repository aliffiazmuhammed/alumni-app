const mongoose = require("mongoose");

const registeredSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "Attendee", required: true },
    eventId: { type: mongoose.Schema.Types.ObjectId, ref: "Event", required: true },
    checkIn: { type: Boolean, default: false },
});

module.exports = mongoose.model("Registered", registeredSchema);
