import React from "react";
import { useState, useEffect } from "react";
import "./retiradaDevolucao.css";
import { useNavigate } from "react-router-dom";
import logoetec from '../../assets/logoetec.png';

function RetiradaDevolucao() {
    const navigate = useNavigate();

    const irParaRetirar = () => {
        navigate("/Retirar"); // caminho da página de retirada
    };

    const irParaDevolver = () => {
        navigate("/Devolver"); // caminho da página de retirada
    };

    return (
        <div className="pagina">
            <div>
                {/* <img src={logoetec} alt="" className="logoetec" /> */}
            </div>
            <div className="botoes">
                <button onClick={irParaRetirar}>Retirar</button>
                <button onClick={irParaDevolver}>Devolver</button>
            </div>
        </div>
    )
}

export default RetiradaDevolucao;