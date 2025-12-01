import React, { useState, useEffect, useRef } from "react";
import { FaEye, FaEyeSlash, FaSearch, FaTrash, FaCheck } from "react-icons/fa";
import "./User.css";
import Navbar from "../../../components/navbar";
import api from "../../../services/api";
import { toast } from "react-toastify";
import { handleApiError } from "../../../helpers/errorHelper";
import { redirect } from "react-router-dom";
import Swal from "sweetalert2";

const SelectPesquisavel = ({
  options,
  value,
  onChange,
  placeholder,
  required,
  className,
}) => {
  const [inputValue, setInputValue] = useState("");


  const [mostrarOpcoes, setMostrarOpcoes] = useState(false);
  const containerRef = useRef(null);

  const selectedOption = options.find(
    (opt) => String(opt.value) === String(value)
  );

  useEffect(() => {
    if (selectedOption) setInputValue(selectedOption.label);
    else setInputValue("");
  }, [selectedOption]);

  const opcoesFiltradas = options.filter((option) =>
    option.label.toLowerCase().includes(inputValue.toLowerCase())
  );

  const handleSelect = (option) => {
    onChange(option.value);
    setInputValue(option.label);
    setMostrarOpcoes(false);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target)
      ) {
        setMostrarOpcoes(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="select-pesquisavel" ref={containerRef}>
      <input
        type="text"
        value={inputValue}
        onChange={(e) => {
          setInputValue(e.target.value);
          setMostrarOpcoes(true);
        }}
        onFocus={() => setMostrarOpcoes(true)}
        placeholder={placeholder}
        required={required}
        className={className}
      />
      {mostrarOpcoes && (
        <div className="opcoes-lista">
          {opcoesFiltradas.length > 0 ? (
            opcoesFiltradas.map((option) => (
              <div
                key={option.value}
                className="opcao"
                onClick={() => handleSelect(option)}
              >
                {option.label}
              </div>
            ))
          ) : (
            <div className="opcao opcao-vazia">Nenhuma opção encontrada</div>
          )}
        </div>
      )}
    </div>
  );
};

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

  const [tipoUsuario, setTipoUsuario] = useState([]);

  const fetchTipoUsuario = () => {
    const token = sessionStorage.getItem("token");
    if (!token) return;
  

  api
    .get("/tipo_usuario", {
      headers: { Authorization: `Bearer ${token}` },
    })
    .then((res) => {
      const lista = res.data?.data || res.data?.tipos || res.data ||[];

    if (Array.isArray(lista)) {
      setTipoUsuario(lista);
    } else {
      console.warn("Resposta inesperada do backend /tipo_usuario", res.data);
      setTipoUsuario([]);
    }
    })
    .catch((err) => {
      handleApiError(err, "Erro ao buscar tipos de usuário.", err);
    });
  };

  const opcoesTipoUsuario = tipoUsuario.map((tipo) => ({
    value: tipo.desc_tipo,
    label: tipo.desc_tipo,
  }));
  const [mostrarSenha, setMostrarSenha] = useState(false);

  const [filtroNome, setFiltroNome] = useState("");
  const [filtroTipo, setFiltroTipo] = useState("");

  const [usuarios, setUsuarios] = useState([]);

  const [editando, setEditando] = useState(false);
  const [usuarioSelecionado, setUsuarioSelecionado] = useState(null);

  const [erros, setErros] = useState({});

  const modalRef = useRef();

  const cadExtra = tipo === "Administrador" || tipo === "Comum";
  const cadExtraSenha = tipo === "Administrador";

  //Função para aplicar máscara no CPF
  const mascaraCPF = (valor) => {
    const apenasNumeros = valor.replace(/\D/g, "");

    //Aplicar máscara: 000.000.000-00
    if (apenasNumeros.length <= 3) {
      return apenasNumeros;
    } else if (apenasNumeros.length <= 6) {
      return `${apenasNumeros.slice(0, 3)}.${apenasNumeros.slice(3)}`;
    } else if (apenasNumeros.length <= 9) {
      return `${apenasNumeros.slice(0, 3)}.${apenasNumeros.slice(
        3,
        6
      )}.${apenasNumeros.slice(6)}`;
    } else {
      return `${apenasNumeros.slice(0, 3)}.${apenasNumeros.slice(
        3,
        6
      )}.${apenasNumeros.slice(6, 9)}-${apenasNumeros.slice(9, 11)}`;
    }
  };

  //Função para aplicar máscara no Telefone
  const mascaraTelefone = (valor) => {
    const apenasNumeros = valor.replace(/\D/g, "");

    //Aplicar máscara: (00) 00000-0000
    if (apenasNumeros.length <= 2) {
      return `${apenasNumeros}`;
    } else if (apenasNumeros.length <= 6) {
      return `(${apenasNumeros.slice(0, 2)}) ${apenasNumeros.slice(2)}`;
    } else if (apenasNumeros.length <= 10) {
      return `(${apenasNumeros.slice(0, 2)}) ${apenasNumeros.slice(
        2,
        6
      )}-${apenasNumeros.slice(6)}`;
    } else {
      return `(${apenasNumeros.slice(0, 2)}) ${apenasNumeros.slice(
        2,
        7
      )}-${apenasNumeros.slice(7, 11)}`;
    }
  };

  //Função para validar matrícula (apenas números, máx 6)
  const validarRM = (valor) => {
    const apenasNumeros = valor.replace(/\D/g, "");

    //Limite de 6 dígitos
    return apenasNumeros.slice(0, 6);
  };

  //Handle para campos com máscara
  const handleCpfChange = (e) => {
    const valorComMascara = mascaraCPF(e.target.value);
    setCpf(valorComMascara);
  };

  const handleTelefoneChange = (e) => {
    const valorComMascara = mascaraTelefone(e.target.value);
    setTelefone(valorComMascara);
  };

  const handleMatriculaChange = (e) => {
    const valorValidado = validarRM(e.target.value);
    setMatricula(valorValidado);
  };

  //Função para validar o formulário antes de enviar
  const validarFormulario = () => {
    const novosErros = {};

    //Matrícula
    if (cadExtra && matricula) {
      if (matricula.length !== 6) {
        novosErros.matricula = "A matrícula deve ter exatamente 6 dígitos";
      }
    }

    //CPF
    if (cpf && cpf.length !== 14) {
      novosErros.cpf = "CPF deve ter 11 dígitos";
    }

    //Telefone
    if (telefone && telefone.length < 15) {
      novosErros.telefone = "Telefone deve ter pelo menos 10 dígitos com DDD";
    }

    setErros(novosErros);
    return Object.keys(novosErros).length === 0;
  };

  const abrirModal = () => setModalAberto(true);
  const fecharModal = () => {
    setErros({});
    setModalAberto(false);
  };

  const deleteUsuario = async () => {
    const result = await Swal.fire({
      title: "Você tem certeza?",
      html: `Você não poderá reverter a exclusão do usuário <strong>"${usuarioSelecionado.nome}"</strong>!`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc3545", // Vermelho
      cancelButtonColor: "#6c757d", // Cinza
      confirmButtonText: "Sim, Excluir!",
      cancelButtonText: "Cancelar",
    });

    if (!result.isConfirmed) {
      return;
    }

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
      setUsuarios((prev) => prev.filter((u) => u.id !== usuarioSelecionado.id));

      fecharModal();
    } catch (err) {
      handleApiError(err, "Erro ao excluir usuário!");
      // console.error("Erro ao excluir usuário:", err);
      // toast.error("Erro ao excluir usuário!", {
      //   position: "top-right",
      //   autoClose: 2000,
      //   hideProgressBar: false,
      //   closeOnClick: false,
      //   pauseOnHover: true,
      //   draggable: true,
      //   progress: undefined,
      //   theme: "light",
      // });
    }
  };

  const reativarUsuario = async (e) => {
    // Versão flexível: aceita tanto um evento de checkbox (e.target)
    // quanto uma chamada direta com o usuário (passando o objeto user).
    let user = usuarioSelecionado;
    let fromCheckbox = false;

    if (e && e.target) {
      const checked = e.target.checked;
      if (!checked) return;
      fromCheckbox = true;
    } else if (e) {
      user = e;
    }

    // certifica-se que temos um usuário alvo
    if (!user) return;

    setUsuarioSelecionado(user);

    const result = await Swal.fire({
      title: "Você tem certeza?",
      html: `Deseja reativar o usuário <strong>"${user.nome}"</strong>?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#28a745",
      cancelButtonColor: "#6c757d",
      confirmButtonText: "Sim, Reativar!",
      cancelButtonText: "Cancelar",
    });

    if (!result.isConfirmed) {
      if (fromCheckbox && e && e.target) e.target.checked = false;
      return;
    }

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
        if (fromCheckbox && e && e.target) e.target.checked = false;
        return;
      }

      await api.patch(`/usuario/${user.id}/reativar`, null, {
        headers: { Authorization: `Bearer ${token}` },
      });

      toast.success("Usuário reativado com sucesso!", {
        position: "top-right",
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: false,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
      });

      // Remove da lista de inativos (ela agora volta a ativos)
      setUsuarios((prev) => prev.filter((u) => u.id !== user.id));

      fecharModal();
    } catch (err) {
      if (fromCheckbox && e && e.target) e.target.checked = false;
      handleApiError(err, "Erro ao reativar usuário!");
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
    setErros({});
    setModalAberto(true);
  };

  const abrirModalEditar = (user) => {
    setEditando(true);
    setUsuarioSelecionado(user);

    setTipo(user.tipo?.desc_tipo || "");
    setNome(user.nome);

    if (user.cpf) {
      setCpf(mascaraCPF(user.cpf));
    } else {
      setCpf("");
    }

    setEmail(user.usuario_cad?.email || "");

    if (user.telefone) {
      setTelefone(mascaraTelefone(user.telefone));
    } else {
      setTelefone("")
    }

    setMatricula(user.usuario_cad?.matricula || "");
    setData_nasc(user.data_nasc || "");
    setErros({});
    setSenha("");
    setModalAberto(true);
  };

  const fetchUsuarios = () => {
    const token = sessionStorage.getItem("token");
    if (!token) return;
    // Caso o filtro seja 'Desabilitado', chamamos a rota que retorna
    // apenas usuários inativos e aplicamos o filtro de nome no cliente
    // para manter o mesmo comportamento dos outros filtros.
    if (filtroTipo === "Desabilitado") {
      api
        .get("/usuario/inativos/listar", {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((res) => {
          let data = res.data.data || [];
          if (filtroNome) {
            const nomeLower = filtroNome.toLowerCase();
            data = data.filter((u) =>
              u.nome ? u.nome.toLowerCase().includes(nomeLower) : false
            );
          }
          setUsuarios(data);
        })
        .catch((err) => {
          handleApiError(err, "Erro ao buscar usuários desabilitados.");
        });
      return;
    }

    const params = {};
    if (filtroNome) params.nome = filtroNome;
    if (filtroTipo) params.tipo_desc = filtroTipo;

    api
      .get("/usuario", {
        params,
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setUsuarios(res.data.data))
      .catch((err) => {
        handleApiError(err, "Erro ao buscar usuário.");
      });
    // .catch((err) => console.error("Erro ao buscar usuários:", err));
  };

  const aplicarFiltros = () => {
    fetchUsuarios();
  };

  const handleSalvar = (e) => {
    e.preventDefault();
    setErros({});

    //Valida formulário antes de enviar
    if (!validarFormulario()) {
      return;
    }

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

    //Remove as máscaras antes de enviar para a API
    const cpfSemMascara = cpf.replace(/\D/g, '');

    let payload = {
      tipo: tipo,
      nome,
      cpf: cpfSemMascara,
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
          const validationErrors = handleApiError(
            err,
            "Erro ao editar usuário!"
          );
          if (validationErrors) {
            setErros(validationErrors);
          }
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
          const validationErrors = handleApiError(
            err,
            "Erro ao cadastrar usuário!"
          );
          if (validationErrors) {
            setErros(validationErrors);
          }
        });
    }
  };

  //Para fazer a busca inicial automática
  useEffect(() => {
    fetchTipoUsuario();
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

        <div className="usuarios-filtros">
          <div>
            <h3>Nome completo:</h3>
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
              <option value="Desabilitado">Desativados</option>
            </select>
          </div>
          <button className="btn-add" type="button" onClick={abrirModalNovo}>
            Adicionar Usuário
          </button>
        </div>

        <div className="tabela-container">
          <table className="usuarios-tabela">
                <thead>
              <tr>
                <th>Código</th>
                <th>Nome</th>
                <th>Tipo de usuário</th>
                <th>Telefone</th>
                {filtroTipo !== "Desabilitado" ? (
                  <th>Editar</th>
                ) : null}
                {filtroTipo === "Desabilitado" ? (
                  <th>Ativar</th>
                ) : null}
              </tr>
            </thead>
            <tbody>
              {usuarios && usuarios.length > 0 ? (
                usuarios.map((user) => (
                  <tr key={user.id}>
                    <td>{user.id}</td>
                    <td>{user.nome}</td>
                    <td>{user.tipo?.desc_tipo || user.id_tipo}</td>
                    <td>{user.telefone ? mascaraTelefone(user.telefone) : ''}</td>
                    {filtroTipo !== "Desabilitado" ? (
                      <td>
                        <button
                          className="editar-btn"
                          onClick={() => abrirModalEditar(user)}
                        >
                          ✏️
                        </button>
                      </td>
                    ) : null}
                    {filtroTipo === "Desabilitado" ? (
                      <td>
                        <button
                          className="editar-btn"
                          onClick={() => reativarUsuario(user)}
                          title="Reativar usuário"
                        >
                          <FaCheck />
                        </button>
                      </td>
                    ) : null}
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

                <div className="form-group-campo">
                  <label>Tipo de usuário:</label>
                  <SelectPesquisavel
                    options={opcoesTipoUsuario}
                    placegolder="Selecione o tipo de usuário"
                    value={tipo}
                    onChange={(valor) => {
                      setTipo(valor); // aqui `valor` vira o ID do tipo
                    }}
                    required
                    className={erros.tipo ? "input-error" : ""}
                  />
                  {erros.tipo && (
                    <div className="erro-validacao">{erros.tipo}</div>
                  )}
                </div>

                <div className="form-group-campo">
                  <label>Nome completo:</label>
                  <input
                    type="text"
                    placeholder="Nome completo"
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    required
                    className={erros.nome ? "input-error" : ""}
                  />
                  {erros.nome && (
                    <div className="erro-validacao">{erros.nome}</div>
                  )}
                </div>

                <div className="form-group-campo">
                  <label>CPF:</label>
                  <input
                    type="text"
                    placeholder="000.000.000-00"
                    value={cpf}
                    onChange={handleCpfChange}
                    required
                    maxLength={14}
                    className={erros.cpf ? "input-error" : ""}
                  />
                  {erros.cpf && (
                    <div className="erro-validacao">{erros.cpf}</div>
                  )}
                </div>

                <div className="form-group-campo">
                  <label>E-mail institucional:</label>
                  <input
                    type="email"
                    placeholder="Email Institucional"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required={cadExtra}
                    disabled={tipo === "Terceiro"}
                    className={erros.email ? "input-error" : ""}
                  />
                  {erros.email && (
                    <div className="erro-validacao">{erros.email}</div>
                  )}
                </div>

                <div className="form-group-campo">
                  <label>Telefone (celular):</label>
                  <input
                    type="tel"
                    placeholder="(00) 00000-0000"
                    value={telefone}
                    onChange={handleTelefoneChange}
                    required
                    maxLength={15}
                    className={erros.telefone ? "input-error" : ""}
                  />
                  {erros.telefone && (
                    <div className="erro-validacao">{erros.telefone}</div>
                  )}
                </div>

                <div className="form-group-campo">
                  <label>Matrícula:</label>
                  <input
                    type="text"
                    placeholder="Matrícula"
                    value={matricula}
                    onChange={handleMatriculaChange}
                    required={cadExtra}
                    disabled={tipo === "Terceiro"}
                    maxLength={6}
                    className={erros.matricula ? "input-error" : ""}
                  />
                  {erros.matricula && (
                    <div className="erro-validacao">{erros.matricula}</div>
                  )}
                </div>

                <div className="form-group-campo">
                  <label>Data de nascimento:</label>
                  <input
                    type="date"
                    placeholder="Data de Nascimento"
                    value={data_nasc}
                    onChange={(e) => setData_nasc(e.target.value)}
                    required
                    className={erros.data_nasc ? "input-error" : ""}
                  />
                  {erros.data_nasc && (
                    <div className="erro-validacao">{erros.data_nasc}</div>
                  )}
                </div>

                <div className="form-group-campo">
                  <label>Senha:</label>
                  <div className="senha-container">
                    <input
                      type={mostrarSenha ? "text" : "password"}
                      placeholder={
                        editando
                          ? "Deixe em branco para manter a atual"
                          : "Senha"
                      }
                      value={senha}
                      onChange={(e) => setSenha(e.target.value)}
                      autoComplete="new-password"
                      disabled={tipo !== "Administrador"}
                      required={!editando && tipo === "Administrador"}
                      className={erros.senha ? "input-error" : ""}
                    />
                    {erros.senha && (
                      <div className="erro-validacao">{erros.senha}</div>
                    )}
                  </div>

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
