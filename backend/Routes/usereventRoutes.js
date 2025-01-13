const express = require("express");
const router = express.Router();
const { updateGuestCount, registerUser, checkInUser, getEventDetails, getRegistrationStatus, fetchuserdetails, selfieupload } = require('../controller/userEventController')
const multer = require("multer");
const upload = multer({ storage: multer.memoryStorage() });
router.put("/updateGuestCount/:eventId", updateGuestCount);
router.post("/register/:eventId", registerUser);
router.post("/checkin/:eventId", checkInUser);
router.get("/usereve/:eventId", getEventDetails);
router.get("/registrationStatus/:eventId", getRegistrationStatus);
router.get("/fetchuserdetails", fetchuserdetails);
router.post("/uploadselfie", upload.single('photo'), selfieupload);

module.exports = router;