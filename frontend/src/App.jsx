import React from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';

import Navbar from './components/navbar';
import Home from './pages/Home/Home';
import User from './pages/User/User';
import Keys from './pages/Keys/Keys';
import Equipaments from './pages/Equipaments/Equipaments';
import Reservation from './pages/Reservation/Reservation';
import Login from './pages/Login/Login';


function App() {
  const location = useLocation();
  return (
    <div className='app-container'>
      {location.pathname !== '/' && <Navbar />}
      <div className='main-content'>
          <Routes>
            <Route path="/Home" element={<Home />} />
            <Route path="/User" element={<User />} />
            <Route path="/Keys" element={<Keys />} />
            <Route path="/Equipaments" element={<Equipaments />} />
            <Route path="/Reservation" element={<Reservation />} />
            <Route path="/" element={<Login />} />
          </Routes>
      </div>
    </div>
  );
}

export default App;

