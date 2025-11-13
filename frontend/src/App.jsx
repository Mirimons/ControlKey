import React, { useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';

import Navbar from './components/navbar';
import Home from './administrador/pages/Home/Home';
import User from './administrador/pages/User/User';
import Keys from './administrador/pages/Keys/Keys';
import Equipaments from './administrador/pages/Equipaments/Equipaments';
import Reservation from './administrador/pages/Reservation/Reservation';
import Relatorio from './administrador/pages/Relatorio/Relatorio';
import Login from './administrador/pages/Login/Login';
import RetiradaDevolucao from './usuarios/pages/retiradaDevolucao';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ProtectedRouter from './helpers/protectedRouter';
import EsqueceuSenha from "./administrador/pages/esqueceuSenha/esqueceuSenha";


function App() {
  const location = useLocation();

  // título fixo da aba
  useEffect(() => {
    document.title = "ControlKey";
  }, []);

  const hideNavbarPaths = [
    '/', '/retiradaDevolucao', '/Retirar', '/Devolver',
    '/Retirar/RetirarChave', '/Retirar/RetirarEquipamento',
    '/Devolver/DevolverChave', '/Devolver/DevolverEquipamento', '/login',
    '/EsqueceuSenha'
  ];
  
  return (
    <div className='app-container'>
    <ToastContainer />
      {!hideNavbarPaths.includes(location.pathname) && <Navbar />}
      <div className='main-content'>
        <Routes>
          <Route path="/Login" element={<Login />} />
          <Route path="/Home" element={
            <ProtectedRouter>
              <Home />
            </ProtectedRouter>} 
          />
          <Route path="/User" element={
            <ProtectedRouter>
              <User />
            </ProtectedRouter>} 
          />
          <Route path="/Keys" element={
            <ProtectedRouter>
              <Keys />
            </ProtectedRouter>} 
          />
            <Route path="/Equipaments" element={
              <ProtectedRouter >
                <Equipaments />
              </ProtectedRouter>
              } 
            />
          <Route path="/Reservation" element={
            <ProtectedRouter>
              <Reservation />
            </ProtectedRouter>} 
          />
          <Route path="/Relatorio" element={
            <ProtectedRouter>
              <Relatorio />
            </ProtectedRouter>} 
          />
          <Route path="/" element={<RetiradaDevolucao />} />
          <Route path="/EsqueceuSenha" element={<EsqueceuSenha />} />
        </Routes>
      </div>
    </div>
  );
}

export default App;

