const mongoose = require('mongoose');

const AttendeeSchema = new mongoose.Schema({
    name: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String, required: true },
    guestCount: { type: Number, default: 0 },
    paymentStatus: { type: String, default: 'Unpaid' },
});

AttendeeSchema.index({ name: 1, phone: 1, email: 1 }, { unique: true });

const Attendee = mongoose.model('Attendee', AttendeeSchema);

module.exports = Attendee;
