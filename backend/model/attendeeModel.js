// const mongoose = require('mongoose');

// const AttendeeSchema = new mongoose.Schema({
//     name: { type: String, required: true },
//     phone: { type: String, required: true },
//     email: { type: String, required: true },
//     guestCount: { type: Number, default: 0 },
//     paymentStatus: { type: String, default: 'Unpaid' },
// });

// AttendeeSchema.index({ name: 1, phone: 1, email: 1 }, { unique: true });

// const Attendee = mongoose.model('Attendee', AttendeeSchema);

// module.exports = Attendee;


// models/Attendee.js
// const mongoose = require('mongoose');

// const attendeeSchema = new mongoose.Schema({
//     name: { type: String, required: true },
//     phone: { type: String, required: true },
//     email: { type: String, required: true },
//     guestCount: { type: Number, default: 0 },
//     paymentStatus: { type: String, default: 'Unpaid' },
//     eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true }, // Reference to the Event model
// }, { timestamps: true });

// attendeeSchema.index({ name: 1, phone: 1, email: 1, eventId: 1 }, { unique: true });

// const Attendee = mongoose.model('Attendee', attendeeSchema);

// module.exports = Attendee;

const mongoose = require('mongoose');

const attendeeSchema = new mongoose.Schema(
    {
        name: { type: String, required: true },
        email: { type: String, required: true }, // Store as email
        morningGuestCount: { type: Number, default: 0 }, // Morning guest count
        eveningGuestCount: { type: Number, default: 0 }, // Evening guest count
        foodChoice: { type: String, default: '' }, // Food choice
        paymentAmount: { type: Number, default: 0 }, // Payment amount
        checkIn: { type: Boolean, default: false },
        eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true }, // Event reference
    },
    { timestamps: true }
);

attendeeSchema.index({ name: 1, email: 1, eventId: 1 }, { unique: true }); // Ensure uniqueness

const Attendee = mongoose.model('Attendee', attendeeSchema);

module.exports = Attendee;

