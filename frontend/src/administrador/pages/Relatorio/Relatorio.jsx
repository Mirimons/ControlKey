import React, { useState, useEffect } from "react";
import "./Relatorio.css";
import Navbar from "../../../components/navbar";
import api from "../../../services/api";
import Swal from "sweetalert2";

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

  //Mapeamento dos status para exibição
  const mapeamentoStatus = {
    aberto: "Retirado",
    fechado: "Devolvido",
    pendente: "Pendente",
  };

  const carregarRelatorios = () => {
    const token = sessionStorage.getItem("token");
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
              //Aplica o mapeamento para exibição
              statusDisplay:
                mapeamentoStatus[item.status] || item.status || "--",
              ciente: item.ciente ? "Sim" : "Não",

              id_control: item.id,
              id_usuario: item.usuario?.id || item.id_usuario,
              id_lab: item.laboratorio?.id || item.id_labs,
              id_equip: item.equipamento?.id || item.id_equip,
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

  const handleFecharControl = async (controlId) => {
    const token = sessionStorage.getItem("token");
    if (!token) {
      console.error("Token não encontrado");
      return;
    }

    //Confirmação antes de fechar
    const result = await Swal.fire({
      title: "Confirmar Devolução",
      text: "Tem certeza que deseja marcar este item como devolvido?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Sim, devolver!",
      cancelButtonText: "Cancelar",
    });

    if(!result.isConfirmed) {
      return;
    }

    try {
      const payload = {
        id_control: controlId,
      };

      console.log("Enviando payload: ", payload);

      await api.put("/control/admin/devolucao", payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      //Recarrega a lista
      carregarRelatorios();

      Swal.fire({
        icon: "success",
        title: "Devolução Registrada!",
        text: "Item devolvido com sucesso!",
        timer: 2000,
        showConfirmButton: false,
      });
    } catch (err) {
      console.error("Erro ao fechar controle: ", err);

      let errorMessage = "Não foi possível registrar a devolução"
      if( err.response?.data?.message) {
        errorMessage = err.response.data.message
      }

      Swal.fire({
        icon: "error",
        title: "Erro",
        text: errorMessage,
      });
    }
  };

  // //Função para formatar data
  // const formatarData = (dataString) => {
  //   if(!dataString) return "--";
  //   try {
  //     const data = new Date(dataString)
  //     return data.toLocaleDateString("pt-BR")
  //   }catch(error) {
  //     return "Data inválida";
  //   }
  // }

  //Função para formatarhora
  const formatarHora = (dataString) => {
    if (!dataString) return "--";
    try {
      const data = new Date(dataString);
      return data.toLocaleTimeString("pt-BR", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      });
    } catch (error) {
      return "Hora inválida";
    }
  };

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
      (!filtros.dataInicio ||
        (r.dataInicio && r.dataInicio.includes(filtros.dataInicio)))
    );
  });

  return (
    <div className="relatorio-page">
      <div className="relatorio-container">
        <header>
          <h2>Relatórios</h2>
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
              <option value="aberto">Retirado</option>
              <option value="fechado">Devolvido</option>
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
                <th>Hora Retirada</th>
                <th>Hora Devolução</th>
                <th>Status</th>
                <th>Ciente</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="9" style={{ textAlign: "center" }}>
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
                    <td>{formatarHora(r.dataInicio)}</td>
                    <td>{formatarHora(r.dataFim)}</td>
                    <td>
                      <span
                        className={`status-${r.statusDisplay?.toLowerCase()}`}
                      >
                        {r.statusDisplay}
                      </span>
                    </td>
                    <td>{r.ciente}</td>
                    <td>
                      {/* Botão apenas para status "Retirado" (aberto) */}
                      {r.status === "aberto" && (
                        <button
                          className="btn-fechar"
                          onClick={() => handleFecharControl(r.id)}
                          title="Marcar como devolvido"
                        >
                          Devolver
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="9" style={{ textAlign: "center" }}>
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
