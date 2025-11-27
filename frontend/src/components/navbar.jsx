import React from "react";
import "./navbar.css";
import { FaDoorOpen } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import logo from "../assets/LOGOCERTO.png";
import { toast } from "react-toastify";

const Navbar = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    sessionStorage.clear();
    localStorage.removeItem("refreshToken");
    toast.success("Usuário deslogado com sucesso!");
    console.log("Usuário deslogado");
    navigate("/login");
  };

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
            <FaDoorOpen
              className="logout"
              onClick={handleLogout}
              style={{ cursor: "pointer" }}
              title="Sair"
            />
          </li>
        </ul>
      </div>
    </div>
  );
};

export default Navbar;
