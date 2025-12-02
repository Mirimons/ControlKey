import React, { useState, useEffect, useRef } from "react";
import { FaTrash } from "react-icons/fa";
import "./Reservation.css";
import Navbar from "../../../components/navbar";
import api from "../../../services/api";
import { toast } from "react-toastify";
import { SiRarible } from "react-icons/si";
import Swal from "sweetalert2";
import { handleApiError } from "../../../helpers/errorHelper";

// Select pesquisável (Não alterado)
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
  const [loading, setLoading] = useState(false); // Estado de carregamento
  const [errosValidacao, setErrosValidacao] = useState({});

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

    const result = await Swal.fire({
      title: "Tem certeza?",
      text: `Deseja realmente excluir a reserva de "${reservaSelecionada.nomeProfessor}" no ambiente "${reservaSelecionada.laboratorio}"?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Sim, excluir!",
      cancelButtonText: "Cancelar",
    });

    if (!result.isConfirmed) return;

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

  const formatarData = (dataString) => {
    if (!dataString) return "N/A"

    const [ano, mes, dia] = dataString.split('-')
    return `${dia}/${mes}/${ano}`
  }

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
    setErrosValidacao({});
    setModalAberto(true);
  };

  const abrirModalEditar = (reserva) => {
    setEditando(true);
    setReservaSelecionada(reserva);

    setNomeProfessor(String(reserva.id_usuario || ""));
    setLaboratorio(String(reserva.id_labs || ""));

    setHoraInicio(reserva.horaInicio || reserva.hora_inicio || "");
    setHoraFim(reserva.horaFim || reserva.hora_fim || "");
    setDataUtilizacao(reserva.dataUtilizacao || reserva.data_utilizacao || "");
    setFinalidade(reserva.finalidade || "");
    setStatus(reserva.status || "agendado");
    setErrosValidacao({});

    setModalAberto(true);
  };

  const carregarReservas = () => {
    const token = sessionStorage.getItem("token");
    if (!token) return;
    setLoading(true); // Inicia o carregamento

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
          else if (reserva.laboratorio?.nome_lab)
            nomeLab = reserva.laboratorio.nome_lab;
          else if (reserva.id_labs) {
            const labEncontrado = chaves.find(
              (c) => String(c.id) === String(reserva.id_labs)
            );
            nomeLab = labEncontrado
              ? labEncontrado.nome_lab
              : `Lab ${reserva.id_labs}`;
          }

          let nomeProf = "N/A";
          if (typeof reserva.nomeProfessor === "string")
            nomeProf = reserva.nomeProfessor;
          else if (reserva.usuario?.nome) nomeProf = reserva.usuario.nome;
          else if (reserva.id_usuario) {
            const solicitanteEncontrado = solicitantes.find(
              (s) => String(s.id) === String(reserva.id_usuario)
            );
            nomeProf = solicitanteEncontrado
              ? solicitanteEncontrado.nome
              : `Usuário ${reserva.id_usuario}`;
          }

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
        toast.error("Erro ao carregar lista de reservas!"); // Feedback de erro
        setReservas([]);
      })
      .finally(() => setLoading(false)); // Finaliza o carregamento
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
        else if (res.data && Array.isArray(res.data.labs)) data = res.data.labs;
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
    // Chama todas as funções para carregar dados iniciais
    carregarChaves();
    carregarSolicitantes();
    carregarReservas();
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

    // Limpa erros antes de tentar salvar
    setErrosValidacao({});

    if (editando && reservaSelecionada) {
      api
        .put(`/agendamento/${reservaSelecionada.id}`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then(() => {
          toast.success("Reserva atualizada com sucesso!");
          setModalAberto(false);
          carregarReservas(); // Chama a recarga para ver a atualização
        })
        .catch((err) => {
          console.error("Erro ao atualizar reserva:", err);
          const validationErrors = handleApiError(
            err,
            "Erro ao atualizar reserva!"
          );
          if (validationErrors) {
            setErrosValidacao(validationErrors);
          }
        });
    } else {
      api
        .post("/agendamento", payload, {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then(() => {
          toast.success("Reserva criada com sucesso!");
          setModalAberto(false);
          carregarReservas(); // Chama a recarga para ver a nova reserva
        })
        .catch((err) => {
          console.error("Erro ao realizar uma reserva:", err);
          const validationErrors = handleApiError(
            err,
            "Erro ao criar reserva!"
          );
          if (validationErrors) {
            setErrosValidacao(validationErrors);
          }
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
          <button className="btn-add" type="button" onClick={abrirModalNovo}>
            Reservar
          </button>
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
              {loading ? ( // 👈 NOVO: Mostrar loading
                <tr>
                  <td colSpan="8" style={{ textAlign: "center" }}>
                    Carregando reservas...
                  </td>
                </tr>
              ) : reservasFiltradas.length > 0 ? (
                reservasFiltradas.map((r) => (
                  <tr key={r.id}>
                    <td>{r.nomeProfessor}</td>
                    <td>{r.laboratorio}</td>
                    <td>{formatarData(r.dataUtilizacao)}</td>
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
                  className={errosValidacao.id_usuario ? "input-error" : ""}
                />
                {errosValidacao.id_usuario && (
                  <div className="erro-validacao">
                    {errosValidacao.id_usuario}
                  </div>
                )}

                <label>Ambiente:</label>
                <SelectPesquisavel
                  options={opcoesLaboratorios}
                  value={laboratorio}
                  onChange={setLaboratorio}
                  placeholder="Selecione o laboratório"
                  required
                  className={errosValidacao.id_labs ? "input-error" : ""}
                />
                {errosValidacao.id_labs && (
                  <div className="erro-validacao">{errosValidacao.id_labs}</div>
                )}

                <label>Data de utilização:</label>
                <input
                  type="date"
                  value={dataUtilizacao}
                  onChange={(e) => setDataUtilizacao(e.target.value)}
                  required
                  min={new Date().toISOString().split("T")[0]}
                  className={
                    errosValidacao.data_utilizacao ? "input-error" : ""
                  }
                />
                {errosValidacao.data_utilizacao && (
                  <div className="erro-validacao">
                    {errosValidacao.data_utilizacao}
                  </div>
                )}

                <label>Horário início:</label>
                <input
                  type="time"
                  value={horaInicio}
                  onChange={(e) => setHoraInicio(e.target.value)}
                  required
                  className={errosValidacao.hora_inicio ? "input-error" : ""}
                />
                {errosValidacao.hora_inicio && (
                  <div className="erro-validacao">
                    {errosValidacao.hora_inicio}
                  </div>
                )}

                <label>Horário fim:</label>
                <input
                  type="time"
                  value={horaFim}
                  onChange={(e) => setHoraFim(e.target.value)}
                  required
                  className={errosValidacao.hora_fim ? "input-error" : ""}
                />
                {errosValidacao.hora_fim && (
                  <div className="erro-validacao">
                    {errosValidacao.hora_fim}
                  </div>
                )}

                <label>Finalidade:</label>
                <input
                  type="text"
                  value={finalidade}
                  onChange={(e) => setFinalidade(e.target.value)}
                  required
                  className={errosValidacao.finalidade ? "input-error" : ""}
                />
                {errosValidacao.finalidade && (
                  <div className="erro-validacao">
                    {errosValidacao.finalidade}
                  </div>
                )}

                <label>Status:</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  required
                  className={errosValidacao.status ? "input-error" : ""}
                >
                  <option value="agendado">Agendado</option>
                  <option value="finalizado">Finalizado</option>
                  <option value="cancelado">Cancelado</option>
                </select>
                {errosValidacao.status && (
                  <div className="erro-validacao">{errosValidacao.status}</div>
                )}

                <div className="modal-botoes">
                  {editando && reservaSelecionada && (
                    <button type="button" onClick={deleteAgendamento}>
                      <FaTrash />
                    </button>
                  )}
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
