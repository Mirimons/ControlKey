import React, { useState, useEffect } from "react";
import "./Relatorio.css";
import Navbar from "../../../components/navbar";
import api from "../../../services/api";

function Relatorio() {
  const [relatorios, setRelatorios] = useState([]);
  const [filtros, setFiltros] = useState({
    nomeUsuario: "",
    ambiente: "",
    equipamento: "",
    status: "",
    dataInicio: "",
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    carregarRelatorios();
  }, []);

  const carregarRelatorios = () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    setLoading(true);

    api
      .get("/agendamento", { headers: { Authorization: `Bearer ${token}` } })
      .then((response) => {
        const dados = response.data.agendamentos || response.data || [];
        const lista = Array.isArray(dados)
          ? dados.map((item, i) => ({
              id: item.id || i,
              solicitante: item.usuario?.nome || "N/A",
              ambiente: item.laboratorio?.nome_lab || "N/A",
              equipamento: item.equipamento?.nome || "N/A",
              data: item.data_utilizacao,
              horaInicio: item.hora_inicio,
              horaFim: item.hora_fim,
              finalidade: item.finalidade || "N/A",
              status: item.status || "N/A",
            }))
          : [];

        setRelatorios(lista);
      })
      .catch((err) => {
        console.error("Erro ao buscar relatórios:", err);
        setRelatorios([]);
      })
      .finally(() => setLoading(false));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFiltros({ ...filtros, [name]: value });
  };

  // Filtra os relatórios com base nos inputs
  const relatoriosFiltrados = relatorios.filter((r) => {
    return (
      (!filtros.nomeUsuario ||
        r.solicitante.toLowerCase().includes(filtros.nomeUsuario.toLowerCase())) &&
      (!filtros.ambiente ||
        r.ambiente.toLowerCase().includes(filtros.ambiente.toLowerCase())) &&
      (!filtros.equipamento ||
        r.equipamento.toLowerCase().includes(filtros.equipamento.toLowerCase())) &&
      (!filtros.status || r.status.toLowerCase() === filtros.status.toLowerCase()) &&
      (!filtros.dataInicio || (r.data && r.data.includes(filtros.dataInicio)))
    );
  });

  return (
    <div className="relatorio-page">
      <div className="relatorio-container">
        <header>
          <h1>Relatórios</h1>
        </header>

        <div className="filtros-container">
          <div className="campo">
            <label>Nome do Usuário:</label>
            <input
              type="text"
              name="nomeUsuario"
              value={filtros.nomeUsuario}
              onChange={handleChange}
              placeholder="Digite o nome"
            />
          </div>

          <div className="campo">
            <label>Ambiente:</label>
            <input
              type="text"
              name="ambiente"
              value={filtros.ambiente}
              onChange={handleChange}
              placeholder="Digite o ambiente"
            />
          </div>

          <div className="campo">
            <label>Equipamento:</label>
            <input
              type="text"
              name="equipamento"
              value={filtros.equipamento}
              onChange={handleChange}
              placeholder="Digite o equipamento"
            />
          </div>

          <div className="campo">
            <label>Status:</label>
            <select name="status" value={filtros.status} onChange={handleChange}>
              <option value="">Selecione</option>
              <option value="retirada">Retirada</option>
              <option value="devolvido">Devolvido</option>
              <option value="pendente">Pendente</option>
            </select>
          </div>

          <div className="campo">
            <label>Data de Início:</label>
            <input
              type="date"
              name="dataInicio"
              value={filtros.dataInicio}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="tabela-container">
          <table className="relatorio-tabela">
            <thead>
              <tr>
                <th>Nome do Usuário</th>
                <th>Ambiente</th>
                <th>Equipamento</th>
                <th>Status</th>
                <th>Data de Início</th>
                <th>Início</th>
                <th>Fim</th>
                <th>Finalidade</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="8" style={{ textAlign: "center" }}>
                    Carregando...
                  </td>
                </tr>
              ) : relatoriosFiltrados.length > 0 ? (
                relatoriosFiltrados.map((r) => (
                  <tr key={r.id}>
                    <td>{r.solicitante}</td>
                    <td>{r.ambiente}</td>
                    <td>{r.equipamento}</td>
                    <td>
                      <span className={`status-${r.status?.toLowerCase()}`}>
                        {r.status}
                      </span>
                    </td>
                    <td>{new Date(r.data).toLocaleDateString("pt-BR")}</td>
                    <td>{r.horaInicio}</td>
                    <td>{r.horaFim}</td>
                    <td>{r.finalidade}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" style={{ textAlign: "center" }}>
                    Nenhum relatório encontrado
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <footer className="footer">
        <p>© 2025 - Sistema de Monitoramento de Laboratórios</p>
      </footer>

      <Navbar />
    </div>
  );
}

export default Relatorio;
