// routes/attendeeRoutes.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() }); // In-memory storage for the uploaded file

const { uploadExcel, searchAttendee, editAttendee, deleteAttendee } = require('../controller/eventDetailController');

// Route for uploading Excel file
router.post('/uploadExcel', upload.single('file'), uploadExcel);

// Route for searching attendees
router.get('/search', searchAttendee);

// Route for editing an attendee
router.put('/edit/:attendeeId', editAttendee);

// Route for deleting an attendee
router.delete('/delete/:attendeeId', deleteAttendee);

module.exports = router;