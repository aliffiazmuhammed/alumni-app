
import React, { useState } from 'react';
import { Link,useNavigate } from 'react-router-dom';
import UserManagement from '../components/UserManagement';
import EventManagement from '../components/EventManagement';
import ReportGeneration from '../components/ReportGeneration';


function Admin() {

  return (
    <div className="admin-dashboard">
      <h1>Admin Dashboard</h1>
      <div className="management-section">
        <UserManagement />
        <EventManagement />
        <ReportGeneration />
      </div>
    </div>
  );
}

export default Admin
