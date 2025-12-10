import { useState, useEffect, useCallback } from "react";
import "./Relatorio.css";
import Navbar from "../../../components/navbar";
import api from "../../../services/api";
import Swal from "sweetalert2";
import * as XLSX from "xlsx";

function Relatorio() {
  const [relatorios, setRelatorios] = useState([]);
  const [filtros, setFiltros] = useState({
    nomeUsuario: "",
    laboratorio: "",
    equipamento: "",
    status: "",
    dataInicio: "",
    dataFim: "",
    periodo: "",
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    carregarRelatorios();
  }, []);

  // Mapeamento dos status para exibição
  const mapeamentoStatus = {
    aberto: "Retirado",
    fechado: "Devolvido",
    pendente: "Pendente",
  };

  const carregarRelatorios = useCallback(async () => {
    const token = sessionStorage.getItem("token");
    if (!token) {
      console.error("Token não encontrado");
      return;
    }
    setLoading(true);

    const params = {};

    // Adiciona apenas os parâmetros que não estão vazios
    if (filtros.periodo) params.periodo = filtros.periodo;
    if (filtros.status) params.status = filtros.status;
    if (filtros.dataInicio) params.data_inicio = filtros.dataInicio;
    if (filtros.dataFim) params.data_fim = filtros.dataFim;

    api
      .get("/control", {
        headers: { Authorization: `Bearer ${token}` },
        params,
      })
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
              // dataFim: item.data_fim || item.dataFim,
              dataFim: item.dataFim,
              status: item.status || "--",
              // Aplica o mapeamento para exibição
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
  }, [filtros]);

  useEffect(() => {
    console.log("🔄 useEffect detectou mudança nos filtros");
    console.log("Filtros atuais:", filtros);

    // Debounce para evitar muitas requisições rápidas
    const timer = setTimeout(() => {
      carregarRelatorios();
    }, 300); // 300ms de delay

    return () => clearTimeout(timer);
  }, [filtros, carregarRelatorios]);

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

    // Confirmação antes de fechar
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

    if (!result.isConfirmed) {
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

      // Recarrega a lista
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

      let errorMessage = "Não foi possível registrar a devolução";
      if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      }

      Swal.fire({
        icon: "error",
        title: "Erro",
        text: errorMessage,
      });
    }
  };

  //Função para formatar data
  const formatarData = (dataString) => {
    if (!dataString) return "--";
    try {
      const data = new Date(dataString);
      // Usa UTC para evitar problemas de fuso horário
      const dia = String(data.getUTCDate()).padStart(2, "0");
      const mes = String(data.getUTCMonth() + 1).padStart(2, "0");
      const ano = data.getUTCFullYear();
      return `${dia}/${mes}/${ano}`;
    } catch (error) {
      console.error("Erro ao formatar data:", error);
      return "Data inválida";
    }
  };

  // Função para formatar hora
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
        r.equipamento.toLowerCase().includes(filtros.equipamento.toLowerCase()))
    );
  });

  // ... código existente (handleChange, handleFecharControl, formatarHora) ...

  // Função para exportar os dados filtrados para XLSX (Excel)
  const exportarParaExcel = () => {
    if (relatoriosFiltrados.length === 0) {
      Swal.fire({
        icon: "info",
        title: "Atenção",
        text: "Não há dados para exportar.",
        timer: 2000,
        showConfirmButton: false,
      });
      return;
    }

    // 1. Mapear e preparar os dados
    const dadosParaExportar = relatoriosFiltrados.map((r) => {
      let dataFormatada = "--";
      if (r.dataInicio) {
        const data = new Date(r.dataInicio);

        dataFormatada =
          String(data.getUTCDate()).padStart(2, "0") +
          "/" +
          String(data.getUTCMonth() + 1).padStart(2, "0") +
          "/" +
          data.getUTCFullYear();
      }

      return {
        Usuário: r.usuario,
        Laboratório: r.laboratorio,
        Equipamento: r.equipamento,
        Data: r.dataInicio // Manter o formato ISO para o XLSX lidar com a data
          ? new Date(r.dataInicio).toLocaleDateString("pt-BR")
          : "--",
        "Hora Retirada": formatarHora(r.dataInicio),
        "Hora Devolução": formatarHora(r.dataFim),
        Status: r.statusDisplay,
        Ciente: r.ciente,
      };
    });

    // 2. Criar a planilha (Worksheet) a partir do JSON
    const ws = XLSX.utils.json_to_sheet(dadosParaExportar);

    // 3. Adicionar as informações de data corretas para o Excel
    // O XLSX usa números para datas. Vamos formatar a coluna "Data" (coluna D = 3)
    // const dataColIndex = 3;
    // const dateRegex = /^\d{2}\/\d{2}\/\d{4}$/; // Regex para encontrar datas (DD/MM/YYYY)

    // // Itera sobre todas as células da coluna D, a partir da segunda linha (dados)
    // for (let R = 1; R < dadosParaExportar.length + 1; ++R) {
    //   const cellAddress = XLSX.utils.encode_cell({ c: dataColIndex, r: R });
    //   if (ws[cellAddress] && dateRegex.test(ws[cellAddress].v)) {
    //     // Converte DD/MM/YYYY para o formato Date nativo do JS
    //     const parts = ws[cellAddress].v.split("/");
    //     const jsDate = new Date(parts[2], parts[1] - 1, parts[0]);
    //     ws[cellAddress].v = jsDate; // Define o valor como um objeto Date
    //     ws[cellAddress].t = "d"; // Define o tipo como Data
    //     ws[cellAddress].z = "dd/mm/yyyy"; // Define o formato de exibição
    //   }
    // }

    // 4. Criar o Livro de Trabalho (Workbook)
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Relatório de Controle");

    // 5. Gerar e salvar o arquivo XLSX
    XLSX.writeFile(
      wb,
      `relatorio_laboratorio_${new Date().toISOString().slice(0, 10)}.xlsx`
    );
  };

  return (
    <div className="relatorio-page">
      <div className="relatorio-container">
        <header className="chaves-header">
          <h1>Relatórios</h1>
          <button className="btn-exportar" onClick={exportarParaExcel}>
            Exportar para XLSX
          </button>
        </header>

        <div className="filtros-container">
          <div className="campo">
            <h3>Nome do Usuário:</h3>
            <input
              type="text"
              name="nomeUsuario"
              value={filtros.nomeUsuario}
              onChange={handleChange}
              placeholder="Digite o nome"
            />
          </div>

          <div className="campo">
            <h3>Laboratório:</h3>
            <input
              type="text"
              name="laboratorio"
              value={filtros.laboratorio}
              onChange={handleChange}
              placeholder="Digite o laboratorio"
            />
          </div>

          <div className="campo">
            <h3>Equipamento:</h3>
            <input
              type="text"
              name="equipamento"
              value={filtros.equipamento}
              onChange={handleChange}
              placeholder="Digite o equipamento"
            />
          </div>

          <div className="campo">
            <h3>Status:</h3>
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
            <h3>Data de Início:</h3>
            <input
              type="date"
              name="dataInicio"
              value={filtros.dataInicio}
              onChange={handleChange}
            />
          </div>

          <div className="campo">
            <h3>Data Final:</h3>
            <input
              type="date"
              name="dataFim"
              value={filtros.dataFim}
              onChange={handleChange}
            />
          </div>

          <div className="campo">
            <h3>Período:</h3>
            <select
              name="periodo"
              value={filtros.periodo || ""}
              onChange={(e) => {
                const selectedValue = e.target.value;
                // Atualiza o estado
                setFiltros((prev) => {
                  console.log("Estado anterior:", prev.periodo);
                  console.log("Novo estado:", selectedValue);
                  return { ...prev, periodo: selectedValue };
                });
              }}
            >
              <option value="">Todos os horários</option>
              <option value="manha">Manhã (06:00 - 11:59)</option>
              <option value="tarde">Tarde (12:00 - 16:59)</option>
              <option value="noite">Noite (17:00 - 22:59)</option>
            </select>
          </div>
        </div>

        {/* TABELA */}
        <div className="tabela-container-ofc">
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
