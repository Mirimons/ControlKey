import React, { useState, useEffect, useRef } from "react";
import "./Reservation.css";
import Navbar from "../../../components/navbar";
import api from "../../../services/api";
import BotaoSair from "../../../components/botaoSair/sair";
import { toast } from "react-toastify";

//Select pesquisável
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

  //Encontra o label atual baseado no value
  const selectedOption = options.find((opt) => opt.value === value);

  useEffect(() => {
    if (selectedOption) {
      setInputValue(selectedOption.label);
    } else {
      setInputValue("");
    }
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
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="select-pesquisavel">
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
                onClick={() => handleSelect(option)} // Usar onMouseDown para evitar conflito com onBlur
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

  // Função para mapear reservas
  const mapearReserva = (reserva, index) => {
    console.log("Reserva original:", reserva); // Debug

    // Extrai nome do laboratório (pode ser objeto ou string)
    let nomeLaboratorio = "N/A";
    if (typeof reserva.laboratorio === "string") {
      nomeLaboratorio = reserva.laboratorio;
    } else if (reserva.laboratorio && reserva.laboratorio.nome_lab) {
      nomeLaboratorio = reserva.laboratorio.nome_lab;
    } else if (reserva.labs && reserva.labs.nome_lab) {
      nomeLaboratorio = reserva.labs.nome_lab;
    } else if (reserva.id_labs) {
      nomeLaboratorio = `Lab ${reserva.id_labs}`;
    }
    // Extrai nome do professor (pode ser objeto ou string)
    let nomeProfessor = "N/A";
    if (typeof reserva.nomeProfessor === "string") {
      nomeProfessor = reserva.nomeProfessor;
    } else if (reserva.usuario && reserva.usuario.nome) {
      nomeProfessor = reserva.usuario.nome;
    } else if (reserva.id_usuario) {
      nomeProfessor = `Usuário ${reserva.id_usuario}`;
    }

    const reservaMapeada = {
      id: reserva.id || `reserva-${index}`,
      nomeProfessor: nomeProfessor,
      laboratorio: nomeLaboratorio,
      dataUtilizacao: reserva.dataUtilizacao || reserva.data_utilizacao,
      horaInicio: reserva.horaInicio || reserva.hora_inicio,
      horaFim: reserva.horaFim || reserva.hora_fim,
      finalidade: reserva.finalidade || "N/A",
      status: reserva.status || "agendado",
    };
    console.log("Reserva mapeada:", reservaMapeada); // Debug
    return reservaMapeada;
  };

  const abrirModal = () => setModalAberto(true);
  const fecharModal = () => {
    setModalAberto(false);
    //Limpa campos ao fechar
    setNomeProfessor("");
    setLaboratorio("");
    setHoraInicio("");
    setHoraFim("");
    setDataUtilizacao("");
    setFinalidade("");
    setStatus("agendado");
  };

  const handleSalvar = (e) => {
    e.preventDefault();

    const token = localStorage.getItem("token");

    if (!token) {
      toast.error("Você precisa estar logado para reservar!", {
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

    api
      .post(
        "/agendamento",
        {
          id_usuario: nomeProfessor,
          id_labs: laboratorio,
          data_utilizacao: dataUtilizacao,
          hora_inicio: horaInicio,
          hora_fim: horaFim,
          status,
          finalidade,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )
      .then((response) => {
        console.log("Agendamento realizado:", response.data);
        toast.success("Agendamento realizado com sucesso!", {
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

        carregarReservas();
      })
      .catch((error) => {
        console.error("Erro ao agendar:", error);
        // alert(error.response?.data?.error || "Erro ao agendar!");
        toast.error("Erro ao agendar!", {
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

  const carregarReservas = () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    setLoading(true);

    api
      .get("/agendamento", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        console.log("Reservas carregadas: ", response.data);

        let reservasData = [];

        // CORREÇÃO: A API retorna {agendamentos: Array, paginacao: Object}
        if (response.data && Array.isArray(response.data.agendamentos)) {
          reservasData = response.data.agendamentos;
          console.log(`Encontrados ${reservasData.length} agendamentos`);
        } else if (Array.isArray(response.data)) {
          reservasData = response.data;
        } else if (response.data && Array.isArray(response.data.reservas)) {
          reservasData = response.data.reservas;
        } else if (response.data && Array.isArray(response.data.data)) {
          reservasData = response.data.data;
        } else if (response.data && typeof response.data === "object") {
          reservasData = [response.data];
        }
        const reservasMapeadas = reservasData.map((reserva, index) =>
          mapearReserva(reserva, index)
        );
        setReservas(reservasMapeadas);
      })
      .catch((error) => {
        console.error("Erro ao buscar reservas: ", error);
        setReservas([]);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  //Carrega os labs
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    api
      .get("/labs", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => {
        setChaves(response.data); // guarda os labs
      })
      .catch((error) => {
        console.error("Erro ao buscar chaves:", error);
      });
  }, []);

  //Carrega os usuarios/solicitantes
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    api
      .get("/usuario", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => {
        let usuariosData = [];

        if (Array.isArray(response.data)) {
          usuariosData = response.data;
          console.log("Usuários carregados (array direto):", usuariosData);
        } else if (response.data && Array.isArray(response.data.usuarios)) {
          usuariosData = response.data.usuarios;
          console.log(
            "Usuários carregados (propriedade usuarios):",
            usuariosData
          );
        } else if (response.data && Array.isArray(response.data.data)) {
          usuariosData = response.data.data;
          console.log("Usuários carregados (propriedade data):", usuariosData);
        } else if (response.data) {
          usuariosData = [response.data];
          console.log("Usuários carregados (objeto único):", usuariosData);
        }

        setSolicitantes(usuariosData);
      })
      .catch((error) => {
        console.error("Erro ao buscar usuários:", error);
      });
  }, []);

  //Carrega reservas inicialmente
  useEffect(() => {
    carregarReservas();
  }, []);

  //Event listeners para o modal
  useEffect(() => {
    function handleClickFora(event) {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        fecharModal();
      }
    }

    function handleEsc(event) {
      if (event.key === "Escape") {
        fecharModal();
      }
    }

    if (modalAberto) {
      document.addEventListener("mousedown", handleClickFora);
      document.addEventListener("keydown", handleEsc);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickFora);
      document.removeEventListener("keydown", handleEsc);
    };
  }, [modalAberto]);

  // Preparar opções para os selects pesquisáveis
  const opcoesSolicitantes = solicitantes.map((solicitante) => ({
    value: solicitante.id,
    label: solicitante.nome || solicitante.email || `Usuário ${solicitante.id}`,
  }));

  const opcoesLaboratorios = chaves.map((chave) => ({
    value: chave.id,
    label: chave.nome_lab || `Laboratório ${chave.id}`,
  }));

  //Filtro das reservas
  const reservasFiltradas = reservas.filter((reserva) => {
    return (
      (!filtroFinalidade ||
        reserva.finalidade
          ?.toLowerCase()
          .includes(filtroFinalidade.toLowerCase())) &&
      (!filtroSolicitante ||
        reserva.nomeProfessor
          ?.toLowerCase()
          .includes(filtroSolicitante.toLowerCase())) &&
      (!filtroAmbiente ||
        reserva.laboratorio
          ?.toLowerCase()
          .includes(filtroAmbiente.toLowerCase()))
    );
  });

  return (
    <div className="reservation-page">
      <div className="reservas-container">
        <header className="reservas-header">
          <h1>Reservas</h1>
        </header>

        <div className="reservas-acoes">
          <button type="button" onClick={abrirModal}>
            Reservar
          </button>
        </div>

        <div className="reservas-filtros">
          <div>
            <h3>Finalidade:</h3>
            <input
              type="text"
              placeholder="Finalidade"
              value={filtroFinalidade}
              onChange={(e) => setFiltroFinalidade(e.target.value)}
            />
          </div>
          <div>
            <h3>Solicitante:</h3>
            <input
              type="text"
              placeholder="Solicitante"
              value={filtroSolicitante}
              onChange={(e) => setFiltroSolicitante(e.target.value)}
            />
          </div>
          <div>
            <h3>Ambiente:</h3>
            <input
              type="text"
              placeholder="Ambiente"
              value={filtroAmbiente}
              onChange={(e) => setFiltroAmbiente(e.target.value)}
            />
          </div>
        </div>

        <table className="reservas-tabela">
          <thead>
            <tr>
              <th>Solicitante</th>
              <th>Ambiente</th>
              <th>Data Utilização</th>
              <th>Horário InÍcio</th>
              <th>Horário Fim</th>
              <th>Finalidade</th>
              <th>Status</th>
              <th>Editar</th>
            </tr>
          </thead>
          <tbody>
            {reservasFiltradas.length > 0 ? (
              reservasFiltradas.map((reserva) => (
                <tr key={reserva.id}>
                  <td>{reserva.nomeProfessor}</td>
                  <td>{reserva.laboratorio}</td>
                  <td>
                    {new Date(reserva.dataUtilizacao).toLocaleDateString(
                      "pt-BR"
                    )}
                  </td>
                  <td>{reserva.horaInicio}</td>
                  <td>{reserva.horaFim}</td>
                  <td>{reserva.finalidade}</td>
                  <td>
                    <span className={`status-${reserva.status?.toLowerCase()}`}>
                      {reserva.status}
                    </span>
                  </td>
                  <td>
                    <button className="editar-btn">✏️</button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan="8"
                  style={{ textAlign: "center", padding: "20px" }}
                >
                  {" "}
                  Nenhuma reserva encontrada
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Modal */}
        {modalAberto && (
          <div className="modal-fundo">
            <div className="modal-conteudo" ref={modalRef}>
              <form onSubmit={handleSalvar}>
                <h2>Fazer Reserva</h2>

                <label>Solicitante:</label>
                <SelectPesquisavel
                  options={opcoesSolicitantes}
                  value={nomeProfessor}
                  onChange={setNomeProfessor}
                  placeholder="Selecione o professor"
                  required={true}
                />

                <label>Ambiente:</label>
                <SelectPesquisavel
                  options={opcoesLaboratorios}
                  value={laboratorio}
                  onChange={setLaboratorio}
                  placeholder="Selecione o ambiente"
                  required={true}
                />

                <label>Data de Utilização</label>
                <input
                  type="date"
                  value={dataUtilizacao}
                  onChange={(e) => setDataUtilizacao(e.target.value)}
                  required
                  min={new Date().toISOString().split("T")[0]} //Não permite datas passadas
                />

                <label>Horário de ínicio</label>
                <input
                  type="time"
                  value={horaInicio}
                  onChange={(e) => setHoraInicio(e.target.value)}
                  required
                />

                <label>Horário de Fim</label>
                <input
                  type="time"
                  value={horaFim}
                  onChange={(e) => setHoraFim(e.target.value)}
                  required
                />

                <label>Finalidade:</label>
                <input
                  type="text"
                  placeholder="Finalidade da reserva"
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
                  <option value="finalizado">Finalizado</option>
                  <option value="cancelado">Cancelado</option>
                </select>

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

export default Reservation;
