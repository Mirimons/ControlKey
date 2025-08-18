import React from "react";
import "./sidebar.css";
import { FaHome, FaUser, FaKey, FaTools, FaClipboardList, FaChartBar } from "react-icons/fa";
import { Link } from 'react-router-dom';
import logo from '../assets/LOGOCERTO.png';

const SideBar = () => {
    return (
        <div className="sidebar">
            <img src={logo} alt="Logo da ETEC" className="sidebar-logo" />

            <ul>
                <li><FaHome /><Link to="/">Página Inicial</Link></li>
                <li><FaUser /><Link to="/user">Usuários</Link></li>
                <li><FaKey /><Link to="/keys"> Chaves</Link></li>
                <li><FaTools /><Link to="/equipaments"> Equipamentos </Link> </li>
                <li><FaClipboardList /><Link to="/reservation"> Reservas </Link></li>
                <li><FaChartBar /> Relatório</li>
            </ul>
        </div>
    );
};

export default SideBar; 