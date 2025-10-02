import { useState, useEffect } from "react";
import "./retiradaDevolucao.css";
// import { useNavigate } from "react-router-dom";
// import logoetec from '../../assets/logoetec.png';
import api from "../../services/api";

function RetiradaDevolucao() {
    const [identificacao, setIdentificacao] = useState("");
    const [tipo, setTipo] = useState("");

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log("Identificação:", identificacao);
        console.log("Tipo escolhido:", tipo);
        // Aqui você chamaria sua API ou salvaria no banco
    };

    return (
        <div className="wrapper-pagprofs">
            <div className="container-pagprofs">
                <h2>Retirada e Devolução</h2>
                <form onSubmit={handleSubmit}>
                    <input
                        type="text"
                        placeholder="Digite seu RM ou CPF"
                        value={identificacao}
                        onChange={(e) => setIdentificacao(e.target.value)}
                        className="input-identificacao"
                    />

                    <div className="opcoes">
                        <label className="radio-label">
                            <input
                                type="radio"
                                name="tipo"
                                value="chave"
                                checked={tipo === "chave"}
                                onChange={(e) => setTipo(e.target.value)}
                            />
                            <span className="custom-radio"></span>
                            Chave
                        </label>

                        <label className="radio-label">
                            <input
                                type="radio"
                                name="tipo"
                                value="equipamento"
                                checked={tipo === "equipamento"}
                                onChange={(e) => setTipo(e.target.value)}
                            />
                            <span className="custom-radio"></span>
                            Equipamento
                        </label>
                    </div>

                    <div className="buttons">
                        <button type="submit" className="btn-retirar">
                            Retirar
                        </button>

                        <button type="submit" className="btn-devolver">
                            Devolver
                        </button>
                    </div>
                </form>
            </div >
        </div>
    );
}

export default RetiradaDevolucao;