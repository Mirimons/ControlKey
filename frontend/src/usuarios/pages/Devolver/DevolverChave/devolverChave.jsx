import React from "react";
import './devolverChave.css';
import BotaoVoltar from "../../../../components/botaoVoltar/botaoVoltar";

function DevolverChave() {
    return (
        <div className="pagina">
            <div className="inputs">
                <input type="text" placeholder="Inforome seu RM ou CPF:" className="input"/>
                <input type="text" placeholder="Informe o código da chave:" className="input"/>
                <button className="button">Devolver</button>
            </div>
            <BotaoVoltar />
        </div>
    )
}

export default DevolverChave;