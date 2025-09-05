import React, { useState } from 'react';
import './Keys.css';
import Navbar from "../../components/navbar";


function Keys() {
    const [modalAberto, setModalAberto] = useState(false);

    const [nomeLab, setNomeLab] = useState("");
    const [descLab, setDescLab] = useState("");

    const [labs, setLabs] = useState([]);

    const abrirModal = () => setModalAberto(true);
    const fecharModal = () => setModalAberto(false);

    const handleSalvar = (e) => {
        e.preventDefault();
        const novoLab = { nome_lab: nomeLab, desc_lab: descLab };
        setLabs([...labs, novoLab]);

        // Limpar campos
        setNomeLab("");
        setDescLab("");

        fecharModal();
    };

    return (
        <div className="chaves-container">
            <header className="chaves-header">
                <h1>Chaves</h1>
            </header>

            <div className="chaves-filtros">
                <div>
                    <h3>Ambiente:</h3>
                    <input type="text" placeholder="Ambiente" />
                </div>
                <div>
                    <h3>Descrição:</h3>
                    <input type="text" placeholder="Descrição" />
                </div>

            </div>

            <div className="chaves-acoes">
                <button onClick={abrirModal}>Adicionar Chave</button>
                <button>Pesquisar</button>
            </div>

            <table className="chaves-tabela">
                <thead>
                    <tr>
                        <th>Código</th>
                        <th>Ambiente</th>
                        <th>Descrição</th>
                        <th>Editar</th>
                    </tr>
                </thead>
                <tbody>
                    {[...Array(6)].map((_, i) => (
                        <tr key={i}>
                            <td>Celula</td>
                            <td>Celula</td>
                            <td>Celula</td>
                            <td><button className="editar-btn">✏️</button></td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* Modal */}
            {modalAberto && (
                <div className="modal-fundo">
                    <div className="modal-conteudo">
                        <h2>Adicionar Laboratório</h2>
                        <form onSubmit={handleSalvar}>
                            <input
                                type="text"
                                placeholder="Nome do laboratório"
                                value={nomeLab}
                                onChange={(e) => setNomeLab(e.target.value)}
                                required
                            />
                            <input
                                type="text"
                                placeholder="Descrição"
                                value={descLab}
                                onChange={(e) => setDescLab(e.target.value)}
                            />

                            <div className="modal-botoes">
                                <button type="button" onClick={fecharModal}>
                                    Cancelar
                                </button>
                                <button type="submit">Salvar</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Keys;