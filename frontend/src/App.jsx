import React from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';

import Navbar from './components/navbar';
import Home from './administrador/pages/Home/Home';
import User from './administrador/pages/User/User';
import Keys from './administrador/pages/Keys/Keys';
import Equipaments from './administrador/pages/Equipaments/Equipaments';
import Reservation from './administrador/pages/Reservation/Reservation';
import Login from './administrador/pages/Login/Login';
import RetiradaDevolucao from './usuarios/pages/retiradaDevolucao';
import Retirar from './usuarios/pages/Retirar/Retirar';
import Devolver from './usuarios/pages/Devolver/Devolver';
import RetirarChave from './usuarios/pages/Retirar/RetirarChave/retirarChave';


function App() {
  const location = useLocation();
  const hideNavbarPaths = ['/', '/retiradaDevolucao', '/Retirar', '/Devolver', '/retirarChave'];
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
            <Route path="/RetiradaDevolucao" element={<RetiradaDevolucao />} />
            <Route path="/Retirar" element={<Retirar />} />
            <Route path="/Devolver" element={<Devolver />} />
            <Route path="/RetirarChave" element={<RetirarChave />} />
          </Routes>
      </div>
    </div>
  );
}

export default App;

