import React, { useEffect, useState } from "react";
import EventCard from "../components/EventCard";
import Navbar from "../components/Navbar";
import Loader from "../components/Loader";
import { userpageRoute } from "../utils/APIRoutes";
import "../css/userpage.css";
import Footer from "../components/Footer";
const UserPage = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchUserEvents = async () => {
      try {
        const email = localStorage.getItem("userEmail"); // Assuming the user's email is saved in localStorage
        if (!email) {
          setError("User is not logged in.");
          setLoading(false);
          return;
        }

        const response = await fetch(`${userpageRoute}?email=${email}`);
        const data = await response.json();

        if (data.success) {
          setEvents(data.events);
        } else {
          setError(data.message || "Failed to fetch events.");
        }
      } catch (err) {
        console.error(err);
        setError("An error occurred while fetching events.");
      } finally {
        setLoading(false);
      }
    };

    fetchUserEvents();
  }, []);

  if (loading) {
    return <Loader />;
  }

  if (error) {
    return (
      <div className="user-page">
        <Navbar />
        <div className="error">{error}</div>
      </div>
    );
  }

  return (
    <div className="user-page">
      <div className="content">
        <h1>My Events</h1>
        {events.length > 0 ? (
          <div className="events-container">
            {events.map((event) => (
              <EventCard key={event._id} event={event} />
            ))}
          </div>
        ) : (
          <p>No events found.</p>
        )}
      </div>
    </div>
  );
};

export default UserPage;
