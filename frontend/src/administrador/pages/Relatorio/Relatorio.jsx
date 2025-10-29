import React, { useState, useEffect } from "react";
import "./Relatorio.css";
import Navbar from "../../../components/navbar";
import api from "../../../services/api";

function Relatorio() {
  const [relatorios, setRelatorios] = useState([]);
  const [filtros, setFiltros] = useState({
    nomeUsuario: "",
    laboratorio: "",
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
    if (!token) {
      console.error("Token não encontrado");
      return;
    }
    setLoading(true);

    api
      .get("/control", { headers: { Authorization: `Bearer ${token}` } })
      .then((response) => {
        let dados = [];

        if (response.data && response.data.controls) {
          dados = response.data.controls;
        } else if (Array.isArray(response.data)) {
          dados = response.data;
        } else if (response.data && response.data.data) {
          dados = response.data.data;
        } else {
          console.error("Estrutura de dados não reconhecida:", response.data);
          dados = [];
        }

        const lista = Array.isArray(dados)
          ? dados.map((item, i) => ({
              id: item.id || i,
              usuario: item.usuario?.nome || "--",
              laboratorio: item.laboratorio?.nome_lab || "--",
              equipamento: item.equipamento?.desc_equip || "--",
              dataInicio: item.data_inicio || item.dataInicio,
              dataFim: item.data_fim || item.dataFim,
              status: item.status || "--",
              ciente: item.ciente ? "Sim" : "Não",
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

  // //Função para formatar data
  // const formatarData = (dataString) => {
  //   if(!dataString) return "--";
  //   try {
  //     const data = new Dtae(dataString)
  //     return data.toLocaleDateString("pt-BR")
  //   }catch(error) {
  //     return "Data inválida";
  //   }
  // }

  //Função para formatarhora
  const formatarHora = (dataString) => {
    if(!dataString) return "--";
    try {
      const data = new Date(dataString)
      return data.toLocaleTimeString("pt-BR", {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      });
    }catch(error) {
      return "Hora inválida";
    }
  }

  // Filtra os relatórios com base nos inputs
  const relatoriosFiltrados = relatorios.filter((r) => {
    return (
      (!filtros.nomeUsuario ||
        r.usuario.toLowerCase().includes(filtros.nomeUsuario.toLowerCase())) &&
      (!filtros.laboratorio ||
        r.laboratorio
          .toLowerCase()
          .includes(filtros.laboratorio.toLowerCase())) &&
      (!filtros.equipamento ||
        r.equipamento
          .toLowerCase()
          .includes(filtros.equipamento.toLowerCase())) &&
      (!filtros.status ||
        r.status.toLowerCase() === filtros.status.toLowerCase()) &&
      (!filtros.dataInicio || (r.dataInicio && r.dataInicio.includes(filtros.dataInicio)))
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
            <label>Laboratório:</label>
            <input
              type="text"
              name="laboratorio"
              value={filtros.laboratorio}
              onChange={handleChange}
              placeholder="Digite o laboratorio"
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
            <select
              name="status"
              value={filtros.status}
              onChange={handleChange}
            >
              <option value="">Todos</option>
              <option value="retirada">Aberto</option>
              <option value="devolvido">Fechado</option>
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
                <th>Usuário</th>
                <th>Laboratório</th>
                <th>Equipamento</th>
                <th>Data</th>
                <th>Hora Início</th>
                <th>Hora Fim</th>
                <th>Status</th>
                <th>Ciente</th>
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
                    <td>{r.usuario}</td>
                    <td>{r.laboratorio}</td>
                    <td>{r.equipamento}</td>
                    <td>
                      {r.dataInicio
                        ? new Date(r.dataInicio).toLocaleDateString("pt-BR")
                        : "--"}
                    </td>
                    <td>
                      {formatarHora(r.dataInicio)}
                    </td>
                    <td>
                      {formatarHora(r.dataFim)}
                    </td>
                    <td>
                      <span className={`status-${r.status?.toLowerCase()}`}>
                        {r.status}
                      </span>
                    </td>
                    <td>{r.ciente}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" style={{ textAlign: "center" }}>
                    {relatorios.length === 0
                      ? "Nenhum relatório encontrado"
                      : "Nenhum resultado para os filtros aplicados"}
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
