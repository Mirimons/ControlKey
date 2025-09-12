import React from "react";
import './retirarEquipamento.css';
import BotaoVoltar from "../../../../components/botaoVoltar/botaoVoltar";

function RetirarEquipamento() {
    return (
        <div className="pagina">
            <div className="inputs">
                <input type="text" placeholder="Inforome seu RM ou CPF:" className="input"/>
                <input type="text" placeholder="Informe o código do equipamento:" className="input"/>
                <button className="button">Retirar</button>
            </div>
            <BotaoVoltar />
        </div>
    )
}

export default RetirarEquipamento;