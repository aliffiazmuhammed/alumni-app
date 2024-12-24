// controllers/attendeeController.js
const XLSX = require('xlsx');
const Attendee = require('../model/attendeeModel');
const fs = require('fs');

// Controller for uploading Excel file
exports.uploadExcel = async (req, res) => {
    const { eventId } = req.body; // Expect eventId in the request body
    console.log(eventId)
    if (!eventId) {
        return res.status(400).send('Event ID is required');
    }

    if (!req.file) {
        return res.status(400).send('No file uploaded');
    }

    try {
        // Parse the Excel file from memory buffer
        const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
        const sheetName = workbook.SheetNames[0]; // Get the first sheet
        const rawData = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]); // Convert sheet to JSON

        // Normalize keys to match Mongoose schema
        const data = rawData.map((record) => ({
            name: record.Name,
            phone: record.Phone,
            email: record.Email,
            guestCount: record['Guest Count'] || 0,
            paymentStatus: record['Payment Status'] || 'Unpaid',
            eventId: eventId, // Associate with the event
        }));

        console.log('Normalized data:', data);

        // Fetch all existing attendees for the given event
        const existingAttendees = await Attendee.find({
            eventId: eventId, // Filter by eventId
            $or: data.map((attendee) => ({
                name: attendee.name,
                phone: attendee.phone,
                email: attendee.email,
            })),
        });

        // Create a set of existing attendee identifiers (name + phone + email + eventId)
        const existingSet = new Set(
            existingAttendees.map((attendee) =>
                `${attendee.name}_${attendee.phone}_${attendee.email}_${attendee.eventId}`
            )
        );

        // Filter out duplicate records by adding eventId in the identifier
        const newAttendees = data.filter(
            (attendee) =>
                !existingSet.has(`${attendee.name}_${attendee.phone}_${attendee.email}_${attendee.eventId}`)
        );

        // Insert non-redundant attendees into the database
        if (newAttendees.length > 0) {
            await Attendee.insertMany(newAttendees);
        }

        res.status(200).send({
            message: 'Excel data uploaded successfully',
            insertedCount: newAttendees.length,
            duplicateCount: data.length - newAttendees.length,
        });
    } catch (error) {
        console.error('Error processing Excel file:', error);
        res.status(500).send('Failed to process Excel file');
    }
};

// Controller for searching attendees
exports.searchAttendee = async (req, res) => {
    const { type, query, eventId } = req.query;

    if (!eventId) {
        return res.status(400).send('Event ID is required');
    }

    try {
        const searchQuery = {};
        if (type === 'name') {
            searchQuery.name = { $regex: query, $options: 'i' };
        } else if (type === 'email') {
            searchQuery.email = { $regex: query, $options: 'i' };
        } else if (type === 'phone') {
            searchQuery.phone = { $regex: query, $options: 'i' };
        }

        searchQuery.eventId = eventId; // Filter by eventId

        const attendees = await Attendee.find(searchQuery);
        res.status(200).json(attendees);
    } catch (error) {
        console.error('Error searching for attendees:', error);
        res.status(500).send('Error searching for attendees');
    }
};

// Controller for editing an attendee
exports.editAttendee = async (req, res) => {
    const { attendeeId } = req.params;
    const { name, phone, email, guestCount, paymentStatus } = req.body;

    try {
        const attendee = await Attendee.findById(attendeeId);
        if (!attendee) {
            return res.status(404).send('Attendee not found');
        }

        attendee.name = name || attendee.name;
        attendee.phone = phone || attendee.phone;
        attendee.email = email || attendee.email;
        attendee.guestCount = guestCount || attendee.guestCount;
        attendee.paymentStatus = paymentStatus || attendee.paymentStatus;

        await attendee.save();
        res.status(200).send('Attendee updated successfully');
    } catch (error) {
        console.error('Error updating attendee:', error);
        res.status(500).send('Failed to update attendee');
    }
};

// Controller for deleting an attendee
exports.deleteAttendee = async (req, res) => {
    const { attendeeId } = req.params;

    try {
        const attendee = await Attendee.findByIdAndDelete(attendeeId);
        if (!attendee) {
            return res.status(404).send('Attendee not found');
        }

        res.status(200).send('Attendee deleted successfully');
    } catch (error) {
        console.error('Error deleting attendee:', error);
        res.status(500).send('Failed to delete attendee');
    }
};
