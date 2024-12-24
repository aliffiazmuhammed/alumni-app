import React from "react";
import "../css/navbar.css";

const Navbar = () => {
  return (
    <nav className="navbar">
      <div className="navbar-brand">Eventify</div>
      <div className="navbar-menu">
        <a href="/">Home</a>
        <a href="#events">My Events</a>
        <a href="/logout">Logout</a>
      </div>
    </nav>
  );
};

export default Navbar;
