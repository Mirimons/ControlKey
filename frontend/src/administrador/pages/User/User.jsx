import React, { useState, useEffect, useRef } from 'react';
import { FaEye, FaEyeSlash, FaSearch } from "react-icons/fa";
import './User.css';
import Navbar from "../../../components/navbar";
import api from '../../../services/api';
import BotaoSair from "../../../components/botaoSair/sair";

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

    const [mostrarSenha, setMostrarSenha] = useState(false);

    const [filtroNome, setFiltroNome] = useState("");
    const [filtroTipo, setFiltroTipo] = useState("");

    const [usuarios, setUsuarios] = useState([]);

    const [editando, setEditando] = useState(false);
    const [usuarioSelecionado, setUsuarioSelecionado] = useState(null);

    console.log(usuarios)

    const modalRef = useRef();

    const abrirModal = () => setModalAberto(true);
    const fecharModal = () => setModalAberto(false);

    const abrirModalNovo = () => {
        setEditando(false);
        setUsuarioSelecionado(null);

        // limpa os campos
        setNome("");
        setCpf("");
        setEmail("");
        setTelefone("");
        setMatricula("");
        setData_nasc("");
        setId_tipo("");
        setSenha("");
        setModalAberto(true);

    }

    const abrirModalEditar = (user) => {
        setEditando(true);
        setUsuarioSelecionado(user);

        setId_tipo(user.id_tipo);
        setNome(user.nome);
        setCpf(user.cpf);
        setEmail(user.usuario_cad?.email || "");
        setTelefone(user.telefone);
        setMatricula(user.usuario_cad?.matricula || "");
        setData_nasc(user.data_nasc || "");
        setSenha("");
        setModalAberto(true);

    }

    const fetchUsuarios = () => {
        const token = localStorage.getItem("token");
        if (!token) return;

        api.get("/usuario", { headers: { Authorization: `Bearer ${token}` } })
            .then(res => setUsuarios(res.data))
            .catch(err => console.error("Erro ao buscar usuários:", err));
    };

    const handleSalvar = (e) => {
        e.preventDefault();
        const token = localStorage.getItem("token");

        if (!token) {
            alert("Você precisa estar logado!");
            return;
        }

        let payload = {
            id_tipo,
            nome,
            cpf,
            data_nasc,
            telefone,
        };

        if (id_tipo !== 3) {
            payload.email = email;
            payload.matricula = matricula;
        }

        if (id_tipo === 1 && senha) {
            payload.senha = senha;
        }

        if (editando && usuarioSelecionado) {
            api.put(`/usuario/${usuarioSelecionado.id}`, payload, {
                headers: { Authorization: `Bearer ${token}` },
            })
                .then((res) => {
                    alert("Usuário atualizado com sucesso!");

                    setUsuarios(prev => prev.map(u =>
                        u.id === usuarioSelecionado.id
                            ? { ...u, ...res.data }  // se res.data não vier completo, use { ...u, ...payload }
                            : u
                    ));
                    
                    fecharModal();
                })
                .catch((err) => {
                    console.error("Erro ao editar:", err);
                    alert(err.response?.data?.error || "Erro ao editar usuário!");
                });

        } else {
            api.post("/usuario", payload, {
                headers: { Authorization: `Bearer ${token}` },
            })
                .then((res) => {
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
                    fetchUsuarios();
                })
                .catch((err) => {
                    console.error("Erro ao cadastrar:", err);
                    alert(err.response?.data?.error || "Erro ao cadastrar usuário!");
                });
        }

    };


    // api.post("/usuario", {
    //     id_tipo,
    //     nome,
    //     cpf,
    //     data_nasc,
    //     telefone,
    //     matricula,
    //     email,
    //     senha
    // }, {
    //     headers: {
    //         'Authorization': `Bearer ${token}`
    //     }
    // })
    // .then(response => {
    //     console.log("Usuário cadastrado:", response.data);
    //     alert("Usuário cadastrado com sucesso!");
    //     fecharModal();

    // limpa os campos
    // setNome("");
    // setCpf("");
    // setEmail("");
    // setTelefone("");
    // setMatricula("");
    // setData_nasc("");
    // setId_tipo("");
    // setSenha("");

    //         })
    //         .catch(error => {
    //             console.error("Erro ao cadastrar:", error);
    //             alert(error.response?.data?.error || "Erro ao cadastrar usuário!");
    //         });
    // };

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) return;

        api.get("/usuario", {
            headers: {
                Authorization: `Bearer ${token}`
            }
        })
            .then(response => {
                setUsuarios(response.data);
            })
            .catch(error => {
                console.error("Erro ao buscar usuários:", error);
            });

    }, [])

    useEffect(() => {

        function handleClickFora(event) {
            if (modalRef.current && !modalRef.current.contains(event.target)) {
                fecharModal();
            }
        }

        function handleEsc(event) {
            if (event.key == 'Escape') {
                fecharModal();
            }
        }

        if (modalAberto) {
            document.addEventListener('mousedown', handleClickFora);
            document.addEventListener('keydown', handleEsc);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickFora);
            document.removeEventListener('keydown', handleEsc);
        };
    }, [modalAberto]);


    return (
        <div className="usuarios-container">
            <header className="usuarios-header">
                <h1>Usuários</h1>
            </header>

            <div className="usuarios-acoes">
                <button type="button" onClick={abrirModalNovo}>Adicionar Usuário</button>
            </div>


            <div className="usuarios-filtros">
                <div>
                    <h3>Nome completo</h3>
                    <input type="text"
                        placeholder="Nome completo"
                        value={filtroNome}
                        onChange={(e) => setFiltroNome(e.target.value)}
                    />
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
                    {usuarios && usuarios.map((user) => (
                        <tr key={user.id}>
                            <td>{user.id}</td>
                            <td>{user.nome}</td>
                            <td>{user.tipo?.nome || user.id_tipo}</td>
                            <td>{user.telefone}</td>
                            <button className="editar-btn" onClick={() => abrirModalEditar(user)}>✏️</button>
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* Modal */}
            {modalAberto && (
                <div className="modal-fundo">
                    <div className="modal-conteudo" ref={modalRef}>
                        <form onSubmit={handleSalvar}>
                            <h2>Adicionar Usuário</h2>

                            <select
                                value={id_tipo}
                                onChange={(e) => setId_tipo(Number(e.target.value))}
                                required
                            >
                                <option value="" disabled hidden>Selecione o tipo de usuário</option>
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
                                disabled={id_tipo === 3}
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
                                disabled={id_tipo === 3}
                            />

                            <input
                                type="date"
                                placeholder="Data de Nascimento"
                                value={data_nasc}
                                onChange={(e) => setData_nasc(e.target.value)}
                                required
                            />

                            <div className="senha-container">
                                <input
                                    type={mostrarSenha ? "text" : "password"}
                                    placeholder={editando ? "Deixe em branco para manter a atual" : "Senha"}
                                    value={senha}
                                    onChange={(e) => setSenha(e.target.value)}
                                    autoComplete="new-password"
                                    disabled={id_tipo === 2 || id_tipo === 3}
                                    required={!editando && id_tipo === 1}
                                />
                                <button
                                    type="button"
                                    className="toggle-senha"
                                    onClick={() => setMostrarSenha(!mostrarSenha)}
                                >
                                    {mostrarSenha ? <FaEyeSlash /> : <FaEye />}
                                </button>
                            </div>


                            <div className="modal-botoes">
                                <button type="button" onClick={fecharModal}>Cancelar</button>
                                <button type="submit">Salvar</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            <BotaoSair />
        </div>
    );
}

export default User;