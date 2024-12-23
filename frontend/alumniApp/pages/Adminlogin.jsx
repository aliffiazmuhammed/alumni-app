import React, { useState } from "react";
import axios from "axios";
import "../css/adminlogin.css";
import { adminLoginRoute } from "../utils/APIRoutes";
import { useNavigate } from "react-router-dom";

function AdminLogin() {
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();
  const handleLogin = async (e) => {
    e.preventDefault();
    try {
        console.log("hello")
      const response = await axios.post(adminLoginRoute, { name, password });
      if (response.data.success) {
        navigate(`/admindashboard/${response.data.admin._id}`)
        // Redirect to admin dashboard
      } else {
        setMessage("Invalid");
      }
    } catch (error) {
      console.error("Login error:", error);
      setMessage("An error occurred. Please try again.");
    }
  };

  return (
    <div className="admin-login">
    <div className="admin-login-container">
      <h2>Admin Login</h2>
      <form onSubmit={handleLogin} className="login-form">
        <div className="form-group">
          <label htmlFor="email">Name</label>
          <input
            type="text"
            id="email"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter your name"
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            required
          />
        </div>
        <button type="submit" className="login-button">Login</button>
        {message && <p className="login-message">{message}</p>}
      </form>
    </div>
    </div>
  );
}

export default AdminLogin;
