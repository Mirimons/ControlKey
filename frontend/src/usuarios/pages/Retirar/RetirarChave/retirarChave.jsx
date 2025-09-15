import React from "react";
import './retirarChave.css';
import BotaoVoltar from "../../../../components/botaoVoltar/botaoVoltar";

function RetirarChave() {
    return (
        <div className="pagina">
            <div className="inputs">
                <input type="text" placeholder="Inforome seu RM ou CPF:" className="input"/>
                <input type="text" placeholder="Informe o código da chave" className="input"/>
                <button className="button">Retirar</button>
            </div>
            <BotaoVoltar />
        </div>
    )
}

export default RetirarChave;