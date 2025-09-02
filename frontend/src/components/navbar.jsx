import React from "react";
import "./navbar.css";
import { FaHome, FaUser, FaKey, FaTools, FaClipboardList, FaChartBar } from "react-icons/fa";
import { Link } from 'react-router-dom';
import logo from '../assets/LOGOCERTO.png';

const navbar = () => {
    return (
        <div className="navbar">
            <img src={logo} alt="Logo da ETEC" className="navbar-logo" />

            <ul>
                <li><Link to="/home"><FaHome /> Página Inicial</Link></li>
                <li><Link to="/user"><FaUser /> Usuários</Link></li>
                <li><Link to="/keys"><FaKey /> Chaves</Link></li>
                <li><Link to="/equipaments"><FaTools /> Equipamentos</Link></li>
                <li><Link to="/reservation"><FaClipboardList /> Reservas</Link></li>
                <li><FaChartBar /> Relatório</li>
            </ul>
        </div>
    );
};

export default navbar; 