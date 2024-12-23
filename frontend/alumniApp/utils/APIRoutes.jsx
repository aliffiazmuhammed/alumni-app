export const host = 'http://localhost:5000';
export const excelUpload = `${host}/api/uploadExcel`; 
export const editattendee = `${host}/api/editAttendee`;
export const deleteattendee = `${host}/api/deleteAttendee`;
export const searchattendee = `${host}/api/searchAttendee`;

//admin routes
export const adminLoginRoute = `${host}/api/admin/adminlogin`;

//event routes
export const geteventsRoute = `${host}/api/event`;
export const deleteeventRoute = `${host}/api/event/delete`;
export const updateeventRoute = `${host}/api/event/update`;
export const getsingleeventRoute = `${host}/api/event/get`;
export const addeventRoute = `${host}/api/event/add`;

//attendeesroute
export const uploadexcelRoute = `${host}/api/attendees/uploadExcel`;
export const searchattendeeRoute = `${host}/api/attendees/search`;
export const editattendeeRoute = `${host}/api/attendees/edit`;
export const deleteattendeeRoute = `${host}/api/attendees/delete`;