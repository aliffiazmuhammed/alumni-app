// controllers/attendeeController.js
const XLSX = require('xlsx');
const Attendee = require('../model/attendeeModel');
const fs = require('fs');
const path = require("path");
const Registered = require("../model/registerModel");
const Event = require("../model/eventModel")
const nodemailer = require('nodemailer');
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

//controller for generating report
exports.generatereport = async (req, res) => {
    const { eventId } = req.params;
    try {
        // Fetch attendees for the event
        const attendees = await Attendee.find({ eventId }).lean();

        // Fetch registered attendees for the event
        const registeredAttendees = await Registered.find({ eventId })
            .populate("userId") // Populate details from the Attendee model
            .lean();

        // Prepare attendees data for the Excel sheet
        const attendeesData = attendees.map((attendee) => ({
            Name: attendee.name,
            Phone: attendee.phone,
            Email: attendee.email,
            GuestCount: attendee.guestCount,
            PaymentStatus: attendee.paymentStatus,
            CreatedAt: attendee.createdAt.toLocaleString(),
        }));

        // Prepare registered attendees data for the Excel sheet
        const registeredData = registeredAttendees.map((registered) => ({
            Name: registered.userId.name,
            Phone: registered.userId.phone,
            Email: registered.userId.email,
            CheckInStatus: registered.checkIn ? "Checked In" : "Not Checked In",
        }));

        // Create Excel sheets
        const workbook = XLSX.utils.book_new();

        // Add Attendees List sheet
        const attendeesSheet = XLSX.utils.json_to_sheet(attendeesData);
        XLSX.utils.book_append_sheet(workbook, attendeesSheet, "Attendees List");

        // Add Registered Attendees List sheet
        const registeredSheet = XLSX.utils.json_to_sheet(registeredData);
        XLSX.utils.book_append_sheet(
            workbook,
            registeredSheet,
            "Registered Attendees List"
        );
        // Ensure the "reports" directory exists
        const reportsDir = path.join(__dirname, "../reports");
        if (!fs.existsSync(reportsDir)) {
            fs.mkdirSync(reportsDir, { recursive: true }); // Creates the directory recursively
        }

        // Generate Excel file path
        const filePath = path.join(
            __dirname,
            `../reports/Event_${eventId}_Report.xlsx`
        );
        XLSX.writeFile(workbook, filePath);

        // Send the file for download
        res.download(filePath, (err) => {
            if (err) {
                console.error("Error downloading the file:", err);
            }

            // Delete the file after download
            fs.unlink(filePath, (err) => {
                if (err) console.error("Error deleting the file:", err);
            });
        });
    } catch (error) {
        console.error("Error generating report:", error);
        res.status(500).json({ message: "Failed to generate report" });
    }
}

exports.sendReminderEmails = async (req, res) => {
    try {
        const { eventId } = req.body;

        // Fetch event details
        const event = await Event.findById(eventId);
        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }

        // Fetch attendees who have not registered yet
        const attendees = await Attendee.find({ eventId });

        if (attendees.length === 0) {
            return res.status(200).json({ message: 'No attendees to send reminders to.' });
        }

        // Configure the Nodemailer transporter
        const transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 587, // Common port for SMTP (can also be 465 for SSL)
            secure: false,
            auth: {
                user: process.env.email, // Your email
                pass: process.env.googlepas, // Your email password (use environment variables in production)
            },
        });

        // Send reminder emails to each attendee
        const emailPromises = attendees.map((attendee) => {
            const mailOptions = {
                from: 'your_email@gmail.com',
                to: attendee.email,
                subject: `Reminder: Register for ${event.name}`,
                html: `
                    <h3>Hi ${attendee.name},</h3>
                    <p>You are invited to the event: <strong>${event.name}</strong>.</p>
                    <p><strong>Event Details:</strong></p>
                    <ul>
                        <li><strong>Date:</strong> ${event.date}</li>
                        <li><strong>Location:</strong> ${event.location}</li>
                    </ul>
                    <p>Please register for the event to confirm your participation.</p>
                    <p><strong>Note:</strong> If you have already registered, kindly ignore this email.</p>
                    <p>Thank you!</p>
                `,
            };

            return transporter.sendMail(mailOptions);
        });

        // Wait for all emails to be sent
        await Promise.all(emailPromises);

        res.status(200).json({ message: 'Reminder emails sent successfully!' });
    } catch (error) {
        console.error('Error sending reminder emails:', error);
        res.status(500).json({ message: 'Failed to send reminder emails.', error });
    }
};