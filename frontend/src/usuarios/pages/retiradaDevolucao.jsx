import { useState } from "react";
import "./retiradaDevolucao.css";
import api from "../../services/api";

function RetiradaDevolucao() {
    const [identificacao, setIdentificacao] = useState("");
    const [tipo, setTipo] = useState("");
    const [codigo, setCodigo] = useState("");

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log("Identificação:", identificacao);
        console.log("Tipo escolhido:", tipo);
        console.log("Código:", codigo);
    };

    return (
        <div className="wrapper-pagprofs">
            <div className="container-pagprofs">
                <h2>Retirada e Devolução</h2>
                <form onSubmit={handleSubmit}>

                    {/* Label e input de identificação */}
                    <label htmlFor="identificacao" className="form-label">RM ou CPF:</label>
                    <input
                        id="identificacao"
                        type="text"
                        placeholder="Digite seu RM ou CPF"
                        value={identificacao}
                        onChange={(e) => setIdentificacao(e.target.value)}
                        className="input-identificacao"
                    />

                    {/* Opções de tipo */}
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

                    {/* Label e input do código */}
                    {tipo && (
                        <>
                            <label htmlFor="codigo" className="form-label">
                                Código da chave ou equipamento:
                            </label>
                            <input
                                id="codigo"
                                type="text"
                                placeholder={`Digite o código`}
                                value={codigo}
                                onChange={(e) => setCodigo(e.target.value)}
                                className="input-codigo"
                            />
                        </>
                    )}

                    {/* Botões */}
                    <div className="buttons">
                        <button type="submit" className="btn-retirar">
                            Retirar
                        </button>
                        <button type="submit" className="btn-devolver">
                            Devolver
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default RetiradaDevolucao;
