import {BrowserRouter,Route,Routes} from'react-router-dom'
import Admin from '../pages/Admin'
import Adminlogin from '../pages/Adminlogin'
import Userlogin from '../pages/Userlogin'

function App() {


  return (
    <BrowserRouter>
      <Routes>
        <Route path ='/admin' element = {< Admin />} />
        <Route path ='/adminlogin' element = {< Adminlogin />} />
        <Route path ='/userlogin' element = {< Userlogin />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
