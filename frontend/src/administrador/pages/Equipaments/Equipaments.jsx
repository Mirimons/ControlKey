import React, { useState, useEffect, useRef } from "react";
import "./Equipaments.css";
import Navbar from "../../../components/navbar";
import api from "../../../services/api";
import { toast } from "react-toastify";

function Equipaments() {
  const [modalAberto, setModalAberto] = useState(false);
  const [tipoEquip, setTipoEquip] = useState("");
  const [descEquip, setDescEquip] = useState("");
  const [equipamentos, setEquipamentos] = useState([]);

  // 👇 controle de edição
  const [editando, setEditando] = useState(false);
  const [equipamentoId, setEquipamentoId] = useState(null);

  const modalRef = useRef();

  const abrirModal = () => setModalAberto(true);
  const fecharModal = () => {
    setModalAberto(false);
    setEditando(false);
    setEquipamentoId(null);
    setTipoEquip("");
    setDescEquip("");
  };

  // 🔄 Buscar equipamentos
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
          setEquipamentos(response.data.data)
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

  // 💾 Salvar (criar ou atualizar)
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
    const data = editando
      ? {
        id: equipamentoId, // necessário pelo DTO de atualização
        desc_equip: descEquip,
      }
      : {
        tipo: tipoEquip,
        desc_equip: descEquip,
      };

    try {
      if (editando) {
        await api.put(`/equipamento/${equipamentoId}`, data, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast.success("Equipamento atualizado com sucesso!", {
          position: "top-right",
          autoClose: 2000,
          theme: "light",
        });
      } else {
        await api.post("/equipamento", data, {
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
      toast.error(
        editando
          ? "Erro ao atualizar equipamento!"
          : "Erro ao cadastrar equipamento!",
        {
          position: "top-right",
          autoClose: 2000,
          theme: "light",
        }
      );
    }
  };

  // ✏️ Editar equipamento
  const handleEditar = (equip) => {
    setEditando(true);
    setEquipamentoId(equip.id);
    setTipoEquip(equip.tipo?.desc_tipo || "");
    setDescEquip(equip.desc_equip || "");
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
            <input type="text" placeholder="Equipamento" />
          </div>
          <div>
            <h3>Descrição:</h3>
            <input type="text" placeholder="Descrição" />
          </div>
        </div>

        <div className="tabela-container">
          <table className="equipamentos-tabela">
            <thead>
              <tr>
                <th>Código</th>
                <th>Equipamento</th>
                <th>Descrição</th>
                <th>Editar</th>
              </tr>
            </thead>
            <tbody>
              {equipamentos.length > 0 ? (
                equipamentos.map((equip) => (
                  <tr key={equip.id}>
                    <td>{equip.id}</td>
                    <td>{equip.tipo?.desc_tipo || "Sem tipo"}</td>
                    <td>{equip.desc_equip}</td>
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
                  <td colSpan="4" style={{ textAlign: "center" }}>
                    Nenhum equipamento cadastrado
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
                    <label>Tipo equipamento:</label>
                    <input
                      type="text"
                      placeholder="Digite o tipo do equipamento"
                      value={tipoEquip}
                      onChange={(e) => setTipoEquip(e.target.value)}
                      required
                    />
                  </>
                )}

                <label>Descrição:</label>
                <input
                  type="text"
                  placeholder="Descrição"
                  value={descEquip}
                  onChange={(e) => setDescEquip(e.target.value)}
                />

                <div className="modal-botoes">
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
