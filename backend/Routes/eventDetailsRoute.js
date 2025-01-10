// routes/attendeeRoutes.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() }); // In-memory storage for the uploaded file

const { uploadExcel, searchAttendee, editAttendee, deleteAttendee, generatereport, sendReminderEmails, addattendee, checkin } = require('../controller/eventDetailController');

// Route for uploading Excel file
router.post('/uploadExcel', upload.single('file'), uploadExcel);

// Route for searching attendees
router.get('/search', searchAttendee);

// Route for editing an attendee
router.put('/edit/:attendeeId', editAttendee);

// Route for deleting an attendee
router.delete('/delete/:attendeeId', deleteAttendee);

router.get('/generatereport/:eventId', generatereport);

router.post('/sendremaindermails',sendReminderEmails)

// router.put("/checkin/:id",checkin)

router.post("/add",addattendee)

module.exports = router;