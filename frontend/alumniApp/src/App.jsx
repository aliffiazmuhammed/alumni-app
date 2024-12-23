import {BrowserRouter,Route,Routes} from'react-router-dom'
import Admin from '../pages/Admin'
import Adminlogin from '../pages/Adminlogin'
import Userlogin from '../pages/Userlogin'
import AdminDashboard from '../pages/Admindashboard'
import EventDetails from '../pages/EventDetails'
function App() {


  return (
    <BrowserRouter>
      <Routes>
        <Route path ='/admin' element = {< Admin />} />
        <Route path ='/adminlogin' element = {< Adminlogin />} />
        <Route path ='/userlogin' element = {< Userlogin />} />
        <Route path ='/admindashboard/:adminId' element = {< AdminDashboard />} />
        <Route path ='/eventdetails/:eventId' element = {< EventDetails />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
