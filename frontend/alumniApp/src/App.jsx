import {BrowserRouter,Route,Routes} from'react-router-dom'
import Admin from '../pages/Admin'
import Adminlogin from '../pages/Adminlogin'
import Userlogin from '../pages/Userlogin'
import AdminDashboard from '../pages/Admindashboard'
import EventDetails from '../pages/EventDetails'
import UserPage from '../pages/UserPage'
import UserEvent from '../pages/UserEvent'
import Footer from '../components/Footer'
function App() {


  return (
    <BrowserRouter>
      <div
        style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}
      >
        <div style={{ flex: 1 }}>
          {/* Routes for the pages */}
          <Routes>
            <Route path="/admin" element={<Admin />} />
            <Route path="/" element={<Adminlogin />} />
            <Route path="/userlogin" element={<Userlogin />} />
            <Route
              path="/admindashboard/:adminId"
              element={<AdminDashboard />}
            />
            <Route path="/eventdetails/:eventId" element={<EventDetails />} />
            <Route path="/userpage" element={<UserPage />} />
            <Route path="/userevent/:eventId" element={<UserEvent />} />
          </Routes>
        </div>
        {/* Footer */}
        <Footer />
      </div>
    </BrowserRouter>
  );
}

export default App
