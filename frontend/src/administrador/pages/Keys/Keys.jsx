import React, { useEffect, useState, useRef } from "react";
import "./Keys.css";
import Navbar from "../../../components/navbar";
import BotaoSair from "../../../components/botaoSair/sair";
import api from "../../../services/api";

function Keys() {
  const [modalAberto, setModalAberto] = useState(false);
  const [nome_lab, setNome_lab] = useState("");
  const [desc_lab, setDesc_lab] = useState("");

  const [chaves, setChaves] = useState([]);

  const modalRef = useRef();

  const abrirModal = () => setModalAberto(true);
  const fecharModal = () => setModalAberto(false);

  const handleSalvar = (e) => {
    e.preventDefault();

    const token = localStorage.getItem("token");

    if (!token) {
      // alert('Você precisa estar logado para cadastrar chave!');
      toast.error("Você precisa estar logado para cadastrar uma chave!", {
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
    // const novoLab = { nome_lab, desc_lab };
    // setLabs([...labs, novoLab]);

    api
      .post(
        "/labs",
        {
          nome_lab,
          desc_lab,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )
      .then((response) => {
        console.log("Chave cadastrada:", response.data);
        // alert("Chave cadastrada com sucesso!");
        toast.success("Chave cadastrada com sucesso!", {
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
        setNome_lab("");
        setDesc_lab("");
      })
      .catch((error) => {
        console.error("Erro ao cadastrar:", error);
        // alert(error.response?.data?.error || "Erro ao cadastrar chave!");
        toast.error("Erro ao cadastrar chave!", {
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
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    api
      .get("/labs", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        setChaves(response.data);
      })
      .catch((error) => {
        console.error("Erro ao buscar chave:", error);
      });
  }, [chaves]);

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

  return (
    <div className="chaves-page">
      <div className="chaves-container">
        <header className="chaves-header">
          <h1>Chaves</h1>
        </header>

        <div className="chaves-acoes">
          <button onClick={abrirModal}>Adicionar Chave</button>
        </div>

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
            {chaves &&
              chaves.map((keys) => (
                <tr key={keys.id}>
                  <td>{keys.id}</td>
                  <td>{keys.nome_lab}</td>
                  <td>{keys.desc_lab}</td>
                  <td>
                    <button className="editar-btn">✏️</button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>

        {/* Modal */}
        {modalAberto && (
          <div className="modal-fundo">
            <div className="modal-conteudo" ref={modalRef}>
              <h2>Adicionar Laboratório</h2>
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
        {/* <BotaoSair /> */}
      </div>
      <footer className="footer">
        <p>© 2025 - Sistema de Monitoramento de Laboratórios</p>
      </footer>
    </div>
  );
}

export default Keys;
