import React, { Component, useEffect, useState, useRef } from "react";
import "./Home.css";
import Navbar from "../../../components/navbar";
import BotaoSair from "../../../components/botaoSair/sair";
import api from "../../../services/api.js";
import { FaBell } from "react-icons/fa";

// class Cards extends Component {
//   render() {
//     const { titulo, quantidade, cor } = this.props;
//     return (
//       <div className="card" style={{ backgroundColor: cor }}>
//         <div className="card-content">
//           <h3>{titulo}</h3>
//           <span>{quantidade}</span>
//         </div>
//       </div>
//     );
//   }
// }

const Cards = ({ titulo, quantidade, cor, atualizando = false }) => {
  
  return (
    <div
      className={`card ${atualizando ? "atualizando" : ""}`}
      style={{ backgroundColor: cor }}
    >
      <div className="card-content">
        <h3>{titulo}</h3>
        <span className={atualizando ? "pulsando" : ""}>{quantidade}</span>
        {atualizando && <div className="card-loading"></div>}
      </div>
    </div>
  );
};

const NotificacaoItem = ({ notificacao, index }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(true);
    }, index * 300);

    return () => clearTimeout(timer);
  }, [index]);

  if (notificacao.tipo === "atraso") {
    return (
      <div className={`notificacao-item ${visible ? "visible" : ""} atraso`}>
        <div className="notificacao-icon">⚠️</div>
        <div className="notificacao-content">
          <strong>Chave Atrasada</strong>
          <p>
            <strong>Laboratório:</strong> {notificacao.laboratorio}
          </p>
          <p>
            <strong>Equipamento:</strong> {notificacao.equipamento}
          </p>
          <p>
            <strong>Usuário:</strong> {notificacao.usuario}
          </p>
          <p>
            <strong>Desde:</strong>{" "}
            {new Date(notificacao.data_inicio).toLocaleString("pt-BR")}
          </p>
        </div>
      </div>
    );
  }

  if (notificacao.tipo === "reserva") {
    return (
      <div className={`notificacao-item ${visible ? "visible" : ""} reserva`}>
        <div className="notificacao-icon">📅</div>
        <div className="notificacao-content">
          <strong>Próxima Reserva</strong>
          <p>
            <strong>Laboratório:</strong> {notificacao.laboratorio}
          </p>
          <p>
            <strong>Usuário:</strong> {notificacao.usuario}
          </p>
          <p>
            <strong>Data:</strong>{" "}
            {new Date(notificacao.data_utilizacao).toLocaleDateString("pt-BR")}
          </p>
          <p>
            <strong>Horário:</strong> {notificacao.hora_inicio} -{" "}
            {notificacao.hora_fim}
          </p>
          <p>
            <strong>Finalidade:</strong> {notificacao.finalidade}
          </p>
        </div>
      </div>
    );
  }

  return null;
};

function Home() {
  const [stats, setStats] = useState({
    totalChaves: 0,
    chavesEmprestadas: 0,
    reservasAgendadas: 0,
    chavesAtrasadas: 0,
  });

  const [notificacoes, setNotificacoes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [atualizando, setAtualizando] = useState(false);

  // Guarda o estado anterior para comparar mudanças
  const statsAnteriorRef = useRef(stats);
  const notificacoesAnteriorRef = useRef([]);
  const timestampsAnteriorRef = useRef(null);

  const carregarDashboard = async () => {
    try {
      setLoading(true);
      const [statsResponse, detailsResponse, timestampsResponse] =
        await Promise.all([
          api.get("/dashboard/stats"),
          api.get("/dashboard/details"),
          api.get("/dashboard/timestamps"),
        ]);

      processarNovosDados(statsResponse.data, detailsResponse.data);
      timestampsAnteriorRef.current = timestampsResponse.data;
      setUltimaAtualizacao(new Date().toLocaleTimeString("pt-BR"));
    } catch (error) {
      console.error("Erro ao carregar dashboard:", error);
    } finally {
      setLoading(false);
    }
  };

  const verificaInteligente = async () => {
    try {
      // Primeiro verifica se há mudanças
      const timestampsResponse = await api.get("/dashboard/timestamps");
      const novosTimestamps = timestampsResponse.data;

      const timestampsMudaram =
        !timestampsAnteriorRef.current ||
        JSON.stringify(timestampsAnteriorRef.current) !==
          JSON.stringify(novosTimestamps);

      if (timestampsMudaram) {
        console.log("🔄 Mudanças detectadas! Atualizando dados...");
        setAtualizando(true);

        // 3. Só então busca os dados completos
        const [statsResponse, detailsResponse] = await Promise.all([
          api.get("/dashboard/stats"),
          api.get("/dashboard/details"),
        ]);
        processarNovosDados(statsResponse.data, detailsResponse.data);
        timestampsAnteriorRef.current = novosTimestamps;
        setUltimaAtualizacao(new Date().toLocaleTimeString("pt-BR"));

        // Animação de atualização
        setTimeout(() => setAtualizando(false), 800);
      } else {
        console.log("Nenhuma mudança detectada - mantendo dados atuais");
      }
    } catch (error) {
      console.error("Erro na verificação inteligente:", error);
      setAtualizando(false);
    }
  };

  // Processa e atualiza os dados
  const processarNovosDados = (novosStats, novosDetails) => {
    // Atualiza stats apenas se mudaram
    if (
      !statsAnteriorRef.current ||
      JSON.stringify(statsAnteriorRef.current) !== JSON.stringify(novosStats)
    ) {
      setStats(novosStats);
      statsAnteriorRef.current = novosStats;

      // Processa notificações
      const novasNotificacoes = [
        ...(novosDetails.controlsAtrasadas || []),
        ...(novosDetails.reservasProximas || []),
      ].sort((a, b) => b.timestamp - a.timestamp);
      // Atualiza notificações apenas se mudaram
      if (
        JSON.stringify(notificacoesAnteriorRef.current) !==
        JSON.stringify(novasNotificacoes)
      ) {
        setNotificacoes(novasNotificacoes);
        notificacoesAnteriorRef.current = novasNotificacoes;
      }
    }
  };

  useEffect(() => {
    carregarDashboard();

    const interval = setInterval(verificaInteligente, 20000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div
        style={{ display: "flex", paddingTop: "70px", paddingLeft: "200px" }}
      >
        <div
          className="container"
          style={{ marginLeft: "30px", padding: "20px", flexGrow: 1 }}
        >
          <h1>Página Inicial</h1>
          <div className="loading">Carregando dados...</div>
        </div>
        <BotaoSair />
      </div>
    );
  }

  return (
      <div
        style={{ display: "flex", paddingTop: "70px", paddingLeft: "200px" }}
      >
        {/* <navbar /> */}

        <div
          className="container"
          style={{ marginLeft: "30px", padding: "20px", flexGrow: 1 }}
        >
          <h1>Página Inicial</h1>

          <div className="cards-container">
            <Cards
              titulo="Total de Chaves Cadastradas"
              quantidade={stats.totalChaves}
              cor="#0A4174"
              atualizando={atualizando}
            />
            <Cards
              titulo="Chaves Emprestadas no Momento"
              quantidade={stats.chavesEmprestadas}
              cor="#49769F"
              atualizando={atualizando}
            />
            <Cards
              titulo="Reservas Agendadas"
              quantidade={stats.reservasAgendadas}
              cor="#4E8EA2"
              atualizando={atualizando}
            />
            <Cards
              titulo="Chaves Atrasadas"
              quantidade={stats.chavesAtrasadas}
              cor="#001D39"
              atualizando={atualizando}
            />
          </div>

          {atualizando && (
            <div className="atualizacao-indicator">⚡ Atualizando dados...</div>
          )}

          {/* Feed de Notificações Individual */}
          <div className="notificacoes-feed">
            <div className="notificacoes-header">
              <FaBell className="sininho"/>
              <h2>Notificações</h2>
              <span className="notificacoes-count">{notificacoes.length}</span>
            </div>

            <div className="notificacoes-lista">
              {notificacoes.length > 0 ? (
                notificacoes.map((notificacao, index) => (
                  <NotificacaoItem
                    key={`${notificacao.tipo}-${notificacao.id}-${notificacao.timestamp}`}
                    notificacao={notificacao}
                    index={index}
                  />
                ))
              ) : (
                <div className="sem-notificacoes">
                  <p>🎉 Nenhuma notificação no momento</p>
                  <p className="subtitulo">Tudo sob controle!</p>
                </div>
              )}
            </div>
          </div>
        </div>
        {/* <BotaoSair /> */}
      {/* <footer className="footer">
        <p>© 2025 - Sistema de Monitoramento de Laboratórios</p>
      </footer> */}
    </div>
  );
}

export default Home;
