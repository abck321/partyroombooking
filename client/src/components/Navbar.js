import { BrowserRouter, Route, Routes, Link, Navigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import { useState, useEffect } from 'react';
import { checkAuth } from './auth';

// Import your components
import Home from './Home';
import MyAppointment from './MyAppointment';
import Login from './Login';
import Register from './Register'
import PartyRoomBooking from './PartyRoomBooking'
import NotFound from './NotFound'

const Navbar = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  useEffect(() => {
    const authenticate = async () => {
      const isAuthenticated = await checkAuth();
      setIsAuthenticated(isAuthenticated);
      if(!isAuthenticated) Cookies.remove('access_token');
    };
    authenticate();
  }, []);
  
  const handleLogout = () => {
    Cookies.remove('access_token');
    sessionStorage.removeItem('user');
    window.location.replace('/');
  };

  return ( 
    <BrowserRouter>
      <nav>
        <menu>
        <Link to="/"><li><div className='abc'>Home</div></li></Link>
        <Link to="/myappointment"><li><div className='abc'>My appointment</div></li></Link>
        {!isAuthenticated && <Link to="/login"><li><div className='abc'>Login</div></li></Link>}
        {isAuthenticated && <Link onClick={handleLogout}><li><div className='abc'>Logout</div></li></Link>}
        </menu>
      </nav>
      <Routes>
        <Route path="/" element={<Home isAuthenticated={isAuthenticated}/>} />
        <Route path="/myappointment" element={<MyAppointment isAuthenticated={isAuthenticated}/>} />
        <Route path="/login" element={isAuthenticated ? <Navigate to="/" replace /> : <Login/>} />
        <Route path="/register" element={isAuthenticated ? <Navigate to="/" replace /> : <Register/>} />
        <Route path="/partyroomdetail" element={<PartyRoomBooking isAuthenticated={isAuthenticated}/>} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}
 
export default Navbar;