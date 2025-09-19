import { useState, useEffect } from "react";
import "./retiradaDevolucao.css";
// import { useNavigate } from "react-router-dom";
// import logoetec from '../../assets/logoetec.png';
import api from "../../services/api";

function RetiradaDevolucao() {
    const [retirar, setRetirar] = useState("");
    const [devolver, setDevolver] = useState("");
    const [rmCpf, setRmCpf] = useState("");

    return (
        <div className="container">
            {/* Header */}
            <header className="header">
                <img src="/logo-etec.png" alt="Etec" className="logo" />
                <img src="/logo-cps.png" alt="CPS" className="logo" />
            </header>

            {/* Conteúdo */}
            <main className="content">
                {/* Select Retirar */}
                <select
                    value={retirar}
                    onChange={(e) => setRetirar(e.target.value)}
                    className="select"
                >
                    <option value="" disabled hidden>Retirar</option>
                    <option value="chave">Chave</option>
                    <option value="equipamento">Equipamento</option>
                </select>

                {/* Select Devolver */}
                <select 
                    value={devolver}
                    onChange={(e) => setDevolver(e.target.value)}
                    className="select"
                >
                    <option value="" disabled hidden>Devolver</option>
                    <option value="chave">Chave</option>
                    <option value="equipamento">Equipamento</option>
                </select>

                {/* Input RM ou CPF */}
                <div className="input-box">
                    <label>Informe seu RM ou CPF:</label>
                    <input
                        type="text"
                        value={rmCpf}
                        onChange={(e) => setRmCpf(e.target.value)}
                        className="input"
                        placeholder="Digite aqui"
                    />
                </div>
                <button 
                
                
                
                className="botaoOk"> OK! </button>
            </main>
        </div>
    );
}

export default RetiradaDevolucao;