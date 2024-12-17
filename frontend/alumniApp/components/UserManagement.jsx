import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import { Table, Button, Form, Modal } from 'react-bootstrap';

function UserManagement() {
  const [attendees, setAttendees] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [currentAttendee, setCurrentAttendee] = useState(null);

  // Function to handle Excel file upload
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();

    reader.onload = () => {
      const ab = reader.result;
      const wb = XLSX.read(ab, { type: 'array' });
      const sheet = wb.Sheets[wb.SheetNames[0]];
      const data = XLSX.utils.sheet_to_json(sheet);
      setAttendees(data);
    };

    reader.readAsArrayBuffer(file);
  };

  // Function to handle editing attendee
  const handleEdit = (attendee) => {
    setCurrentAttendee(attendee);
    setShowModal(true);
  };

  // Function to handle deleting attendee
  const handleDelete = (email) => {
    setAttendees(attendees.filter((attendee) => attendee.email !== email));
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setCurrentAttendee(null);
  };

  const handleSaveChanges = () => {
    setAttendees(attendees.map(attendee => 
      attendee.email === currentAttendee.email ? currentAttendee : attendee
    ));
    setShowModal(false);
  };

  return (
    <div className="user-management">
      <h2>User Management</h2>
      <input type="file" accept=".xlsx, .xls" onChange={handleFileUpload} />
      <Table striped bordered hover>
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
          {attendees.map((attendee) => (
            <tr key={attendee.email}>
              <td>{attendee.name}</td>
              <td>{attendee.phone}</td>
              <td>{attendee.email}</td>
              <td>{attendee.guestCount}</td>
              <td>{attendee.paymentStatus}</td>
              <td>
                <Button onClick={() => handleEdit(attendee)} variant="primary">Edit</Button>
                <Button onClick={() => handleDelete(attendee.email)} variant="danger">Delete</Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      {/* Modal for editing attendee */}
      <Modal show={showModal} onHide={handleCloseModal}>
        <Modal.Header closeButton>
          <Modal.Title>Edit Attendee</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group controlId="name">
              <Form.Label>Name</Form.Label>
              <Form.Control
                type="text"
                value={currentAttendee?.name || ''}
                onChange={(e) => setCurrentAttendee({ ...currentAttendee, name: e.target.value })}
              />
            </Form.Group>
            <Form.Group controlId="phone">
              <Form.Label>Phone</Form.Label>
              <Form.Control
                type="text"
                value={currentAttendee?.phone || ''}
                onChange={(e) => setCurrentAttendee({ ...currentAttendee, phone: e.target.value })}
              />
            </Form.Group>
            <Form.Group controlId="guestCount">
              <Form.Label>Guest Count</Form.Label>
              <Form.Control
                type="number"
                value={currentAttendee?.guestCount || ''}
                onChange={(e) => setCurrentAttendee({ ...currentAttendee, guestCount: e.target.value })}
              />
            </Form.Group>
            <Form.Group controlId="paymentStatus">
              <Form.Label>Payment Status</Form.Label>
              <Form.Control
                type="text"
                value={currentAttendee?.paymentStatus || ''}
                onChange={(e) => setCurrentAttendee({ ...currentAttendee, paymentStatus: e.target.value })}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>Close</Button>
          <Button variant="primary" onClick={handleSaveChanges}>Save Changes</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default UserManagement;
