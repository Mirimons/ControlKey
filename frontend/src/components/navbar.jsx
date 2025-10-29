import React from "react";
import "./navbar.css";
import { FaDoorOpen } from "react-icons/fa";
import { Link } from "react-router-dom";
import logo from "../assets/LOGOCERTO.png";

function handleLogout() {
  sessionStorage.clear()
  console.log("Usuário deslogado");
}

const navbar = () => {
  return (
    <div className="navbar">
      <img src={logo} alt="Logo da ETEC" className="navbar-logo" />

      <div className="navbar-menu">
        <ul>
          <li>
            <Link to="/home">Página Inicial</Link>
          </li>
          <li>
            <Link to="/user">Usuários</Link>
          </li>
          <li>
            <Link to="/keys">Chaves</Link>
          </li>
          <li>
            <Link to="/equipaments">Equipamentos</Link>
          </li>
          <li>
            <Link to="/reservation">Reservas</Link>
          </li>
          <li>
            <Link to="/relatorio">Relatório</Link>
          </li>
          <li>
            <Link to="/login">
              <FaDoorOpen className="logout" onClick={handleLogout}/>
            </Link>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default navbar;
