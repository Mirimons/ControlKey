import React, { useState } from 'react';
import './User.css';
import Navbar from "../components/navbar";
import api from '../services/api';

function User() {
    const [modalAberto, setModalAberto] = useState(false);
    const [id_tipo, setId_tipo] = useState("");

    const [nome, setNome] = useState("");
    const [cpf, setCpf] = useState("");
    const [email, setEmail] = useState("");
    const [telefone, setTelefone] = useState("");
    const [matricula, setMatricula] = useState("");
    const [data_nasc, setData_nasc] = useState("");
    const [senha, setSenha] = useState("");
    
    const abrirModal = () => setModalAberto(true);
    const fecharModal = () => setModalAberto(false);

    const handleSalvar = (e) => {
        e.preventDefault();

        api.post("/usuario", {
            id_tipo,
            nome,
            cpf,
            data_nasc,
            telefone,
            matricula,
            email,
            senha
        })
            .then(response => {
                console.log("Usuário cadastrado:", response.data);
                alert("Usuário cadastrado com sucesso!");
                fecharModal();

                // limpa os campos
                setNome("");
                setCpf("");
                setEmail("");
                setTelefone("");
                setMatricula("");
                setData_nasc("");
                setId_tipo("");
                setSenha("");

                sessionStorage.setItem("tokenJwt", data.token);
            })
            .catch(error => {
                console.error("Erro ao cadastrar:", error);
                alert(error.response?.data?.error || "Erro ao cadastrar usuário!");
            });
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
                                value={id_tipo}
                                onChange={(e) => setId_tipo(Number(e.target.value))}
                                required defaultValue=""
                            >
                                <option value="" disabled selected hidden>Selecione o tipo de usuário</option>
                                <option value={1}>Administrador</option>
                                <option value={2}>Comum</option>
                                <option value={3}>Terceiro</option>
                            </select>


                            <input
                                type="text"
                                placeholder="Nome completo"
                                value={nome}
                                onChange={(e) => setNome(e.target.value)}
                                required
                            />

                            <input
                                type="text"
                                placeholder="CPF"
                                value={cpf}
                                onChange={(e) => setCpf(e.target.value)}
                                required
                            />

                            <input
                                type="email"
                                placeholder="Email Institucional"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />

                            <input
                                type="tel"
                                placeholder="Telefone (celular)"
                                value={telefone}
                                onChange={(e) => setTelefone(e.target.value)}
                                required
                            />

                            <input
                                type="text"
                                placeholder="Matrícula"
                                value={matricula}
                                onChange={(e) => setMatricula(e.target.value)}
                                required
                            />

                            <input
                                type="date"
                                placeholder="Data de Nascimento"
                                value={data_nasc}
                                onChange={(e) => setData_nasc(e.target.value)}
                                required
                            />

                            <input
                                type="password"
                                placeholder="Senha"
                                value={senha}
                                onChange={(e) => setSenha(e.target.value)}
                                required
                            />
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

