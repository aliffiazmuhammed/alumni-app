const express = require("express");
const { sendOtp } = require('../controller/userLoginController')


const router = express.Router();

router.post("/send-otp", sendOtp);

module.exports = router;