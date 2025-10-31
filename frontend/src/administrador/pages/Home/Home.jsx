import React, { Component, useEffect, useState, useRef } from "react";
import "./Home.css";
import Navbar from "../../../components/navbar";
import api from "../../../services/api.js";
import { FaBell } from "react-icons/fa";

const Cards = ({ titulo, quantidade, cor }) => {
  return (
    <div className="card" style={{ backgroundColor: cor }}>
      <div className="card-content">
        <h3>{titulo}</h3>
        <span>{quantidade}</span>
      </div>
    </div>
  );
};

const Notificacoes = ({ notificacao, index }) => {
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
        <div className="notificacao-content">
          <strong>⚠️ Chave não devolvida ontem</strong>
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
            <strong>Data:</strong>{" "}
            {new Date(notificacao.data_inicio).toLocaleDateString("pt-BR")}
          </p>
        </div>
      </div>
    );
  }

  if (notificacao.tipo === "reserva") {
    return (
      <div className={`notificacao-item ${visible ? "visible" : ""} reserva`}>
        <div className="notificacao-content">
          <strong>📅 Reserva para hoje</strong>
          <p>
            <strong>Ambiente:</strong> {notificacao.laboratorio}
          </p>
          <p>
            <strong>Usuário:</strong> {notificacao.usuario}
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
  const [ultimaAtualizacao, setUltimaAtualizacao] = useState("");

  //Ordenar as notificações por proximidade
  const ordenarNotificacoes = (notificacoes) => {
    return notificacoes.sort((a, b) => {
      //Reservas: hora de inicio (mais próxima primeiro)
      if (a.tipo === "reserva" && b.tipo === "reserva") {

        //Combina data + hora para criar o timestamp completo
        const timestampA = new Date(`${a.data_utilizacao}T${a.hora_inicio}`)
        const timestampB = new Date(`${b.data_utilizacao}T${b.hora_inicio}`)

        return timestampA - timestampB ;
      }

      //Atrasos: mantem ordem original
      if (a.tipo === "atraso" && b.tipo === "atraso") {
        return new Date(b.data_inicio) - new Date(a.data_inicio);
      }

      //Reservas aparece antes de atrasos
      if (a.tipo === "reserva" && b.tipo === "atraso") return -1;
      if (a.tipo === "atraso" && b.tipo === "reserva") return 1;

      return 0;
    });
  };

  const carregarDashboard = async () => {
    try {
      setLoading(true);
      const [statsResponse, detailsResponse] = await Promise.all([
        api.get("/dashboard/stats"),
        api.get("/dashboard/details"),
      ]);

      //Atualiza os cards
      setStats(statsResponse.data);

      //Atualiza as notificações
      const todasNotificacoes = [
        ...(detailsResponse.data.controlsAtrasadas || []).map(item => ({
          ...item,
          tipo: "atraso"
        })),
        ...(detailsResponse.data.reservasProximas || []).map(item => ({
          ...item,
          tipo: "reserva"
        })),
      ];

      const notificacoesOrdenadas = ordenarNotificacoes(todasNotificacoes)

      setNotificacoes(notificacoesOrdenadas);
      setUltimaAtualizacao(new Date().toLocaleTimeString("pt-BR"));

      console.log("Dashboard atualizado:", {
        stats: statsResponse.data,
        notificacoes: todasNotificacoes.length,
      });
    } catch (error) {
      console.error("Erro ao carregar dashboard:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarDashboard();

    const interval = setInterval(carregarDashboard, 30000);
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
      </div>
    );
  }

  return (
    <div style={{ display: "flex", paddingTop: "70px", paddingLeft: "200px" }}>
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
          />
          <Cards
            titulo="Chaves Emprestadas no Momento"
            quantidade={stats.chavesEmprestadas}
            cor="#49769F"
          />
          <Cards
            titulo="Reservas Agendadas"
            quantidade={stats.reservasAgendadas}
            cor="#4E8EA2"
          />
          <Cards
            titulo="Chaves Atrasadas"
            quantidade={stats.chavesAtrasadas}
            cor="#001D39"
          />
        </div>

        {/* Feed de Notificações Individual */}
        <div className="notificacoes-feed">
          <div className="notificacoes-header">
            <FaBell className="sininho" />
            <h2>Notificações</h2>
            <span className="notificacoes-count">{notificacoes.length}</span>
          </div>

          <div className="notificacoes-lista">
            {notificacoes.length > 0 ? (
              notificacoes.map((notificacao, index) => (
                <Notificacoes
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
      {/* <footer className="footer">
        <p>© 2025 - Sistema de Monitoramento de Laboratórios</p>
      </footer> */}
    </div>
  );
}

export default Home;
