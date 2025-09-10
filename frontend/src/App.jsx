import React from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';

import Navbar from './components/navbar';
import Home from './administrador/pages/Home/Home';
import User from './administrador/pages/User/User';
import Keys from './administrador/pages/Keys/Keys';
import Equipaments from './administrador/pages/Equipaments/Equipaments';
import Reservation from './administrador/pages/Reservation/Reservation';
import Login from './administrador/pages/Login/Login';
import RetiradaDevolução from './usuarios/pages/retiradaDevolução';


function App() {
  const location = useLocation();
  const hideNavbarPaths = ['/', '/RetiradaDevolucao'];
  return (
    <div className='app-container'>
     {!hideNavbarPaths.includes(location.pathname) && <Navbar />}
      <div className='main-content'>
          <Routes>
            <Route path="/Home" element={<Home />} />
            <Route path="/User" element={<User />} />
            <Route path="/Keys" element={<Keys />} />
            <Route path="/Equipaments" element={<Equipaments />} />
            <Route path="/Reservation" element={<Reservation />} />
            <Route path="/" element={<Login />} />
            <Route path="/RetiradaDevolucao" element={<RetiradaDevolução />} />
          </Routes>
      </div>
    </div>
  );
}

export default App;

