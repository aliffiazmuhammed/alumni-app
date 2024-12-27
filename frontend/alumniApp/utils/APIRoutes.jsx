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
export const generatereportRoute = `${host}/api/attendees/generatereport`;
export const sendremaindermailsRoute = `${host}/api/attendees/sendremaindermails`
export const checkinattendee = `${host}/api/attendees/checkin`;
export const addattendee = `${host}/api/attendees/add`;

//userloginroutes
export const sentotpRoute = `${host}/api/userlogin/send-otp`;

//userpageroutes
export const userpageRoute = `${host}/api/userevents`;


//usereventroutes

export const userupdateguestRoute = `${host}/api/user/events/updateGuestCount`;
export const usereventregisterRoute = `${host}/api/user/events/register`;
export const usereventcheckinRoute = `${host}/api/user/events/checkin`;
export const usereventRoute = `${host}/api/user/events/usereve`;
export const usereventregistrationstatusRoute = `${host}/api/user/events/registrationStatus`;
export const fetchUserDetailsRoute = `${host}/api/user/events/fetchuserdetails`;