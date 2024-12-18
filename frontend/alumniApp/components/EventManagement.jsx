import React, { useState } from 'react';
import axios from 'axios'; // Axios for API requests
import '../css/eventmanagement.css'
const EventManagement = () => {
  // State to manage form data
  const [eventName, setEventName] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [eventTime, setEventTime] = useState('');
  const [eventLocation, setEventLocation] = useState('');

  // Handle form input change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    switch (name) {
      case 'eventName':
        setEventName(value);
        break;
      case 'eventDate':
        setEventDate(value);
        break;
      case 'eventTime':
        setEventTime(value);
        break;
      case 'eventLocation':
        setEventLocation(value);
        break;
      default:
        break;
    }
  };

  // Function to handle form submission and send email request to backend
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Prepare event details to be sent
    const eventDetails = {
      eventName,
      eventDate,
      eventTime,
      eventLocation,
    };

    try {
      // Send a POST request to the backend API to trigger the bulk email sending
      const response = await axios.post('/api/sendEmails', { eventDetails });

      // Handle success
      console.log('Emails sent successfully', response.data);
      alert('Emails sent successfully');
    } catch (error) {
      // Handle error
      console.error('Error sending emails:', error);
      alert('Error occurred while sending emails');
    }
  };

  return (
    <div className="event-management">
      <h2>Event Management</h2>
      <form onSubmit={handleSubmit} className="event-form">
        <div className="form-group">
          <label>Event Name:</label>
          <input
            type="text"
            name="eventName"
            value={eventName}
            onChange={handleInputChange}
            required
          />
        </div>
        <div className="form-group">
          <label>Event Date:</label>
          <input
            type="date"
            name="eventDate"
            value={eventDate}
            onChange={handleInputChange}
            required
          />
        </div>
        <div className="form-group">
          <label>Event Time:</label>
          <input
            type="time"
            name="eventTime"
            value={eventTime}
            onChange={handleInputChange}
            required
          />
        </div>
        <div className="form-group">
          <label>Event Location:</label>
          <input
            type="text"
            name="eventLocation"
            value={eventLocation}
            onChange={handleInputChange}
            required
          />
        </div>

        <button type="submit">Send Emails</button>
      </form>
    </div>
  );
};

export default EventManagement;
