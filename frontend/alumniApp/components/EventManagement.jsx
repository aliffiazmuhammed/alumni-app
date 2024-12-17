import React, { useState } from 'react';
import { Form, Button } from 'react-bootstrap';

function EventManagement() {
  const [eventDetails, setEventDetails] = useState({
    date: '',
    time: '',
    location: '',
    morningSession: '',
    eveningSession: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEventDetails({ ...eventDetails, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(eventDetails);
    // Here, you can save the event details to your backend.
  };

  return (
    <div className="event-management">
      <h2>Event Management</h2>
      <Form onSubmit={handleSubmit}>
        <Form.Group controlId="date">
          <Form.Label>Event Date</Form.Label>
          <Form.Control
            type="date"
            name="date"
            value={eventDetails.date}
            onChange={handleInputChange}
          />
        </Form.Group>
        <Form.Group controlId="time">
          <Form.Label>Event Time</Form.Label>
          <Form.Control
            type="time"
            name="time"
            value={eventDetails.time}
            onChange={handleInputChange}
          />
        </Form.Group>
        <Form.Group controlId="location">
          <Form.Label>Event Location</Form.Label>
          <Form.Control
            type="text"
            name="location"
            value={eventDetails.location}
            onChange={handleInputChange}
          />
        </Form.Group>
        <Form.Group controlId="morningSession">
          <Form.Label>Morning Session</Form.Label>
          <Form.Control
            type="text"
            name="morningSession"
            value={eventDetails.morningSession}
            onChange={handleInputChange}
          />
        </Form.Group>
        <Form.Group controlId="eveningSession">
          <Form.Label>Evening Session</Form.Label>
          <Form.Control
            type="text"
            name="eveningSession"
            value={eventDetails.eveningSession}
            onChange={handleInputChange}
          />
        </Form.Group>
        <Button type="submit" variant="primary">Save Event Details</Button>
      </Form>
    </div>
  );
}

export default EventManagement;
