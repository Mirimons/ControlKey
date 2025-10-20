import React, { useEffect, useState, useRef } from "react";
import "./Keys.css";
import Navbar from "../../../components/navbar";
import BotaoSair from "../../../components/botaoSair/sair";
import api from "../../../services/api";
import { toast } from "react-toastify";

function Keys() {
  const [modalAberto, setModalAberto] = useState(false);
  const [nome_lab, setNome_lab] = useState("");
  const [desc_lab, setDesc_lab] = useState("");

  const [chaves, setChaves] = useState([]);

  const [editando, setEditando] = useState(false);
  const [chaveSelecionada, setChaveSelecionada] = useState(null);

  const modalRef = useRef();

  const abrirModal = () => setModalAberto(true);
  const fecharModal = () => setModalAberto(false);

  const abrirModalNovo = () => {
    setEditando(false);
    setChaveSelecionada(null);
    setNome_lab("");
    setDesc_lab("");
    setModalAberto(true);
  };

  const abrirModalEditar = (chave) => {
    setEditando(true);
    setChaveSelecionada(chave);
    setNome_lab(chave.nome_lab);
    setDesc_lab(chave.desc_lab || "");
    setModalAberto(true);
  };

  const fetchChaves = () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    api
      .get("/labs", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => setChaves(response.data))
      .catch((error) => {
        console.error("Erro ao buscar chaves:", error);
      });
  };

  const handleSalvar = (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

    if (!token) {
      toast.error("Você precisa estar logado para cadastrar uma chave!", {
        position: "top-right",
        autoClose: 2000,
        theme: "light",
      });
      return;
    }

    const payload = { nome_lab, desc_lab };

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
          toast.error("Erro ao editar chave!", {
            position: "top-right",
            autoClose: 2000,
            theme: "light",
          });
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
          fetchChaves();
        })
        .catch((error) => {
          console.error("Erro ao cadastrar chave:", error);
          toast.error("Erro ao cadastrar chave!", {
            position: "top-right",
            autoClose: 2000,
            theme: "light",
          });
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
            {chaves.length > 0 ? (
              chaves.map((chave) => (
                <tr key={chave.id}>
                  <td>{chave.id}</td>
                  <td>{chave.nome_lab}</td>
                  <td>{chave.desc_lab}</td>
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
                  Nenhuma chave cadastrada
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Modal */}
        {modalAberto && (
          <div className="modal-fundo">
            <div className="modal-conteudo" ref={modalRef}>
              <h2>{editando ? "Editar Chave" : "Adicionar Chave"}</h2>
              <form onSubmit={handleSalvar}>
                <label>Chave do laboratório:</label>
                <input
                  type="text"
                  placeholder="Nome do laboratório"
                  value={nome_lab}
                  onChange={(e) => setNome_lab(e.target.value)}
                  required
                />
                <label>Descrição:</label>
                <input
                  type="text"
                  placeholder="Descrição (Opcional)"
                  value={desc_lab}
                  onChange={(e) => setDesc_lab(e.target.value)}
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

      <footer className="footer">
        <p>© 2025 - Sistema de Monitoramento de Laboratórios</p>
      </footer>
    </div>
  );
}

export default Keys;
