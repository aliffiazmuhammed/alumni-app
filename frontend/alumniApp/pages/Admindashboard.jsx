import React, { useState, useEffect } from "react";
import "../css/admindashboard.css";
import {
  geteventsRoute,
  deleteeventRoute,
  updateeventRoute,
  getsingleeventRoute,
  addeventRoute,
} from "../utils/APIRoutes";
import { useParams, useNavigate } from "react-router-dom";

const AdminDashboard = () => {
  const [events, setEvents] = useState([]);
  const [eventForm, setEventForm] = useState({
    name: "",
    date: "",
    time: "",
    location: "",
    description: "",
  });
  const [editMode, setEditMode] = useState(false);
  const [editingEventId, setEditingEventId] = useState(null);

  const { adminId } = useParams();

  console.log(adminId);
  // Fetch events for the admin
  useEffect(() => {
    fetch(geteventsRoute, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ adminId }),
    })
      .then((res) => res.json())
      .then((data) => setEvents(data))
      .catch((err) => console.error(err));
  }, []);

  // Handle input change for the form
  const handleChange = (e) => {
    const { name, value } = e.target;
    setEventForm((prev) => ({ ...prev, [name]: value }));
  };

  // Handle add or update event
  const handleSubmit = (e) => {
    e.preventDefault();

    const endpoint = editMode ? updateeventRoute : addeventRoute;
    const method = editMode ? "PUT" : "POST";
    const body = {
      ...eventForm,
      adminId,
      ...(editMode && { eventId: editingEventId }),
    };

    fetch(endpoint, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })
      .then((res) => res.json())
      .then((data) => {
        if (editMode) {
          setEvents((prev) =>
            prev.map((event) =>
              event._id === editingEventId ? { ...event, ...eventForm } : event
            )
          );
        } else {
          setEvents((prev) => [...prev, data.event]);
        }
        setEditMode(false);
        setEditingEventId(null);
        setEventForm({
          name: "",
          date: "",
          time: "",
          location: "",
          description: "",
        });
      })
      .catch((err) => console.error(err));
  };

  // Handle delete event
  const handleDelete = (eventId) => {
    fetch(deleteeventRoute, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ adminId, eventId }),
    })
      .then((res) => res.json())
      .then(() => {
        setEvents((prev) => prev.filter((event) => event._id !== eventId));
      })
      .catch((err) => console.error(err));
  };

  // Handle edit event
  const handleEdit = (event) => {
    setEditMode(true);
    setEditingEventId(event._id);
    setEventForm({
      name: event.name,
      date: event.date.split("T")[0], // Format date
      time: event.time,
      location: event.location,
      description: event.description || "",
    });
  };

  const navigate = useNavigate(); // Initialize navigate hook

  const handleEventClick = (eventId) => {
    navigate(`/eventdetails/${eventId}`); // Navigate to EventDetails page with eventId
  };

  return (
    <div className="dashboard-container">
      <h2>Admin Dashboard</h2>

      <form onSubmit={handleSubmit} className="event-form">
        <h3>{editMode ? "Edit Event" : "Add Event"}</h3>
        <input
          type="text"
          name="name"
          placeholder="Event Name"
          value={eventForm.name}
          onChange={handleChange}
          required
        />
        <input
          type="date"
          name="date"
          placeholder="Date"
          value={eventForm.date}
          onChange={handleChange}
          required
        />
        <input
          type="time"
          name="time"
          placeholder="Time"
          value={eventForm.time}
          onChange={handleChange}
          required
        />
        <input
          type="text"
          name="location"
          placeholder="Location"
          value={eventForm.location}
          onChange={handleChange}
          required
        />
        <textarea
          name="description"
          placeholder="Description (Optional)"
          value={eventForm.description}
          onChange={handleChange}
        ></textarea>
        <button type="submit">{editMode ? "Update Event" : "Add Event"}</button>
      </form>

      <div className="events-list">
        <h3>Your Events</h3>
        {events.length === 0 ? (
          <p>No events found.</p>
        ) : (
          events.map((event) => (
            <div className="event-card" key={event._id}>
              <h4>{event.name}</h4>
              <p>
                <strong>Date:</strong>{" "}
                {new Date(event.date).toLocaleDateString()}
              </p>
              <p>
                <strong>Time:</strong> {event.time}
              </p>
              <p>
                <strong>Location:</strong> {event.location}
              </p>
              {event.description && <p>{event.description}</p>}
              <div className="event-actions">
                <button onClick={() => handleEdit(event)}>Edit</button>
                <button onClick={() => handleEventClick(event._id)}>
                  Details
                </button>
                <button onClick={() => handleDelete(event._id)}>Delete</button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
