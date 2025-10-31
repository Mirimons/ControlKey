import React, { useState, useEffect, useRef } from "react";
import { FaTrash } from "react-icons/fa";
import "./Reservation.css";
import Navbar from "../../../components/navbar";
import api from "../../../services/api";
import { toast } from "react-toastify";
import { SiRarible } from "react-icons/si";

// Select pesquisável
const SelectPesquisavel = ({
  options,
  value,
  onChange,
  placeholder,
  required,
}) => {
  const [inputValue, setInputValue] = useState("");
  const [mostrarOpcoes, setMostrarOpcoes] = useState(false);
  const containerRef = useRef(null);

  // Encontrar a opção selecionada usando comparação de strings
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

function Reservation() {
  const [modalAberto, setModalAberto] = useState(false);
  const [editando, setEditando] = useState(false);
  const [reservaSelecionada, setReservaSelecionada] = useState(null);

  const [nomeProfessor, setNomeProfessor] = useState("");
  const [laboratorio, setLaboratorio] = useState("");
  const [horaInicio, setHoraInicio] = useState("");
  const [horaFim, setHoraFim] = useState("");
  const [dataUtilizacao, setDataUtilizacao] = useState("");
  const [status, setStatus] = useState("agendado");
  const [finalidade, setFinalidade] = useState("");

  const [filtroFinalidade, setFiltroFinalidade] = useState("");
  const [filtroAmbiente, setFiltroAmbiente] = useState("");
  const [filtroSolicitante, setFiltroSolicitante] = useState("");

  const [chaves, setChaves] = useState([]);
  const [solicitantes, setSolicitantes] = useState([]);
  const [reservas, setReservas] = useState([]);
  const [loading, setLoading] = useState(false);

  const modalRef = useRef();

  const deleteAgendamento = async () => {
    if (!editando || !reservaSelecionada) {
      toast.error("Nenhum agendamento selecionado para exclusão!", {
        position: "top-right",
        autoClose: 2000,
        theme: "light",
      });
      return;
    }

    const confirmar = window.confirm(
      `Deseja realmente excluir a reserva de "${reservaSelecionada.nomeProfessor}" no ambiente "${reservaSelecionada.laboratorio}"?`
    );
    if (!confirmar) return;

    const token = sessionStorage.getItem("token");
    if (!token) {
      toast.error("Você precisa estar logado para excluir uma reserva!", {
        position: "top-right",
        autoClose: 2000,
        theme: "light",
      });
      return;
    }

    try {
      await api.delete(`/agendamento/${reservaSelecionada.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      toast.success("Reserva excluída com sucesso!", {
        position: "top-right",
        autoClose: 2000,
        theme: "light",
      });

      setModalAberto(false);
      carregarReservas(); // Atualiza a tabela
    } catch (error) {
      console.error("Erro ao excluir reserva:", error);
      toast.error("Erro ao excluir reserva!", {
        position: "top-right",
        autoClose: 2000,
        theme: "light",
      });
    }
  };
  const abrirModalNovo = () => {
    setEditando(false);
    setReservaSelecionada(null);
    setNomeProfessor("");
    setLaboratorio("");
    setHoraInicio("");
    setHoraFim("");
    setDataUtilizacao("");
    setFinalidade("");
    setStatus("agendado");
    setModalAberto(true);
  };

  const abrirModalEditar = (reserva) => {
    setEditando(true);
    setReservaSelecionada(reserva);

    setNomeProfessor(
      String(reserva.id_usuario || reserva.nomeProfessorId || "")
    );
    setLaboratorio(
      String(reserva.id_labs || reserva.laboratorioId || ""));
    setHoraInicio(reserva.horaInicio || reserva.hora_inicio || "");
    setHoraFim(reserva.horaFim || reserva.hora_fim || "");
    setDataUtilizacao(reserva.dataUtilizacao || reserva.data_utilizacao || "");
    setFinalidade(reserva.finalidade || "");
    setStatus(reserva.status || "agendado");

    setModalAberto(true);
  };

  const carregarReservas = () => {
    const token = sessionStorage.getItem("token");
    if (!token) return;
    setLoading(true);

    api
      .get("/agendamento", { headers: { Authorization: `Bearer ${token}` } })
      .then((response) => {
        let reservasData = [];
        if (response.data && Array.isArray(response.data.agendamentos))
          reservasData = response.data.agendamentos;
        else if (Array.isArray(response.data)) reservasData = response.data;
        else if (response.data && Array.isArray(response.data.reservas))
          reservasData = response.data.reservas;
        else if (response.data && Array.isArray(response.data.data))
          reservasData = response.data.data;
        else if (response.data && typeof response.data === "object")
          reservasData = [response.data];

        const reservasMapeadas = reservasData.map((reserva, index) => {
          let nomeLab = "N/A";
          if (typeof reserva.laboratorio === "string")
            nomeLab = reserva.laboratorio;
          else if (reserva.labs?.nome_lab) nomeLab = reserva.labs.nome_lab;
          else if (reserva.laboratorio.nome_lab) nomeLab = reserva.laboratorio.nome_lab;
          else if (reserva.id_labs) nomeLab = `Lab ${reserva.id_labs}`;

          let nomeProf = "N/A";
          if (typeof reserva.nomeProfessor === "string")
            nomeProf = reserva.nomeProfessor;
          else if (reserva.usuario?.nome) nomeProf = reserva.usuario.nome;
          else if (reserva.id_usuario)
            nomeProf = `Usuário ${reserva.id_usuario}`;

          return {
            id: reserva.id || `reserva-${index}`,
            nomeProfessor: nomeProf,
            laboratorio: nomeLab,
            dataUtilizacao: reserva.dataUtilizacao || reserva.data_utilizacao,
            horaInicio: reserva.horaInicio || reserva.hora_inicio,
            horaFim: reserva.horaFim || reserva.hora_fim,
            finalidade: reserva.finalidade || "--",
            status: reserva.status || "agendado",
            id_usuario: reserva.id_usuario,
            id_labs: reserva.id_labs,
          };
        });

        setReservas(reservasMapeadas);
      })
      .catch((err) => {
        console.error("Erro ao buscar reservas:", err);
        setReservas([]);
      })
      .finally(() => setLoading(false));
  };

  const carregarChaves = () => {
    const token = sessionStorage.getItem("token");
    if (!token) return;
    api
      .get("/labs", { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => {
        let data = [];
        if (Array.isArray(res.data)) data = res.data;
        else if (res.data && Array.isArray(res.data.data)) data = res.data.data;
        else if (res.data && Array.isArray(res.data.labs))
          data = res.data.labs;
        else if (res.data) data = [res.data];
        setChaves(data);
      })
      .catch((err) => console.error("Erro ao buscar chaves:", err));
  };

  const carregarSolicitantes = () => {
    const token = sessionStorage.getItem("token");
    if (!token) return;
    api
      .get("/usuario", { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => {
        let data = [];
        if (Array.isArray(res.data)) data = res.data;
        else if (res.data && Array.isArray(res.data.data)) data = res.data.data;
        else if (res.data && Array.isArray(res.data.usuarios))
          data = res.data.usuarios;
        else if (res.data) data = [res.data];
        setSolicitantes(data);
      })
      .catch((err) => console.error("Erro ao buscar usuários:", err));
  };

  useEffect(() => {
    carregarReservas();
    carregarChaves();
    carregarSolicitantes();
  }, []);

  const handleSalvar = (e) => {
    e.preventDefault();
    const token = sessionStorage.getItem("token");
    if (!token) {
      toast.error("Você precisa estar logado para reservar!");
      return;
    }

    const payload = {
      id_usuario: nomeProfessor,
      id_labs: laboratorio,
      data_utilizacao: dataUtilizacao,
      hora_inicio: horaInicio,
      hora_fim: horaFim,
      finalidade,
      status,
    };

    if (editando && reservaSelecionada) {
      api
        .put(`/agendamento/${reservaSelecionada.id}`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then(() => {
          toast.success("Reserva atualizada com sucesso!");
          setModalAberto(false);
          carregarReservas();
        })
        .catch((err) => {
          console.error(err);
          toast.error("Erro ao atualizar reserva!");
        });
    } else {
      api
        .post("/agendamento", payload, {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then(() => {
          toast.success("Reserva criada com sucesso!");
          setModalAberto(false);
          carregarReservas();
        })
        .catch((err) => {
          console.error(err);
          toast.error("Erro ao criar reserva!");
        });
    }
  };

  const opcoesSolicitantes = solicitantes.map((s) => ({
    value: s.id,
    label: s.nome || s.email || `Usuário ${s.id}`,
  }));
  const opcoesLaboratorios = Array.isArray(chaves)
    ? chaves.map((c) => ({ value: c.id, label: c.nome_lab || `Labs ${c.id}` }))
    : [];

  const reservasFiltradas = reservas.filter(
    (r) =>
      (!filtroFinalidade ||
        r.finalidade.toLowerCase().includes(filtroFinalidade.toLowerCase())) &&
      (!filtroSolicitante ||
        r.nomeProfessor
          .toLowerCase()
          .includes(filtroSolicitante.toLowerCase())) &&
      (!filtroAmbiente ||
        r.laboratorio.toLowerCase().includes(filtroAmbiente.toLowerCase()))
  );

  useEffect(() => {
    const handleClickFora = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target))
        setModalAberto(false);
    };
    const handleEsc = (event) => {
      if (event.key === "Escape") setModalAberto(false);
    };
    if (modalAberto) {
      document.addEventListener("mousedown", handleClickFora);
      document.addEventListener("keydown", handleEsc);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickFora);
      document.removeEventListener("keydown", handleEsc);
    };
  }, [modalAberto]);

  return (
    <div className="reservation-page">
      <div className="reservas-container">
        <header>
          <h1>Reservas</h1>
        </header>
        <div className="reservas-acoes">
          <button onClick={abrirModalNovo}>Reservar</button>
        </div>

        <div className="reservas-filtros">
          <div>
            <div>
              <h3>Solicitante:</h3>
              <input
                placeholder="Solicitante"
                value={filtroSolicitante}
                onChange={(e) => setFiltroSolicitante(e.target.value)}
              />
            </div>
          </div>
          <div>
            <h3>Ambiente:</h3>
            <input
              placeholder="Ambiente"
              value={filtroAmbiente}
              onChange={(e) => setFiltroAmbiente(e.target.value)}
            />
          </div>
        </div>

        <div className="tabela-container">
          <table className="reservas-tabela">
            <thead>
              <tr>
                <th>Solicitante</th>
                <th>Ambiente</th>
                <th>Data</th>
                <th>Início</th>
                <th>Fim</th>
                <th>Finalidade</th>
                <th>Status</th>
                <th>Editar</th>
              </tr>
            </thead>
            <tbody>
              {reservasFiltradas.length > 0 ? (
                reservasFiltradas.map((r) => (
                  <tr key={r.id}>
                    <td>{r.nomeProfessor}</td>
                    <td>{r.laboratorio}</td>
                    <td>
                      {new Date(r.dataUtilizacao).toLocaleDateString("pt-BR")}
                    </td>
                    <td>{r.horaInicio}</td>
                    <td>{r.horaFim}</td>
                    <td>{r.finalidade}</td>
                    <td>
                      <span className={`status-${r.status?.toLowerCase()}`}>
                        {r.status}
                      </span>
                    </td>
                    <td>
                      <button
                        className="editar-btn"
                        onClick={() => abrirModalEditar(r)}
                      >
                        ✏️
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" style={{ textAlign: "center" }}>
                    Nenhuma reserva encontrada
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {modalAberto && (
          <div className="modal-fundo">
            <div className="modal-conteudo" ref={modalRef}>
              <form onSubmit={handleSalvar}>
                <h2>{editando ? "Editar Reserva" : "Nova Reserva"}</h2>

                <label>Solicitante:</label>
                <SelectPesquisavel
                  options={opcoesSolicitantes}
                  value={nomeProfessor}
                  onChange={setNomeProfessor}
                  placeholder="Selecione o solicitante"
                  required
                />

                <label>Ambiente:</label>
                <SelectPesquisavel
                  options={opcoesLaboratorios}
                  value={laboratorio}
                  onChange={setLaboratorio}
                  placeholder="Selecione o laboratório"
                  required
                />

                <label>Data de utilização:</label>
                <input
                  type="date"
                  value={dataUtilizacao}
                  onChange={(e) => setDataUtilizacao(e.target.value)}
                  required
                  min={new Date().toISOString().split("T")[0]}
                />

                <label>Horário início:</label>
                <input
                  type="time"
                  value={horaInicio}
                  onChange={(e) => setHoraInicio(e.target.value)}
                  required
                />

                <label>Horário fim:</label>
                <input
                  type="time"
                  value={horaFim}
                  onChange={(e) => setHoraFim(e.target.value)}
                  required
                />

                <label>Finalidade:</label>
                <input
                  type="text"
                  value={finalidade}
                  onChange={(e) => setFinalidade(e.target.value)}
                  required
                />

                <label>Status:</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  required
                >
                  <option value="agendado">Agendado</option>
                  <option value="concluído">Concluído</option>
                  <option value="cancelado">Cancelado</option>
                </select>

                <div className="modal-botoes">
                  <button type="button" onClick={deleteAgendamento}>
                    <FaTrash />
                  </button>
                  <button type="button" onClick={() => setModalAberto(false)}>
                    Cancelar
                  </button>
                  <button type="submit">
                    {editando ? "Salvar alterações" : "Criar reserva"}
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
      <Navbar />
    </div>
  );
}

export default Reservation;
