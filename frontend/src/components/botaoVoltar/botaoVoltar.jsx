import React from "react";
import "./botaoVoltar.css";
import { useNavigate } from "react-router-dom";

function Voltar() {
    const navigate = useNavigate();

    const voltar = () => {
        navigate("/retiradaDevolucao"); // caminho da página de retirada de chave
    };

    return (
        <button onClick={voltar} className="buttonVoltar"> Voltar </button>
    )
}

export default Voltar;