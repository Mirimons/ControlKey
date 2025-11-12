import React, { useEffect, useState, useRef } from "react";
import { FaTrash } from "react-icons/fa";
import "./Keys.css";
import Navbar from "../../../components/navbar";
import api from "../../../services/api";
import { toast } from "react-toastify";
import { handleApiError } from "../../../helpers/errorHelper";
import Swal from "sweetalert2";

function Keys() {
  const [modalAberto, setModalAberto] = useState(false);
  const [nome_lab, setNome_lab] = useState("");
  const [desc_lab, setDesc_lab] = useState("");
  const [status, setStatus] = useState("livre");

  const [filtros, setFiltros] = useState({
    ambiente: "",
    descricao: "",
    status: "",
  });

  const [chaves, setChaves] = useState([]);
  const [editando, setEditando] = useState(false);
  const [chaveSelecionada, setChaveSelecionada] = useState(null);

  const [errosValidacao, setErrosValidacao] = useState({});

  const modalRef = useRef();

  const abrirModal = () => setModalAberto(true);
  const fecharModal = () => {
    setErrosValidacao({});
    setModalAberto(false);
  }

  const deleteLabs = async () => {
    const result = await Swal.fire({
      title: "Você tem certeza?",
      html: `Você não poderá reverter a exclusão da chave <strong>"${chaveSelecionada.nome_lab}"</strong>!`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc3545", // Vermelho
      cancelButtonColor: "#6c757d", // Cinza
      confirmButtonText: "Sim, Excluir!",
      cancelButtonText: "Cancelar"
    });

    if (!result.isConfirmed) {
      return;
    }

    try {
      const token = sessionStorage.getItem("token");
      if (!token) {
        toast.error("Você precisa estar logado para excluir uma chave!", {
          position: "top-right",
          autoClose: 2000,
          theme: "light",
        });
        return;
      }

      await api.delete(`/labs/${chaveSelecionada.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      toast.success("Chave excluída com sucesso!", {
        position: "top-right",
        autoClose: 2000,
        theme: "light",
      });

      fecharModal();
      fetchChaves(); // Atualiza a tabela
    } catch (error) {
      console.error("Erro ao excluir chave:", error);
      toast.error("Erro ao excluir chave!", {
        position: "top-right",
        autoClose: 2000,
        theme: "light",
      });
    }
  };

  const abrirModalNovo = () => {
    setEditando(false);
    setChaveSelecionada(null);
    setNome_lab("");
    setDesc_lab("");
    setStatus("livre");
    setErrosValidacao({});
    setModalAberto(true);
  };

  const abrirModalEditar = (chave) => {
    setEditando(true);
    setChaveSelecionada(chave);
    setNome_lab(chave.nome_lab);
    setDesc_lab(chave.desc_lab || "");
    setStatus(chave.status || "livre");
    setErrosValidacao({});
    setModalAberto(true);
  };

  //Mudanças nos filtros
  const handleFiltroChange = (e) => {
    const { name, value } = e.target;
    setFiltros((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  //Filtrar chaves:
  const chavesFiltradas = chaves.filter((chaves) => {
    return (
      (!filtros.ambiente ||
        chaves.nome_lab
          .toLowerCase()
          .includes(filtros.ambiente.toLowerCase())) &&
      (!filtros.descricao ||
        (chaves.desc_lab &&
          chaves.desc_lab
            .toLowerCase()
            .includes(filtros.descricao.toLowerCase()))) &&
      (!filtros.status ||
        chaves.status.toLowerCase() === filtros.status.toLowerCase())
    );
  });

  const fetchChaves = () => {
    const token = sessionStorage.getItem("token");
    if (!token) return;

    api
      .get("/labs", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        if (response.data && response.data.data) {
          setChaves(response.data.data);
        } else if (Array.isArray(response.data)) {
          setChaves(response.data);
        } else {
          setChaves([]);
        }
      })
      .catch((error) => {
        console.error("Erro ao buscar chaves:", error);
      });
  };

  const handleSalvar = (e) => {
    e.preventDefault();
    const token = sessionStorage.getItem("token");

    if (!token) {
      toast.error("Você precisa estar logado para cadastrar uma chave!", {
        position: "top-right",
        autoClose: 2000,
        theme: "light",
      });
      return;
    }

    const payload = { nome_lab, desc_lab, status };

    if (editando && chaveSelecionada) {
      // Edição de chave existente
      api
        .put(`/labs/${chaveSelecionada.id}`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((response) => {
          toast.success("Chave atualizada com sucesso!", {
            position: "top-right",
            autoClose: 2000,
            theme: "light",
          });

          // Atualiza a lista local
          setChaves((prev) =>
            prev.map((c) =>
              c.id === chaveSelecionada.id ? { ...c, ...response.data } : c
            )
          );

          fecharModal();
          fetchChaves();
        })
        .catch((error) => {
          console.error("Erro ao editar chave:", error);
          const validationErrors = handleApiError(error, "Erro ao editar chave!");
          if (validationErrors) {
            setErrosValidacao(validationErrors);
          }
          // toast.error("Erro ao editar chave!", {
          //   position: "top-right",
          //   autoClose: 2000,
          //   theme: "light",
          // });
        });
    } else {
      // Cadastro de nova chave
      api
        .post("/labs", payload, {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((response) => {
          toast.success("Chave cadastrada com sucesso!", {
            position: "top-right",
            autoClose: 2000,
            theme: "light",
          });
          fecharModal();
          setNome_lab("");
          setDesc_lab("");
          setStatus("livre");
          fetchChaves();
        })
        .catch((error) => {
          console.error("Erro ao cadastrar chave:", error);
          const validationErrors = handleApiError(error, "Erro ao cadastrar chave!");
          if (validationErrors) {
            setErrosValidacao(validationErrors);
          }
          // toast.error("Erro ao cadastrar chave!", {
          //   position: "top-right",
          //   autoClose: 2000,
          //   theme: "light",
          // });
        });
    }
  };

  useEffect(() => {
    fetchChaves();
  }, []);

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

    document.addEventListener("mousedown", handleClickFora);
    document.addEventListener("keydown", handleEsc);

    return () => {
      document.removeEventListener("mousedown", handleClickFora);
      document.removeEventListener("keydown", handleEsc);
    };
  }, [modalAberto]);

  return (
    <div className="chaves-page">
      <div className="chaves-container">
        <header className="chaves-header">
          <h1>Chaves</h1>
        </header>

        <div className="chaves-acoes">
          <button onClick={abrirModalNovo}>Adicionar Chave</button>
        </div>

        <div className="chaves-filtros">
          <div>
            <h3>Ambiente:</h3>
            <input
              type="text"
              placeholder="Ambiente"
              name="ambiente"
              value={filtros.ambiente}
              onChange={handleFiltroChange}
            />
          </div>
          <div>
            <h3>Descrição:</h3>
            <input
              type="text"
              placeholder="Descrição"
              name="descricao"
              value={filtros.descricao}
              onChange={handleFiltroChange}
            />
          </div>
          <div>
            <h3>Status:</h3>
            <select
              name="status"
              value={filtros.status}
              onChange={handleFiltroChange}>
              <option value="" disabled hidden>
                Selecione o status
              </option>
              <option value="">Todos</option>
              <option value="livre">Livre</option>
              <option value="ocupado">Ocupado</option>
            </select>
          </div>
        </div>

        <div className="tabela-container">
          <table className="chaves-tabela">
            <thead>
              <tr>
                <th>Código</th>
                <th>Ambiente</th>
                <th>Descrição</th>
                <th>Status</th>
                <th>Editar</th>
              </tr>
            </thead>
            <tbody>
              {chavesFiltradas.length > 0 ? (
                chavesFiltradas.map((chave) => (
                  <tr key={chave.id}>
                    <td>{chave.id}</td>
                    <td>{chave.nome_lab}</td>
                    <td>{chave.desc_lab}</td>
                    <td>
                      <span className={`status-${chave.status?.toLowerCase()}`}>
                        {chave.status}
                      </span>
                    </td>
                    <td>
                      <button
                        className="editar-btn"
                        onClick={() => abrirModalEditar(chave)}
                      >
                        ✏️
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" style={{ textAlign: "center" }}>
                    {chaves.length === 0 ? "Nenhuma chave cadastrada" : "Nenhuma chave encontrada para os filtros aplicados"}
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
              <h2>{editando ? "Editar Chave" : "Adicionar Chave"}</h2>
              <form onSubmit={handleSalvar}>

                <label>Nome:</label>
                <input
                  type="text"
                  placeholder="Nome do laboratório"
                  value={nome_lab}
                  onChange={(e) => setNome_lab(e.target.value)}
                  required
                  className={errosValidacao.nome_lab ? 'input-error' : ''}
                />
                {errosValidacao.nome_lab && (
                  <div className="erro-validacao">
                    {errosValidacao.nome_lab}
                  </div>
                )}

                <label>Descrição:</label>
                <input
                  type="text"
                  placeholder="Descrição"
                  value={desc_lab}
                  onChange={(e) => setDesc_lab(e.target.value)}
                  className={errosValidacao.desc_lab ? 'input-error' : ''}
                />
                {errosValidacao.desc_lab && (
                  <div className="erro-validacao">
                    {errosValidacao.desc_lab}
                  </div>
                )}

                <label>Status:</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  required
                  className={errosValidacao.status ? 'input-error' : ''}
                >
                  <option value="livre">Livre</option>
                  <option value="ocupado">Ocupado</option>
                </select>
                {errosValidacao.status && (
                  <div className="erro-validacao">
                    {errosValidacao.status}
                  </div>
                )}

                <div className="modal-botoes">
                  <button type="button" onClick={deleteLabs}>
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

export default Keys;
