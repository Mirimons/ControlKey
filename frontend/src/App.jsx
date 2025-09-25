import React, { useEffect } from 'react';
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
import RetirarEquipamento from './usuarios/pages/Retirar/RetirarEquipamento/retirarEquipamento';
import DevolverChave from './usuarios/pages/Devolver/DevolverChave/devolverChave';
import DevolverEquipamento from './usuarios/pages/Devolver/DevolverEquipamento/devolverEquipamento';


function App() {
  const location = useLocation();

  // título fixo da aba
  useEffect(() => {
    document.title = "ControlKey";
  }, []);

  const hideNavbarPaths = [
    '/', '/retiradaDevolucao', '/Retirar', '/Devolver',
    '/Retirar/RetirarChave', '/Retirar/RetirarEquipamento',
    '/Devolver/DevolverChave', '/Devolver/DevolverEquipamento'
  ];
  
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
          <Route path="/retiradaDevolucao" element={<RetiradaDevolucao />} />
          <Route path="/Retirar" element={<Retirar />} />
          <Route path="/Devolver" element={<Devolver />} />
          <Route path="/Retirar/RetirarChave" element={<RetirarChave />} />
          <Route path="/Retirar/RetirarEquipamento" element={<RetirarEquipamento />} />
          <Route path="/Devolver/DevolverChave" element={<DevolverChave />} />
          <Route path="/Devolver/DevolverEquipamento" element={<DevolverEquipamento />} />
        </Routes>
      </div>
    </div>
  );
}

export default App;

