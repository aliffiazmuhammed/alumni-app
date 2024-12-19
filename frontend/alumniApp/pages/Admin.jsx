
import React, { useState } from 'react';
import { Link,useNavigate } from 'react-router-dom';
import UserManagement from '../components/UserManagement';
import EventManagement from '../components/EventManagement';
import ReportGeneration from '../components/ReportGeneration';
import '../css/admin.css'

function Admin() {

  return (
    <div className="admin-dashboard">
      <h1 className='adminheading'>Admin Dashboard</h1>
      <div className="management-section">
        <UserManagement />
        <EventManagement />

      </div>
    </div>
  );
}

export default Admin
