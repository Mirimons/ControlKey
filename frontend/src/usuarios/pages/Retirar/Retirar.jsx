import React from "react";
import { useState, useEffect } from "react";
import "./Retirar.css";
import { useNavigate } from "react-router-dom";
// import logoetec from '../../assets/logoetec.png';

function Retirar() {
    const navigate = useNavigate();

    const identificacao = () => {
        navigate("./RetirarChave"); // caminho da página de retirada
    };

    return (
        <div className="pagina">
            <div>
                {/* <img src={logoetec} alt="" className="logoetec" /> */}
            </div>
            <div className="botoes">
                <button onClick={identificacao}>Retirar Chave</button>
                <button>Retirar Equipamento</button>
            </div>
        </div>
    )
}

export default Retirar;