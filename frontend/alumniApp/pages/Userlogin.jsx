import React, { useState } from "react";
import '../css/userlogin.css';
import { sentotpRoute } from "../utils/APIRoutes";
import { useNavigate } from "react-router-dom";
import Footer from "../components/Footer";
const UserLogin = () => {
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [message, setMessage] = useState("");
  const navigate = useNavigate()
  // Send OTP
  const sendOtp = async () => {
    if (!email) {
      setMessage("Email and Phone Number are required!");
      return;
    }
    try {
      const response = await fetch(sentotpRoute, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email}),
      });
      const data = await response.json();
      if (data.success) {
        localStorage.setItem("userEmail", email);
        navigate(`/userpage`)
      } else {
        setMessage(data.message);
      }
    } catch (err) {
      setMessage("Error sending OTP. Please try again.");
    }
  };

   

  return (
    <div className="user-login-container">
      <h2 className="user-login-container__title">Attendee</h2>
      <div className="user-login-container__form">
        {!otpSent ? (
          <>
            <div className="user-login-container__form-group">
              <label className="user-login-container__label">Email</label>
              <input
                type="email"
                className="user-login-container__input"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <button className="user-login-container__button" onClick={sendOtp}>
              Search
            </button>
          </>
        ) : (
          <>
            <div className="user-login-container__form-group">
              <label className="user-login-container__label">OTP</label>
              <input
                type="text"
                className="user-login-container__input"
                placeholder="Enter the OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
              />
            </div>
            <button
              className="user-login-container__button"
              onClick={verifyOtp}
            >
              Verify OTP
            </button>
          </>
        )}
        {message && <p className="user-login-container__message">{message}</p>}
      </div>
    </div>
  );
};

export default UserLogin;
