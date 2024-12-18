import React, { useState } from 'react';
import axios from 'axios'; // You'll use Axios for making API requests
import '../css/userlogin.css';

function Userlogin() {
  const [username, setUsername] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false); // State to check if OTP was sent
  const [error, setError] = useState('');

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevents the default form submission
    try {
      // Check if username and phone number match in the database
      const response = await axios.post('/api/verify-user', { username, phoneNumber });

      if (response.data.userExists) {
        // Send OTP if user exists
        await sendOtp();
      } else {
        setError('User does not exist or phone number does not match');
      }
    } catch (err) {
      setError('Error verifying user');
    }
  };

  // Function to send OTP
  const sendOtp = async () => {
    try {
      const response = await axios.post('/api/send-otp', { phoneNumber });
      if (response.data.success) {
        setOtpSent(true); // Mark OTP as sent
        setError('');
      }
    } catch (err) {
      setError('Error sending OTP');
    }
  };

  // Function to handle OTP verification
  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('/api/verify-otp', { phoneNumber, otp });
      if (response.data.success) {
        // Handle successful OTP verification (e.g., login user)
        console.log('OTP Verified');
      } else {
        setError('Invalid OTP');
      }
    } catch (err) {
      setError('Error verifying OTP');
    }
  };

  return (
    <div className="login-container">
      <div className="login">
        <form className="login-form" onSubmit={handleSubmit}>
          <h2>User Login</h2>
          <div className="form-group">
            <label htmlFor="username">Name</label>
            <input
              type="text"
              id="username"
              className="form-input"
              placeholder="Enter your name"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="phoneNumber">Phone Number</label>
            <input
              type="text"
              id="phoneNumber"
              className="form-input"
              placeholder="Enter phone number"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="submit-btn">Verify Details</button>
        </form>

        {/* OTP Form */}
        {otpSent && (
          <form className="otp-form" onSubmit={handleOtpSubmit}>
            <h3>Enter OTP</h3>
            <div className="form-group">
              <label htmlFor="otp">OTP</label>
              <input
                type="text"
                id="otp"
                className="form-input"
                placeholder="Enter OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="submit-btn">Verify OTP</button>
          </form>
        )}

        {/* Display errors */}
        {error && <p className="error">{error}</p>}
      </div>
    </div>
  );
}

export default Userlogin;
