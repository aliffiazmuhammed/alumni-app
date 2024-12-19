const express = require('express');
const multer = require('multer');
const XLSX = require('xlsx');
const Attendee = require('../model/attendeeModel');
const router = express.Router();

// Configure multer to store files in memory
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Optimized upload route
router.post('/uploadExcel', upload.single('file'), async (req, res) => {
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
            name: record.Name, // Map "Name" to "name"
            phone: record.Phone, // Map "Phone" to "phone"
            email: record.Email, // Map "Email" to "email"
            guestCount: record['Guest Count'] || 0, // Default guest count to 0 if missing
            paymentStatus: record['Payment Status'] || 'Unpaid', // Default payment status to 'Unpaid' if missing
        }));

        console.log('Normalized data:', data);

        // Extract unique fields from Excel data
        const excelSet = new Set(data.map((attendee) => `${attendee.name}_${attendee.phone}_${attendee.email}`));

        // Fetch all existing attendees that match the uploaded data
        const existingAttendees = await Attendee.find({
            $or: data.map((attendee) => ({
                name: attendee.name,
                phone: attendee.phone,
                email: attendee.email,
            })),
        });

        // Create a set of existing attendee identifiers
        const existingSet = new Set(
            existingAttendees.map((attendee) => `${attendee.name}_${attendee.phone}_${attendee.email}`)
        );

        // Filter out duplicate records
        const newAttendees = data.filter(
            (attendee) => !existingSet.has(`${attendee.name}_${attendee.phone}_${attendee.email}`)
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
});


module.exports = router;
