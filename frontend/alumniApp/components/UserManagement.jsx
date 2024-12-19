import React, { useState } from 'react';
import '../css/userManagement.css';

import { excelUpload,searchattendee,editattendee,deleteattendee } from '../utils/APIRoutes';

function UserManagement() {
  const [searchType, setSearchType] = useState('name');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResult, setSearchResult] = useState(null);
  const [excelFile, setExcelFile] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [editAttendee, setEditAttendee] = useState(null);

  const handleSearch = async (e) => {
    e.preventDefault();
    // Send search request to the backend
    const response = await fetch(`${searchattendee}/?type=${searchType}&query=${searchQuery}`);
    const data = await response.json();
    setSearchResult(data); // Update state with the search result
  };

  const handleFileUpload = (e) => {
    setExcelFile(e.target.files[0]); // Store the file in state
  };

  const handleFileSubmit = async () => {
    if (!excelFile) {
      alert('Please upload a file first!');
      return;
    }

    const formData = new FormData();
    formData.append('file', excelFile);

    // Send file to backend
    const response = await fetch(excelUpload, {
      method: 'POST',
      body: formData,
    });

    if (response.ok) {
      alert('File uploaded successfully!');
    } else {
      alert('Failed to upload file.');
    }
  };

  const handleDelete = async (attendeeId) => {
    // Send delete request to the backend
    const response = await fetch(`${deleteattendee}/${attendeeId}`, {
      method: 'DELETE',
    });

    if (response.ok) {
      alert('Attendee deleted successfully');
      setSearchResult(searchResult.filter(attendee => attendee._id !== attendeeId)); // Remove from state
    } else {
      alert('Failed to delete attendee');
    }
  };

  const handleEdit = (attendee) => {
    setEditMode(true);
    setEditAttendee(attendee); // Store attendee data for editing
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    // Send updated details to the backend
    const response = await fetch(`${editattendee}/${editAttendee._id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(editAttendee),
    });

    if (response.ok) {
      alert('Attendee details updated successfully');
      setEditMode(false);
      setSearchResult(
        searchResult.map((attendee) =>
          attendee._id === editAttendee._id ? editAttendee : attendee
        )
      ); // Update the list of attendees
    } else {
      alert('Failed to update attendee');
    }
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditAttendee({ ...editAttendee, [name]: value });
  };

  return (
    <div className="user-management">
      <h2>User Management</h2>

      {/* File Upload Section */}
      <div className="file-upload">
        <button onClick={() => document.getElementById('file-input').click()}>Upload Excel</button>
        <input
          id="file-input"
          type="file"
          accept=".xlsx, .xls"
          style={{ display: 'none' }}
          onChange={handleFileUpload}
        />
        {excelFile && <p>Selected File: {excelFile.name}</p>}
        <button onClick={handleFileSubmit}>Submit File</button>
      </div>

      {/* Search Section */}
      <form className="search-form" onSubmit={handleSearch}>
        <select
          className="search-dropdown"
          value={searchType}
          onChange={(e) => setSearchType(e.target.value)}
        >
          <option value="name">Name</option>
          <option value="phone">Phone</option>
          <option value="email">Email</option>
        </select>
        <input
          className="search-input"
          type="text"
          placeholder={`Search by ${searchType}`}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <button className="search-button" type="submit">
          Search
        </button>
      </form>

      {/* Edit Form */}
      {editMode && (
        <form className="edit-form" onSubmit={handleEditSubmit}>
          <h3>Edit Attendee</h3>
          <div className="form-group">
            <label>Name:</label>
            <input
              type="text"
              name="name"
              value={editAttendee.name}
              onChange={handleEditChange}
            />
          </div>
          <div className="form-group">
            <label>Phone:</label>
            <input
              type="text"
              name="phone"
              value={editAttendee.phone}
              onChange={handleEditChange}
            />
          </div>
          <div className="form-group">
            <label>Email:</label>
            <input
              type="email"
              name="email"
              value={editAttendee.email}
              onChange={handleEditChange}
            />
          </div>
          <div className="form-group">
            <label>Guest Count:</label>
            <input
              type="number"
              name="guestCount"
              value={editAttendee.guestCount}
              onChange={handleEditChange}
            />
          </div>
          <div className="form-group">
            <label>Payment Status:</label>
            <input
              type="text"
              name="paymentStatus"
              value={editAttendee.paymentStatus}
              onChange={handleEditChange}
            />
          </div>
          <button type="submit">Update</button>
        </form>
      )}

      {/* Search Results */}
      {searchResult && (
        <div className="search-results">
          {searchResult.length > 0 ? (
            <table className="result-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Phone</th>
                  <th>Email</th>
                  <th>Guest Count</th>
                  <th>Payment Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {searchResult.map((attendee, index) => (
                  <tr key={index}>
                    <td>{attendee.name}</td>
                    <td>{attendee.phone}</td>
                    <td>{attendee.email}</td>
                    <td>{attendee.guestCount}</td>
                    <td>{attendee.paymentStatus}</td>
                    <td>
                      <button className="edit-button" onClick={() => handleEdit(attendee)}>Edit</button>
                      <button className="delete-button" onClick={() => handleDelete(attendee._id)}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="no-result-message">No attendee found.</p>
          )}
        </div>
      )}
    </div>
  );
}

export default UserManagement;
