const express = require("express");
const { userevents } = require('../controller/userEventsController')


const router = express.Router();

router.get("/", userevents);

module.exports = router;