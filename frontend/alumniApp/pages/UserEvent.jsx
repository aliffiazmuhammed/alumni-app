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
import Footer from "../components/Footer";
const UserEvent = () => {
  const { eventId } = useParams(); // Get the eventId from the URL
  const [eventDetails, setEventDetails] = useState(null);
  const [registrationStatus, setRegistrationStatus] = useState(null);
  const [userDetails, setUserDetails] = useState({
    _id: "",
    name: "",
    email: "",
    morningGuestCount: 0,
    eveningGuestCount: 0,
    paymentAmount: 0, // Default value
    foodChoice: "",
  });
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [checkinStatus, setcheckinStatus] = useState(null); 
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

        setEventDetails(eventResponse.data.event);
        setRegistrationStatus(registrationResponse.data);
        setUserDetails(userResponse.data.user);
        setcheckinStatus(userResponse.data.user.checkIn);
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching event data:", error);
        setMessage("Failed to load event details. Please try again.");
        setIsLoading(false);
      }
    };

    fetchEventDetails();
  }, [eventId, userDetails.email]);

   // Handle user check-in
  const handleCheckIn = async () => {
    try {
      const response = await axios.post(`${usereventcheckinRoute}/${eventId}`, {
        email: userDetails.email, // Email to identify the user
      });
      setMessage(response.data.message);
      setRegistrationStatus({ ...registrationStatus, checkedIn: true });
      setcheckinStatus(true)
    } catch (error) {
      console.error("Error during check-in:", error);
      setMessage("Failed to check in. Please try again.");
    }
  };
  // Handle user registration
  const handleRegister = async () => {
    try {
      const response = await axios.post(
        `${usereventregisterRoute}/${eventId}`,
        {
          email: userDetails.email, // Email to identify the user
          name: userDetails.name, // User's name
          eventname: eventDetails.name,
          eventlocation: eventDetails.location,
          eventDate: eventDetails.date,
        }
      );
      setMessage(response.data.message);
      setRegistrationStatus({ ...registrationStatus, registered: true });
    } catch (error) {
      console.error("Error registering user:", error);
      setMessage("Failed to register. Please try again.");
    }
  };

  // Handle guest details update
  const handleGuestDetailsUpdate = async () => {
    try {
      const response = await axios.put(`${userupdateguestRoute}/${eventId}`, {
        email: userDetails.email, // Email to identify the user
        morningGuestCount: userDetails.morningGuestCount, // Updated morning count
        eveningGuestCount: userDetails.eveningGuestCount, // Updated evening count
        foodChoice: userDetails.foodChoice, // Updated food choice
      });
      setMessage(response.data.message);
      setIsEditing(false); // Exit editing mode
    } catch (error) {
      console.error("Error updating guest details:", error);
      setMessage("Failed to update guest details. Please try again.");
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
        {!isEditing ? (
          <>
            <p>
              <strong>Morning Guest Count(including you):</strong>{" "}
              {userDetails.morningGuestCount}
            </p>
            <p>
              <strong>Evening Guest Count(including you):</strong>{" "}
              {userDetails.eveningGuestCount}
            </p>
            <p>
              <strong>Food Choice:</strong> {userDetails.foodChoice}
            </p>
            <button className="edit-btn" onClick={() => setIsEditing(true)}>
              Edit
            </button>
          </>
        ) : (
          <>
            <p>
              <strong>Morning Guest Count(including you):</strong>
              <input
                type="number"
                value={userDetails.morningGuestCount}
                onChange={(e) =>
                  setUserDetails({
                    ...userDetails,
                    morningGuestCount: e.target.value,
                  })
                }
              />
            </p>
            <p>
              <strong>Evening Guest Count(including you):</strong>
              <input
                type="number"
                value={userDetails.eveningGuestCount}
                onChange={(e) =>
                  setUserDetails({
                    ...userDetails,
                    eveningGuestCount: e.target.value,
                  })
                }
              />
            </p>
            <p>
              <strong>Food Choice:</strong>
              <select
                value={userDetails.foodChoice}
                onChange={(e) =>
                  setUserDetails({ ...userDetails, foodChoice: e.target.value })
                }
              >
                <option value="Vegetarian">Vegetarian</option>
                <option value="Non-Vegetarian">Non-Vegetarian</option>
              </select>
            </p>
            <button className="save-btn" onClick={handleGuestDetailsUpdate}>
              Save
            </button>
          </>
        )}
      </div>

      <div className="actions">
        {/* Show Register button if not registered and before the event date 
        {currentDate < eventDate && !registrationStatus?.registered && (
          <button onClick={handleRegister}>Register</button>
        )}
          */}
        {/* Show Check In button if registered but not checked in on event day 
        {currentDate.toDateString() === eventDate.toDateString() &&
          registrationStatus?.registered &&
          !registrationStatus?.checkedIn && (
            <button onClick={handleCheckIn}>Check In</button>
          )}
            */}
        {!userDetails.checkIn && !checkinStatus && (
          <button onClick={handleCheckIn}>Check In</button>
        )}
      </div>
      {message && <p className="message">{message}</p>}
    </div>
  );
};

export default UserEvent;
