import React from "react";
import { useState, useEffect } from "react";
import "./Retirar.css";
import { useNavigate } from "react-router-dom";
import BotaoVoltar from "../../../components/botaoVoltar/botaoVoltar";
// import logoetec from '../../assets/logoetec.png';

function Retirar() {
    const navigate = useNavigate();

    const retirarchave = () => {
        navigate("/Retirar/RetirarChave"); // caminho da página de retirada de chave
    };

    const retirarequipamento = () => {
        navigate("/Retirar/RetirarEquipamento"); // caminho da página de retirada de equipamento
    };

    return (
        <div className="pagina">
            <div>
                {/* <img src={logoetec} alt="" className="logoetec" /> */}
            </div>
            <div className="botoes">
                <button onClick={retirarchave}>Retirar Chave</button>
                <button onClick={retirarequipamento}>Retirar Equipamento</button>
            </div>
            <BotaoVoltar />
        </div>

    )
}

export default Retirar;