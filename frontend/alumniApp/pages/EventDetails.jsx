import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import "../css/Eventdetails.css";

import {
  uploadexcelRoute,
  searchattendeeRoute,
  deleteattendeeRoute,
  editattendeeRoute,
  getsingleeventRoute,
  generatereportRoute,
  sendremaindermailsRoute,
  checkinattendee,
  addattendee,
} from "../utils/APIRoutes";
import Footer from "../components/Footer";

function EventDetails() {
  const { eventId } = useParams();
  const [searchType, setSearchType] = useState("name");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResult, setSearchResult] = useState(null);
  const [excelFile, setExcelFile] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [editAttendee, setEditAttendee] = useState(null);
  const [eventDetails, setEventDetails] = useState({});
const [showAddModal, setShowAddModal] = useState(false);
const [newAttendee, setNewAttendee] = useState({
  name: "",
  email: "",
  morningGuestCount: 0,
  eveningGuestCount: 0,
  foodChoice: "",
  paymentAmount: 0,
});
const [eventstats, setEventStats] = useState({});
  // Fetch event details on page load
  useEffect(() => {
    const fetchEventDetails = async () => {
      const response = await fetch(`${getsingleeventRoute}/${eventId}`);
      const data = await response.json();
      setEventDetails(data.event);
      setEventStats(data.stats); // Assuming you add a state variable for stats
    };
    fetchEventDetails();
  }, [eventId]);
  const handleSearch = async (e) => {
    e.preventDefault();
    const response = await fetch(
      `${searchattendeeRoute}/?type=${searchType}&query=${searchQuery}&eventId=${eventId}`
    );
    const data = await response.json();
    setSearchResult(data);
  };

  const handleFileUpload = (e) => {
    setExcelFile(e.target.files[0]);
  };

 const handleFileSubmit = async () => {
   if (!excelFile) {
     alert("Please upload a file first!");
     return;
   }

   const formData = new FormData();
   formData.append("file", excelFile);
   formData.append("eventId", eventId); // Include the eventId in the form data

   // Send file to backend
   const response = await fetch(uploadexcelRoute, {
     method: "POST",
     body: formData,
   });

   if (response.ok) {
     alert("File uploaded successfully!");
     setExcelFile(null)
   } else {
     alert("Failed to upload file.");
   }
 };


  const handleDelete = async (attendeeId) => {
    const response = await fetch(`${deleteattendeeRoute}/${attendeeId}`, {
      method: "DELETE",
    });

    if (response.ok) {
      alert("Attendee deleted successfully");
      setSearchResult(
        searchResult.filter((attendee) => attendee._id !== attendeeId)
      );
    } else {
      alert("Failed to delete attendee");
    }
  };

  const handleEdit = (attendee) => {
    setEditMode(true);
    setEditAttendee(attendee);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    const response = await fetch(`${editattendeeRoute}/${editAttendee._id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(editAttendee),
    });

    if (response.ok) {
      alert("Attendee details updated successfully");
      setEditMode(false);
      setSearchResult(
        searchResult.map((attendee) =>
          attendee._id === editAttendee._id ? editAttendee : attendee
        )
      );
    } else {
      alert("Failed to update attendee");
    }
  };

const generateReport = async () => {
  try {
    const response = await fetch(
      `${generatereportRoute}/${eventId}`, // Replace with your backend route
      {
        method: "GET",
      }
    );

    if (response.ok) {
      // Create a blob for the file
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);

      // Create a temporary anchor element to trigger download
      const a = document.createElement("a");
      a.href = url;
      a.download = `${eventDetails.name}_Report.xlsx`; // File name
      a.click();

      // Revoke the object URL to free memory
      window.URL.revokeObjectURL(url);
    } else {
      alert("Failed to generate report");
    }
  } catch (error) {
    console.error("Error generating report:", error);
    alert("An error occurred while generating the report.");
  }
};

const handleCheckIn = async (attendeeId) => {
  console.log('hello')
  const response = await fetch(`${checkinattendee}/${attendeeId}`, {
    method: "PUT",
  });

  if (response.ok) {
    alert("Attendee checked in successfully");
    setSearchResult(
      searchResult.map((attendee) =>
        attendee._id === attendeeId ? { ...attendee, checkIn: true } : attendee
      )
    );
  } else {
    console.log('failed')
    alert("Failed to check in attendee");
  }
};

const handleAddAttendeeChange = (e) => {
  const { name, value } = e.target;
  setNewAttendee({ ...newAttendee, [name]: value });
};

const handleAddAttendee = async (e) => {
  e.preventDefault();
  const response = await fetch(addattendee, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...newAttendee, eventId }),
  });

  const data = await response.json();
  if (response.ok) {
    alert("Attendee added successfully!");
    setSearchResult([...searchResult, data]); // Add the new attendee to the list
    setShowAddModal(false);
  } else {
    alert(data.message || "Failed to add attendee");
  }
};

  const generateremaindermail = async()=>{
    try {
        const response = await fetch(sendremaindermailsRoute, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ eventId }),
        });

        const result = await response.json();
        if (response.ok) {
            alert(result.message);
        } else {
            alert(`Error: ${result.message}`);
        }
    } catch (error) {
        console.error('Error sending reminder emails:', error);
        alert('Failed to send reminder emails.');
    }
  }

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditAttendee({ ...editAttendee, [name]: value });
  };

  return (
    <div className="event-details">
      <h2>{eventDetails.name}</h2>
      <p>
        <strong>Total Checked In Attendees:</strong>
        {eventstats.totalCheckedInAttendees}
      </p>
      <p>
        <strong>Total Morning Attendees:</strong>
        {eventstats.totalMorningAttendees}
      </p>
      <p>
        <strong>Total Evening Attendees:</strong>
        {eventstats.totalEveningAttendees}
      </p>

      {/* File Upload Section */}
      <div className="file-upload">
        <button onClick={() => document.getElementById("file-input").click()}>
          Upload Excel
        </button>
        <input
          id="file-input"
          type="file"
          accept=".xlsx, .xls"
          style={{ display: "none" }}
          onChange={handleFileUpload}
        />
        {excelFile && <p>Selected File: {excelFile.name}</p>}
        <button onClick={handleFileSubmit}>Submit File</button>
      </div>
      {/*report generation*/}
      <div className="report-generation">
        <button className="generate-report-button" onClick={generateReport}>
          Generate Report
        </button>
      </div>
      {/*send remainder mails*/}
      <div className="report-generation">
        <button
          className="generate-report-button"
          onClick={generateremaindermail}
        >
          Send Reminder Mail
        </button>
      </div>
      {/* Search Section */}
      <form className="search-form" onSubmit={handleSearch}>
        <select
          className="search-dropdown"
          value={searchType}
          onChange={(e) => setSearchType(e.target.value)}
        >
          <option value="name">Name</option>
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
            <label>Email:</label>
            <input
              type="email"
              name="email"
              value={editAttendee.email}
              onChange={handleEditChange}
            />
          </div>
          <div className="form-group">
            <label>Morning Guest Count</label>
            <input
              type="number"
              name="morningGuestCount"
              value={editAttendee.morningGuestCount}
              onChange={handleEditChange}
            />
          </div>
          <div className="form-group">
            <label>Evening Guest Count</label>
            <input
              type="number"
              name="eveningGuestCount"
              value={editAttendee.eveningGuestCount}
              onChange={handleEditChange}
            />
          </div>
          <div className="form-group">
            <label>Payment Amount:</label>
            <input
              type="text"
              name="paymentAmount"
              value={editAttendee.paymentAmount}
              onChange={handleEditChange}
            />
          </div>
          <div className="form-group">
            <label>Food Choice:</label>
            <input
              type="text"
              name="foodChoice"
              value={editAttendee.foodChoice}
              onChange={handleEditChange}
            />
          </div>
          <button type="submit">Update</button>
        </form>
      )}
      <button
        className="add-attendee-button"
        onClick={() => setShowAddModal(true)}
      >
        Add Attendee
      </button>
      {showAddModal && (
        <div className="add-attendee-modal">
          <h3>Add Attendee</h3>
          <form onSubmit={handleAddAttendee}>
            <label>Name:</label>
            <input
              type="text"
              name="name"
              placeholder="Name"
              value={newAttendee.name}
              onChange={handleAddAttendeeChange}
              required
            />
            <label>Email:</label>
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={newAttendee.email}
              onChange={handleAddAttendeeChange}
              required
            />
            <label>Morning Guest Count:</label>
            <input
              type="number"
              name="morningGuestCount"
              placeholder="Morning Guest Count"
              value={newAttendee.morningGuestCount}
              onChange={handleAddAttendeeChange}
            />
            <label>Evening Guest Count:</label>
            <input
              type="number"
              name="eveningGuestCount"
              placeholder="Evening Guest Count"
              value={newAttendee.eveningGuestCount}
              onChange={handleAddAttendeeChange}
            />
            <label>Food Choice:</label>
            <input
              type="text"
              name="foodChoice"
              placeholder="Food Choice"
              value={newAttendee.foodChoice}
              onChange={handleAddAttendeeChange}
            />
            <label>Payment Amount:</label>
            <input
              type="number"
              name="paymentAmount"
              placeholder="Payment Amount"
              value={newAttendee.paymentAmount}
              onChange={handleAddAttendeeChange}
            />
            <button type="submit">Add</button>
            <button type="button" onClick={() => setShowAddModal(false)}>
              Cancel
            </button>
          </form>
        </div>
      )}
      {/* Search Results */}
      {searchResult && (
        <div className="search-results">
          {searchResult.length > 0 ? (
            <table className="result-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Morning Guest Count</th>
                  <th>Evening Guest Count</th>
                  <th>Payment Amount</th>
                  <th>Food Choice</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {searchResult.map((attendee, index) => (
                  <tr key={index}>
                    <td>{attendee.name}</td>
                    <td>{attendee.email}</td>
                    <td>{attendee.morningGuestCount}</td>
                    <td>{attendee.eveningGuestCount}</td>
                    <td>{attendee.paymentAmount}</td>
                    <td>{attendee.foodChoice}</td>
                    <td>
                      <button
                        className="edit-button"
                        onClick={() => handleEdit(attendee)}
                      >
                        Edit
                      </button>
                      {!attendee.checkIn && (
                        <button
                          className="checkin-button"
                          onClick={() => handleCheckIn(attendee._id)}
                        >
                          Check-In
                        </button>
                      )}

                      <button
                        className="delete-button"
                        onClick={() => handleDelete(attendee._id)}
                      >
                        Delete
                      </button>
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

export default EventDetails;
