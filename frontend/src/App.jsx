import React from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';

import Navbar from './components/navbar';
import Home from './pages/Home';
import User from './pages/User';
import Keys from './pages/Keys';
import Equipaments from './pages/Equipaments';
import Reservation from './pages/Reservation';
import Login from './pages/Login';


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

