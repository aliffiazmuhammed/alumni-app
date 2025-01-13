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
            email: record.Email || '', // Email is in the 'Attendee' column
            phone: record.Phone,
            morningGuestCount: parseInt(record['Morning Guest'] || '0', 10), // Morning guest count
            eveningGuestCount: parseInt(record['Evening Guest'] || '0', 10), // Evening guest count
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
    const { name, email, phone, morningGuestCount, eveningGuestCount, paymentAmount, foodChoice } = req.body;

    try {
        const attendee = await Attendee.findById(attendeeId);
        if (!attendee) {
            return res.status(404).send('Attendee not found');
        }

        attendee.name = name || attendee.name;
        attendee.phone = phone || attendee.phone;
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
        // Fetch attendees for the event
        const attendees = await Attendee.find({ eventId }).lean();

        // Fetch registered attendees for the event
        const registeredAttendees = await Registered.find({ eventId })
            .populate("userId") // Populate details from the Attendee model
            .lean();

        // Prepare attendees data for the Excel sheet
        const attendeesData = attendees.map((attendee) => ({
            Name: attendee.name,
            Email: attendee.email,
            Phone: attendee.phone,
            MorningGuestCount: attendee.morningGuestCount,
            EveningGuestCount: attendee.eveningGuestCount,
            PaymentAmount: attendee.paymentAmount,
            Foodchoice: attendee.foodChoice,
            CreatedAt: attendee.createdAt.toLocaleString(),
        }));

        // Prepare registered attendees data for the Excel sheet
        const registeredData = registeredAttendees.map((registered) => ({
            Name: registered.userId.name,
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
    const { eventId, subject, content } = req.body;
const transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 587, // Common port for SMTP (can also be 465 for SSL)
            secure: false,
            auth: {
                user: process.env.email, // Your email
                pass: process.env.googlepas, // Your email password (use environment variables in production)
            },
        });
    // Validate input
    if (!eventId || !subject || !content) {
        return res.status(400).json({ message: "Event ID, subject, and content are required." });
    }

    try {
        // Fetch attendees for the specific event
        const attendees = await Attendee.find({ eventId }, "email");

        if (attendees.length === 0) {
            return res.status(404).json({ message: "No attendees found for this event." });
        }

        // Extract emails
        const emailList = attendees.map(attendee => attendee.email);

        // Email options
        const mailOptions = {
            from: process.env.email,
            to: emailList,  // Send to all emails of the event
            subject: subject,
            text: content,
        };

        // Send the email
        await transporter.sendMail(mailOptions);

        res.status(200).json({ message: "Emails sent successfully to event attendees!" });
    } catch (error) {
        console.error("Error sending emails:", error);
        res.status(500).json({ message: "Failed to send emails. Please try again." });
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

// exports.checkin = async (req, res) => {
//     try {
//         console.log('hello')
//         const attendee = await Attendee.findByIdAndUpdate(
//             req.params.id,
//             { checkIn: true },
//             { new: true }
//         );
//         if (!attendee) {
//             return res.status(404).json({ message: "Attendee not found" });
//         }
//         res.json(attendee);
//     } catch (err) {
//         console.error(err);
//         res.status(500).json({ message: "Failed to check in attendee" });
//     }
// }