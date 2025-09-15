import React from "react";
import { useState, useEffect } from "react";
import "./Devolver.css";
import { useNavigate } from "react-router-dom";
import BotaoVoltar from "../../../components/botaoVoltar/botaoVoltar";
// import logoetec from '../../assets/logoetec.png';

function Devolver() {
    const navigate = useNavigate();

    const devolverchave = () => {
        navigate("/Devolver/DevolverChave"); // caminho da página de retirada de chave
    };

    const devolverequipamento = () => {
        navigate("/Devolver/DevolverEquipamento"); // caminho da página de retirada de equipamento
    };

    return (
        <div className="pagina">
            <div>
                {/* <img src={logoetec} alt="" className="logoetec" /> */}
            </div>
            <div className="botoes">
                <button onClick={devolverchave}>Devolver Chave</button>
                <button onClick={devolverequipamento}>Devolver Equipamento</button>
            </div>
            <BotaoVoltar />
        </div>
    )
}

export default Devolver;