const express = require("express");
const router = express.Router();
const {updateGuestCount,registerUser,checkInUser,getEventDetails,getRegistrationStatus, fetchuserdetails} = require('../controller/userEventController')


router.put("/updateGuestCount/:eventId", updateGuestCount);
router.post("/register/:eventId", registerUser);
router.post("/checkin/:eventId", checkInUser);
router.get("/usereve/:eventId", getEventDetails);
router.get("/registrationStatus/:eventId", getRegistrationStatus);
router.get("/fetchuserdetails", fetchuserdetails);


module.exports = router;