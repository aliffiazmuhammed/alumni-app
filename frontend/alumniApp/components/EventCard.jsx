import React from "react";
import "../css/eventcard.css";
import { useNavigate } from "react-router-dom";

const EventCard = ({ event }) => {

    const navigate = useNavigate()
    const eventId = event._id
    console.log(eventId)
    const handleEventClick = (eventId) => {
    navigate(`/userevent/${eventId}`); // Navigate to EventDetails page with eventId
  };
  return (
    <div className="event-card" onClick={() => handleEventClick(eventId)}>
      <h3>{event.name}</h3>
      <p>
        <strong>Date:</strong> {new Date(event.date).toLocaleDateString()}
      </p>
      <p>
        <strong>Time:</strong> {event.time}
      </p>
      <p>
        <strong>Location:</strong> {event.location}
      </p>
      <p>{event.description}</p>
      <p>Click to Check in</p>
    </div>
  );
};

export default EventCard;
