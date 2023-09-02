import styled from 'styled-components';
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

const StyledNav = styled.nav`
  display: flex;
  justify-content: space-between;
`;

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
      <StyledNav>
        <Link to="/">Home</Link>
        <Link to="/myappointment">My appointment</Link>
        {!isAuthenticated && <Link to="/login">Login</Link>}
        {isAuthenticated && <Link onClick={handleLogout}>Logout</Link>}
      </StyledNav>
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