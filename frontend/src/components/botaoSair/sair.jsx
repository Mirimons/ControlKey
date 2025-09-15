import React from "react";
import "./sair.css";
import { useNavigate } from "react-router-dom";

function Sair() {
    const navigate = useNavigate();

    const sair = () => {
        navigate("/"); // caminho da página de retirada de chave
    };

    return (
        <button onClick={sair} className="buttonSair"> Sair </button>
    )
}

export default Sair;