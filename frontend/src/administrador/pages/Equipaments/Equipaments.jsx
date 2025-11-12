import React, { useState, useEffect, useRef } from "react";
import "./Equipaments.css";
import { FaTrash } from "react-icons/fa";
import Navbar from "../../../components/navbar";
import api from "../../../services/api";
import { toast } from "react-toastify";
import { handleApiError } from "../../../helpers/errorHelper";
import Swal from "sweetalert2";

function Equipaments() {
  const [modalAberto, setModalAberto] = useState(false);
  const [tipoEquip, setTipoEquip] = useState("");
  const [descEquip, setDescEquip] = useState("");
  const [status, setStatus] = useState("livre");
  const [equipamentos, setEquipamentos] = useState([]);

  const [filtros, setFiltros] = useState({
    equipamento: "",
    descricao: "",
    status: "",
  });

  // Controle de edição
  const [editando, setEditando] = useState(false);
  const [equipamentoId, setEquipamentoId] = useState(null);
  const [equipamentoDescricao, setEquipamentoDescricao] = useState("");

  const [errosValidacao, setErrosValidacao] = useState({});

  const modalRef = useRef();

  const abrirModal = () => {
    setErrosValidacao({});
    setModalAberto(true);
  }

  const fecharModal = () => {
    setModalAberto(false);
    setEditando(false);
    setEquipamentoId(null);
    setEquipamentoDescricao("");
    setTipoEquip("");
    setDescEquip("");
    setErrosValidacao({});
    setStatus("livre");
  };
  const deleteEquipamento = async () => {
    const result = await Swal.fire({
      title: "Você tem certeza?",
      html: `Você não poderá reverter a exclusão do equipamento <strong>"${equipamentoDescricao}"</strong>!`,
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
        toast.error("Você precisa estar logado!", {
          position: "top-right",
          autoClose: 2000,
          theme: "light",
        });
        return;
      }

      await api.delete(`/equipamento/${equipamentoId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      toast.success("Equipamento excluído com sucesso!", {
        position: "top-right",
        autoClose: 2000,
        theme: "light",
      });

      fecharModal();
      fetchEquipamentos(); // atualiza a lista
    } catch (error) {
      console.error("Erro ao excluir equipamento:", error);
      toast.error("Erro ao excluir equipamento!", {
        position: "top-right",
        autoClose: 2000,
        theme: "light",
      });
    }
  };
  const fetchEquipamentos = () => {
    const token = sessionStorage.getItem("token");
    if (!token) return;
    api
      .get("/equipamento", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        if (response.data && response.data.data) {
          setEquipamentos(response.data.data);
        } else if (Array.isArray(response.data)) {
          setEquipamentos(response.data);
        } else {
          setEquipamentos([]);
        }
      })
      .catch((error) => {
        console.error("Erro ao buscar equipamentos:", error);
        setEquipamentos([]);
      });
  };

  useEffect(() => {
    fetchEquipamentos();
  }, []);

  //Mudança nos filtros
  const handleFiltroChange = (e) => {
    const { name, value } = e.target;
    setFiltros((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  //Filtrar equipamentos
  const equipamentosFiltrados = equipamentos.filter((equip) => {
    const tipo = equip.tipo?.desc_tipo || "Sem tipo";
    const descricao = equip.desc_equip || "";

    return (
      (!filtros.equipamento ||
        tipo.toLowerCase().includes(filtros.equipamento.toLowerCase())) &&
      (!filtros.descricao ||
        descricao.toLowerCase().includes(filtros.descricao.toLowerCase())) &&
      (!filtros.status ||
        equip.status?.toLowerCase() === filtros.status.toLowerCase())
    );
  });

  // Salvar (criar ou atualizar)
  const handleSalvar = async (e) => {
    e.preventDefault();
    const token = sessionStorage.getItem("token");

    if (!token) {
      toast.error("Você precisa estar logado!", {
        position: "top-right",
        autoClose: 2000,
        theme: "light",
      });
      return;
    }

    // corpo da requisição corrigido
    const payload = editando
      ? {
        id: equipamentoId, // necessário pelo DTO de atualização
        desc_equip: descEquip,
        status: status,
      }
      : {
        tipo: tipoEquip,
        desc_equip: descEquip,
        status: status,
      };

    try {
      if (editando) {
        await api.put(`/equipamento/${equipamentoId}`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast.success("Equipamento atualizado com sucesso!", {
          position: "top-right",
          autoClose: 2000,
          theme: "light",
        });
      } else {
        await api.post("/equipamento", payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast.success("Equipamento cadastrado com sucesso!", {
          position: "top-right",
          autoClose: 2000,
          theme: "light",
        });
      }
      fecharModal();
      fetchEquipamentos();
    } catch (error) {
      console.error("Erro ao salvar equipamento:", error);

      const validationErrors = handleApiError(
        error,
        editando
          ? "Erro ao editar equipamento!"
          : "Erro ao cadastrar equipamento!"
      );

      if (validationErrors) {
        setErrosValidacao(validationErrors);
      }
    }
  };

  //  Editar equipamento
  const handleEditar = (equip) => {
    setEditando(true);
    setEquipamentoId(equip.id);
    setEquipamentoDescricao(equip.desc_equip || "");
    setTipoEquip(equip.tipo?.desc_tipo || "");
    setDescEquip(equip.desc_equip || "");
    setStatus(equip.status || "livre");
    abrirModal();
  };

  // Fecha modal ao clicar fora ou apertar ESC
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
    <div className="equipamentos-page">
      <div className="equipamentos-container">
        <header className="equipamentos-header">
          <h1>Equipamentos</h1>
        </header>

        <div className="equipamentos-acoes">
          <button type="button" onClick={abrirModal}>
            Adicionar Equipamento
          </button>
        </div>

        <div className="equipamentos-filtros">
          <div>
            <h3>Equipamento:</h3>
            <input
              type="text"
              placeholder="Equipamento"
              name="equipamento"
              value={filtros.equipamento}
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
              onChange={handleFiltroChange}
            >
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
          <table className="equipamentos-tabela">
            <thead>
              <tr>
                <th>Código</th>
                <th>Equipamento</th>
                <th>Descrição</th>
                <th>Status</th>
                <th>Editar</th>
              </tr>
            </thead>
            <tbody>
              {equipamentosFiltrados.length > 0 ? (
                equipamentosFiltrados.map((equip) => (
                  <tr key={equip.id}>
                    <td>{equip.id}</td>
                    <td>{equip.tipo?.desc_tipo || "Sem tipo"}</td>
                    <td>{equip.desc_equip}</td>
                    <td>
                      <span className={`status-${equip.status?.toLowerCase()}`}>
                        {equip.status || "livre"}
                      </span>
                    </td>
                    <td>
                      <button
                        className="editar-btn"
                        onClick={() => handleEditar(equip)}
                      >
                        ✏️
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" style={{ textAlign: "center" }}>
                    {equipamentos.length === 0
                      ? "Nenhum equipamento cadastrado"
                      : "Nenhum equipamento encontrado para os filtros aplicados"
                    }
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
                <h2>
                  {editando ? "Editar Equipamento" : "Adicionar Equipamento"}
                </h2>

                {!editando && (
                  <>
                    <label>Tipo de equipamento:</label>
                    <input
                      type="text"
                      placeholder="Digite o tipo do equipamento"
                      value={tipoEquip}
                      onChange={(e) => setTipoEquip(e.target.value)}
                      required
                      className={errosValidacao.tipo ? 'input-error' : ''} // 🚨 Corrigido: 'tipo'
                    />
                    {errosValidacao.tipo && ( // 🚨 Corrigido: 'tipo'
                      <div className="erro-validacao">
                        {errosValidacao.tipo}
                      </div>
                    )}
                  </>
                )}

                <label>Descrição:</label>
                <input
                  type="text"
                  placeholder="Descrição"
                  value={descEquip}
                  onChange={(e) => setDescEquip(e.target.value)}
                  required
                  className={errosValidacao.desc_equip ? 'input-error' : ''} // 🚨 Corrigido: 'desc_equip'
                />
                {errosValidacao.desc_equip && ( // 🚨 Corrigido: 'desc_equip'
                  <div className="erro-validacao">
                    {errosValidacao.desc_equip}
                  </div>
                )}

                <label>Status:</label>
                <select value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  required
                  className={errosValidacao.status ? 'input-error' : ''} // 🚨 Adicionado verificação de status (caso o BE valide)
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
                  <button type="button" onClick={deleteEquipamento}>
                    <FaTrash />
                  </button>
                  <button type="button" onClick={fecharModal}>
                    Cancelar
                  </button>
                  <button type="submit">
                    {editando ? "Atualizar" : "Salvar"}
                  </button>
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

export default Equipaments;
