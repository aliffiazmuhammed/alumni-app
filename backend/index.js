const express = require("express")
var bodyParser = require('body-parser')
const cors = require("cors")
const mongoose = require('mongoose');
const attendeeRoutes = require('./Routes/eventDetailsRoute')
const adminRoutes = require('./Routes/adminLoginRoute')
const eventRoutes = require('./Routes/eventRoutes')
var urlencodedParser = bodyParser.urlencoded({ extended: false })
const app = express();
app.use(bodyParser.json());
app.use(cors())

require("dotenv").config();

app.use("/api/admin", adminRoutes);
app.use("/api/event", eventRoutes);
// app.use('/api', attendeeRoutes);
app.use('/api/attendees', attendeeRoutes);

mongoose.connect(`mongodb+srv://alif:${process.env.mongopas}@alumni-app.j2x9s.mongodb.net/?retryWrites=true&w=majority&appName=alumni-app`).then(
    console.log("database connected")
)







const server = app.listen(process.env.PORT, () => {
    console.log("port started")
})