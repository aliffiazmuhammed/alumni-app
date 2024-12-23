const Event = require('../models/Event');

exports.getEvents = async (req, res) => {
    try {
        const events = await Event.find({ adminId: req.admin._id });
        res.status(200).json(events);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch events' });
    }
};

exports.createEvent = async (req, res) => {
    const { name, date, time, location, description } = req.body;

    if (!name || !date || !time || !location) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    try {
        const event = new Event({
            adminId: req.admin._id,
            name,
            date,
            time,
            location,
            description,
        });

        await event.save();
        res.status(201).json(event);
    } catch (err) {
        res.status(500).json({ error: 'Failed to create event' });
    }
};

exports.deleteEvent = async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);

        if (!event || event.adminId.toString() !== req.admin._id.toString()) {
            return res.status(404).json({ error: 'Event not found or unauthorized' });
        }

        await event.remove();
        res.status(200).json({ message: 'Event deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: 'Failed to delete event' });
    }
};
