import React, { useState } from 'react';
import './User.css';
import SideBar from "../components/sidebar";

function User() {
    const [modalAberto, setModalAberto] = useState(false);
    const [tipoUsuario, setTipoUsuario] = useState("");

    const abrirModal = () => setModalAberto(true);
    const fecharModal = () => setModalAberto(false);

    const handleSalvar = (e) => {
        e.preventDefault(); // evita recarregar a página
        console.log("Usuário salvo!");
        fecharModal();
    };

    return (
        <div className="usuarios-container">
            <header className="usuarios-header">
                <h1>Usuários</h1>
                <span>Olá, Fulano de Tal!</span>
            </header>

            <div className="usuarios-filtros">
                <div>
                    <h3>Nome completo</h3>
                    <input type="text" placeholder="Nome completo" />
                </div>
                <div>
                    <h3>Selecione o tipo de usuário:</h3>
                    <select defaultValue="">
                        <option value="" disabled hidden>Selecione o tipo de usuário</option>
                        <option value="Administrador">Administrador</option>
                        <option value="Comum">Comum</option>
                    </select>
                </div>
            </div>

            <div className="usuarios-acoes">
                <button type="button" onClick={abrirModal}>Adicionar Usuário</button>
                <button type="button">Pesquisar</button>
            </div>

            <table className="usuarios-tabela">
                <thead>
                    <tr>
                        <th>Código</th>
                        <th>Nome</th>
                        <th>Tp_usuário</th>
                        <th>Telefone</th>
                        <th>Editar</th>
                    </tr>
                </thead>
                <tbody>
                    {[...Array(6)].map((_, i) => (
                        <tr key={i}>
                            <td>Celula</td>
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
                        <form onSubmit={handleSalvar}>
                            <h2>Adicionar Usuário</h2>

                            <select
                                value={tipoUsuario}
                                onChange={(e) => setTipoUsuario(e.target.value)}
                                required
                            >
                                <option value="" disabled hidden>Selecione o tipo de usuário</option>
                                <option value="Administrador">Administrador</option>
                                <option value="Comum">Comum</option>
                            </select>

                            <input type="text" placeholder="Nome completo" required />
                            <input type="text" placeholder="CPF" required />
                            <input type="email" placeholder="Email Institucional" required />
                            <input type="tel" placeholder="Telefone (celular)" required />
                            <input type="text" placeholder="Matrícula" required />
                            <input type="date" placeholder="Data de Nascimento" required />

                            <div className="modal-botoes">
                                <button type="button" onClick={fecharModal}>Cancelar</button>
                                <button type="submit">Salvar</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default User;

