import React from "react";
import './devolverEquipamento.css';
import BotaoVoltar from "../../../../components/botaoVoltar/botaoVoltar";

function DevolverEquipamento() {
    return (
        <div className="pagina">
            <div className="inputs">
                <input type="text" placeholder="Inforome seu RM ou CPF:" className="input"/>
                <input type="text" placeholder="Informe o código do equipamento:" className="input"/>
                <button className="button">Devolver</button>
            </div>
            <BotaoVoltar />
        </div>
    )
}

export default DevolverEquipamento;