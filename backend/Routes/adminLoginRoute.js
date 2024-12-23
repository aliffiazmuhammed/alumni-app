const express = require('express');
const router = express.Router();
const { adminLogin } = require("../controller/adminLoginController");

router.post("/adminlogin", adminLogin);

module.exports = router;