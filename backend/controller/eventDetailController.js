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
    const { eventId } = req.body;

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

        // Normalize keys to match the schema
        const data = rawData.map((record) => ({
            name: record.Names || '',// Name field, if present
            email: record.Attendees || '', // Email is in the 'Attendee' column
            morningGuestCount: parseInt(record['Morning Guest'] || '0', 10), // Morning guest count
            eveningGuestCount: parseInt(record['Evening Guest not including self'] || '0', 10), // Evening guest count
            foodChoice: record['Food choices'] || '', // Food choice
            paymentAmount: parseFloat(record['Payment Amount'] || '0'), // Payment amount
            eventId: eventId, // Associate with event
        }));
        console.log(data)
        // Filter out invalid records (email is required)
        const validatedData = data.filter(
            (attendee) => attendee.email // Ensure email is provided
        );

        // Fetch all existing attendees for the given event
        const existingAttendees = await Attendee.find({
            eventId: eventId,
            $or: validatedData.map((attendee) => ({
                email: attendee.email,
            })),
        });

        // Create a set of existing attendee identifiers (email + eventId)
        const existingSet = new Set(
            existingAttendees.map(
                (attendee) => `${attendee.email}_${attendee.eventId}`
            )
        );

        // Filter out duplicates
        const newAttendees = validatedData.filter(
            (attendee) =>
                !existingSet.has(`${attendee.email}_${attendee.eventId}`)
        );

        // Insert non-redundant attendees into the database
        if (newAttendees.length > 0) {
            await Attendee.insertMany(newAttendees);
        }

        res.status(200).send({
            message: 'Excel data uploaded successfully',
            insertedCount: newAttendees.length,
            duplicateCount: validatedData.length - newAttendees.length,
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
    const { name, email, morningGuestCount,eveningGuestCount, paymentAmount ,foodChoice} = req.body;

    try {
        const attendee = await Attendee.findById(attendeeId);
        if (!attendee) {
            return res.status(404).send('Attendee not found');
        }

        attendee.name = name || attendee.name;
        attendee.email = email || attendee.email;
        attendee.morningGuestCount = morningGuestCount || attendee.morningGuestCount;
        attendee.eveningGuestCount = eveningGuestCount || attendee.eveningGuestCount;
        attendee.paymentAmount = paymentAmount || attendee.paymentAmount;
        attendee.foodChoice = foodChoice || attendee.foodChoice;

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
        // Fetch all attendees for the event
        const attendees = await Attendee.find({ eventId }).lean();

        // Fetch attendees who have checked in
        const checkedInAttendees = attendees.filter((attendee) => attendee.checkIn);

        // Prepare data for the total attendees sheet
        const attendeesData = attendees.map((attendee) => ({
            Name: attendee.name,
            Email: attendee.email,
            MorningGuestCount: attendee.morningGuestCount,
            EveningGuestCount: attendee.eveningGuestCount,
            PaymentAmount: attendee.paymentAmount,
            FoodChoice: attendee.foodChoice,
            CreatedAt: attendee.createdAt.toLocaleString(),
        }));

        // Prepare data for the checked-in attendees sheet
        const checkedInData = checkedInAttendees.map((attendee) => ({
            Name: attendee.name,
            Email: attendee.email,
            MorningGuestCount: attendee.morningGuestCount,
            EveningGuestCount: attendee.eveningGuestCount,
            CheckInStatus: "Checked In",
            CreatedAt: attendee.createdAt.toLocaleString(),
        }));

        // Create an Excel workbook
        const workbook = XLSX.utils.book_new();

        // Add the total attendees sheet
        const attendeesSheet = XLSX.utils.json_to_sheet(attendeesData);
        XLSX.utils.book_append_sheet(workbook, attendeesSheet, "Total Attendees");

        // Add the checked-in attendees sheet
        const checkedInSheet = XLSX.utils.json_to_sheet(checkedInData);
        XLSX.utils.book_append_sheet(workbook, checkedInSheet, "Checked-In Attendees");

        // Generate the Excel file in memory
        const excelBuffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });

        // Set headers for file download
        res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
        res.setHeader("Content-Disposition", `attachment; filename=Event_${eventId}_Report.xlsx`);

        // Send the file buffer to the client
        res.send(excelBuffer);
    } catch (error) {
        console.error("Error generating report:", error);
        res.status(500).json({ message: "Failed to generate report" });
    }
};


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
                    <p>follow the following link to register:</p>
                    <p>http://localhost:5173/userlogin</p>
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

exports.addattendee = async (req, res) => {
    try {
        const attendee = new Attendee(req.body);
        const savedAttendee = await attendee.save();
        res.status(201).json(savedAttendee);
    } catch (err) {
        console.error(err);
        res.status(400).json({ message: "Failed to add attendee", error: err });
    }
}

exports.checkin = async (req, res) => {
    try {
        console.log('hello')
        const attendee = await Attendee.findByIdAndUpdate(
            req.params.id,
            { checkIn: true },
            { new: true }
        );
        if (!attendee) {
            return res.status(404).json({ message: "Attendee not found" });
        }
        res.json(attendee);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Failed to check in attendee" });
    }
}