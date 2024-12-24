import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import "../css/userevent.css";
import {
  usereventcheckinRoute,
  usereventregisterRoute,
  usereventregistrationstatusRoute,
  usereventRoute,
  userupdateguestRoute,
  fetchUserDetailsRoute,
} from "../utils/APIRoutes";

const UserEvent = () => {
  const { eventId } = useParams(); // Get the eventId from the URL
  const [eventDetails, setEventDetails] = useState(null);
  const [registrationStatus, setRegistrationStatus] = useState(null);
  const [userDetails, setUserDetails] = useState({
    _id: "",
    name: "",
    phone: "",
    email: "",
    paymentStatus: "Pending", // Default value
    guestCount: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [isEditingGuestCount, setIsEditingGuestCount] = useState(false);

  // Fetch event details and registration status on load
  useEffect(() => {
    const fetchEventDetails = async () => {
      try {
        const eventResponse = await axios.get(`${usereventRoute}/${eventId}`);
        
        const userEmail =
          userDetails.email || localStorage.getItem("userEmail"); // Get user email from localStorage or state

        const registrationResponse = await axios.get(
          `${usereventregistrationstatusRoute}/${eventId}`,
          {
            params: { email: userEmail }, // Pass email as a query parameter
          }
        );

        const userResponse = await axios.get(`${fetchUserDetailsRoute}`, {
          params: { email: userEmail, eventId },
        });
        console.log(userResponse.data)

        setEventDetails(eventResponse.data.event);
        setRegistrationStatus(registrationResponse.data);
        setUserDetails(userResponse.data.user);
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching event data:", error);
        setMessage("Failed to load event details. Please try again.");
        setIsLoading(false);
      }
    };

    fetchEventDetails();
  }, [eventId, userDetails.email]);

  // Handle guest count update
  const handleGuestCountUpdate = async () => {
    try {
      const response = await axios.put(`${userupdateguestRoute}/${eventId}`, {
        email: userDetails.email, // Email to identify the user
        guestCount: userDetails.guestCount, // Updated guest count
      });
      setMessage(response.data.message);
      setIsEditingGuestCount(false); // Exit editing mode
    } catch (error) {
      console.error("Error updating guest count:", error);
      setMessage("Failed to update guest count. Please try again.");
    }
  };

  // Handle guest count change
  const handleGuestCountChange = (e) => {
    setUserDetails((prevDetails) => ({
      ...prevDetails,
      guestCount: e.target.value,
    }));
  };

  // Handle user registration
  const handleRegister = async () => {
    try {
      const response = await axios.post(
        `${usereventregisterRoute}/${eventId}`,
        {
          email: userDetails.email, // Email to identify the user
          name: userDetails.name, // User's name
          phone: userDetails.phone, // User's phone
        }
      );
      setMessage(response.data.message);
      setRegistrationStatus({ ...registrationStatus, registered: true });
    } catch (error) {
      console.error("Error registering user:", error);
      setMessage("Failed to register. Please try again.");
    }
  };

  // Handle user check-in
  const handleCheckIn = async () => {
    try {
      const response = await axios.post(`${usereventcheckinRoute}/${eventId}`, {
        email: userDetails.email, // Email to identify the user
      });
      setMessage(response.data.message);
      setRegistrationStatus({ ...registrationStatus, checkedIn: true });
    } catch (error) {
      console.error("Error during check-in:", error);
      setMessage("Failed to check in. Please try again.");
    }
  };

  // Display loading message if data is being fetched
  if (isLoading) {
    return <p>Loading...</p>;
  }

  // Display error message if event details are not found
  if (!eventDetails) {
    return <p>{message || "Event not found."}</p>;
  }

  // Format dates for easier comparison
  const currentDate = new Date();
  const eventDate = new Date(eventDetails.date);

  return (
    <div className="user-event-page">
      <h2>{eventDetails.name}</h2>
      <p>{eventDetails.description}</p>
      <p>Date: {eventDate.toLocaleDateString()}</p>
      <p>Location: {eventDetails.location}</p>
      <hr />

      <h3>User Details</h3>
      <div className="user-details">
        <p>
          <strong>Name:</strong> {userDetails.name}
        </p>
        <p>
          <strong>Email:</strong> {userDetails.email}
        </p>
        <p>
          <strong>Phone:</strong> {userDetails.phone}
        </p>
        <p>
          <strong>Payment Status:</strong> {userDetails.paymentStatus}
        </p>
        <p>
          <strong>Guest Count:</strong>{" "}
          {!isEditingGuestCount ? (
            <>
              {userDetails.guestCount}{" "}
              <button
                className="edit-btn"
                onClick={() => setIsEditingGuestCount(true)}
              >
                Edit
              </button>
            </>
          ) : (
            <>
              <input
                type="number"
                value={userDetails.guestCount}
                onChange={handleGuestCountChange}
              />
              <button className="save-btn" onClick={handleGuestCountUpdate}>
                Save
              </button>
            </>
          )}
        </p>
      </div>

      <div className="actions">
        {/* Show Register button if not registered and before the event date */}
        {currentDate < eventDate && !registrationStatus?.registered && (
          <button onClick={handleRegister}>Register</button>
        )}

        {/* Show Check In button if registered but not checked in on event day */}
        {currentDate.toDateString() === eventDate.toDateString() &&
          registrationStatus?.registered &&
          !registrationStatus?.checkedIn && (
            <button onClick={handleCheckIn}>Check In</button>
          )}
      </div>
      {message && <p className="message">{message}</p>}
    </div>
  );
};

export default UserEvent;
