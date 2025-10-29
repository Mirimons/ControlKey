import React, { useState, useEffect, useRef } from "react";
import { FaEye, FaEyeSlash, FaSearch, FaTrash } from "react-icons/fa";
import "./User.css";
import Navbar from "../../../components/navbar";
import api from "../../../services/api";
import { toast } from "react-toastify";

function User() {
  const [modalAberto, setModalAberto] = useState(false);
  const [tipo, setTipo] = useState("");
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

  const [erros, setErros] = useState({});

  console.log(usuarios);

  const modalRef = useRef();

  const cadExtra = tipo === "Administrador" || tipo === "Comum";
  const cadExtraSenha = tipo === "Administrador";

  const abrirModal = () => setModalAberto(true);
  const fecharModal = () => setModalAberto(false);
  const deleteUsuario = async () => {
    const confirmar = window.confirm(
      `Tem certeza que deseja excluir o usuário "${usuarioSelecionado.nome}"?`
    );

    if (!confirmar) return;

    try {
      const token = sessionStorage.getItem("token");
      if (!token) {
        toast.error("Você precisa estar logado!", {
          position: "top-right",
          autoClose: 2000,
          hideProgressBar: false,
          closeOnClick: false,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "light",
        });
        return;
      }

      await api.delete(`/usuario/${usuarioSelecionado.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      toast.success("Usuário excluído com sucesso!", {
        position: "top-right",
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: false,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
      });

      // Atualiza a lista de usuários
      setUsuarios((prev) =>
        prev.filter((u) => u.id !== usuarioSelecionado.id)
      );

      fecharModal();
    } catch (err) {
      console.error("Erro ao excluir usuário:", err);
      toast.error("Erro ao excluir usuário!", {
        position: "top-right",
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: false,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
      });
    }
  };

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
    setTipo("");
    setSenha("");
    setModalAberto(true);
  };

  const abrirModalEditar = (user) => {
    setEditando(true);
    setUsuarioSelecionado(user);

    setTipo(user.tipo?.desc_tipo || "");
    setNome(user.nome);
    setCpf(user.cpf);
    setEmail(user.usuario_cad?.email || "");
    setTelefone(user.telefone);
    setMatricula(user.usuario_cad?.matricula || "");
    setData_nasc(user.data_nasc || "");
    setSenha("");
    setModalAberto(true);
  };

  const fetchUsuarios = () => {
    const token = sessionStorage.getItem("token");
    if (!token) return;

    const params = {};
    if (filtroNome) params.nome = filtroNome;
    if (filtroTipo) params.tipo_desc = filtroTipo;

    api
      .get("/usuario", {
        params,
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setUsuarios(res.data.data))
      .catch((err) => console.error("Erro ao buscar usuários:", err));
  };

  const aplicarFiltros = () => {
    fetchUsuarios();
  };

  const handleSalvar = (e) => {
    e.preventDefault();
    const token = sessionStorage.getItem("token");

    if (!token) {
      // alert("Você precisa estar logado!");
      toast.error("Você precisa estar logado!", {
        position: "top-right",
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: false,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
      });
      return;
    }
    
    let payload = {
      tipo: tipo,
      nome,
      cpf,
      data_nasc,
      telefone,
    };
    
    if (cadExtra) {
      payload.email = email;
      payload.matricula = matricula;
    }
    
    if (cadExtraSenha && senha) {
      payload.senha = senha;
    }
    
    if (editando && usuarioSelecionado) {
      api
      .put(`/usuario/${usuarioSelecionado.id}`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        // alert("Usuário atualizado com sucesso!");
        toast.success("Usuário atualizado com sucesso!", {
          position: "top-right",
          autoClose: 2000,
          hideProgressBar: false,
          closeOnClick: false,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "light",
        });
        
        setUsuarios((prev) =>
            prev.map((u) =>
              u.id === usuarioSelecionado.id
                ? { ...u, ...res.data } // se res.data não vier completo, use { ...u, ...payload }
                : u
              )
          );
          
          fetchUsuarios();
          fecharModal();
        })
        .catch((err) => {
          console.error("Erro ao editar:", err);
          // alert(err.response?.data?.error || "Erro ao editar usuário!");
          toast.error("Erro ao editar usuário!", {
            position: "top-right",
            autoClose: 2000,
            hideProgressBar: false,
            closeOnClick: false,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: "light",
          });
        });
      } else {
      api
      .post("/usuario", payload, {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((res) => {
          // alert("Usuário cadastrado com sucesso!");
          toast.success("Usuário cadastrado com sucesso!", {
            position: "top-right",
            autoClose: 2000,
            hideProgressBar: false,
            closeOnClick: false,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: "light",
          });
          fecharModal();
          // limpa os campos
          setNome("");
          setCpf("");
          setEmail("");
          setTelefone("");
          setMatricula("");
          setData_nasc("");
          setTipo("");
          setSenha("");
          fetchUsuarios();
        })
        .catch((err) => {
          console.error("Erro ao cadastrar:", err);
          // alert(err.response?.data?.error || "Erro ao cadastrar usuário!");
          toast.error("Erro ao cadastrar usuário!", {
            position: "top-right",
            autoClose: 2000,
            hideProgressBar: false,
            closeOnClick: false,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: "light",
          });
        });
    }
  };

  //Para fazer a busca inicial automática
  useEffect(() => {
    if (!modalAberto) return;

    const handleClickFora = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        fecharModal();
      }
    };

    const handleEsc = (event) => {
      if (event.key === "Escape") {
        fecharModal();
      }
    };

    // Adiciona os ouvintes
    document.addEventListener("mousedown", handleClickFora);
    document.addEventListener("keydown", handleEsc);

    // Remove os ouvintes ao desmontar
    return () => {
      document.removeEventListener("mousedown", handleClickFora);
      document.removeEventListener("keydown", handleEsc);
    };
  }, [modalAberto]);

  // Atualiza a lista automaticamente quando o nome ou tipo mudarem
  useEffect(() => {
    const token = sessionStorage.getItem("token");
    if (!token) return;

    // Só faz a busca se o componente já foi montado
    fetchUsuarios();
  }, [filtroNome, filtroTipo]);

  return (
    <div className="usuarios-page">
      <div className="usuarios-container">
        <header className="usuarios-header">
          <h1>Usuários</h1>
        </header>

        <div className="usuarios-acoes">
          <button type="button" onClick={abrirModalNovo}>
            Adicionar Usuário
          </button>
        </div>

        <div className="usuarios-filtros">
          <div>
            <h3>Nome completo</h3>
            <input
              type="text"
              placeholder="Nome completo"
              value={filtroNome}
              onChange={(e) => setFiltroNome(e.target.value)}
            />
          </div>
          <div>
            <h3>Selecione o tipo de usuário:</h3>
            <select
              //Conecta o filtro do tipo com a sua seleção no front para poder dar o get
              value={filtroTipo}
              onChange={(e) => setFiltroTipo(e.target.value)}
            >
              <option value="" disabled hidden>
                Selecione o tipo de usuário
              </option>
              <option value="">Todos</option>
              <option value="Administrador">Administrador</option>
              <option value="Comum">Comum</option>
              <option value="Terceiro">Terceiro</option>
            </select>
          </div>
          {/* <button onClick={aplicarFiltros} className="botao-pesquisa">
          <FaSearch /> Pesquisar
        </button> */}
        </div>

        <div className="tabela-container">
          <table className="usuarios-tabela">
            <thead>
              <tr>
                <th>Código</th>
                <th>Nome</th>
                <th>Tipo de usuário</th>
                <th>Telefone</th>
                <th>Editar</th>
              </tr>
            </thead>
            <tbody>
              {usuarios && usuarios.length > 0 ? (
                usuarios.map((user) => (
                  <tr key={user.id}>
                    <td>{user.id}</td>
                    <td>{user.nome}</td>
                    <td>{user.tipo?.desc_tipo || user.id_tipo}</td>
                    <td>{user.telefone}</td>
                    <td>
                      <button
                        className="editar-btn"
                        onClick={() => abrirModalEditar(user)}
                      >
                        ✏️
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" style={{ textAlign: "center" }}>
                    Nenhum usuário encontrado
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Modal */}
        {modalAberto && (
          <div className="modal-fundo">
            <div className="modal-conteudo" ref={modalRef}>
              <form onSubmit={handleSalvar}>
                <h2>{editando ? "Editar Usuário" : "Adicionar Usuário"}</h2>

                <label>Tipo de usuário:</label>
                <select
                  value={tipo}
                  onChange={(e) => setTipo(e.target.value)}
                  required
                >
                  <option value="" disabled hidden>
                    Selecione o tipo de usuário
                  </option>
                  <option value="Administrador">Administrador</option>
                  <option value="Comum">Comum</option>
                  <option value="Terceiro">Terceiro</option>
                </select>

                <label>Nome completo:</label>
                <input
                  type="text"
                  placeholder="Nome completo"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  required
                />

                <label>CPF:</label>
                <input
                  type="text"
                  placeholder="CPF"
                  value={cpf}
                  onChange={(e) => setCpf(e.target.value)}
                  required
                />

                <label>E-mail institucional:</label>
                <input
                  type="email"
                  placeholder="Email Institucional"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required={cadExtra}
                  disabled={tipo === "Terceiro"}
                />

                <label>Telefone (celular):</label>
                <input
                  type="tel"
                  placeholder="Telefone (celular)"
                  value={telefone}
                  onChange={(e) => setTelefone(e.target.value)}
                  required
                />

                <label>Matrícula:</label>
                <input
                  type="text"
                  placeholder="Matrícula"
                  value={matricula}
                  onChange={(e) => setMatricula(e.target.value)}
                  required={cadExtra}
                  disabled={tipo === "Terceiro"}
                />

                <label>Data de nascimento:</label>
                <input
                  type="date"
                  placeholder="Data de Nascimento"
                  value={data_nasc}
                  onChange={(e) => setData_nasc(e.target.value)}
                  required
                />

                <label>Senha:</label>
                <div className="senha-container">
                  <input
                    type={mostrarSenha ? "text" : "password"}
                    placeholder={
                      editando ? "Deixe em branco para manter a atual" : "Senha"
                    }
                    value={senha}
                    onChange={(e) => setSenha(e.target.value)}
                    autoComplete="new-password"
                    disabled={tipo !== "Administrador"}
                    required={!editando && tipo === "Administrador"}
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
                  <button type="button" onClick={deleteUsuario}>
                    <FaTrash />
                  </button>
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
      <footer className="footer">
        <p>© 2025 - Sistema de Monitoramento de Laboratórios</p>
      </footer>
    </div>
  );
}

export default User;
