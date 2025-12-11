import { useState, useEffect, useRef } from "react";
import "./Equipaments.css";
import { FaCheck, FaTrash } from "react-icons/fa";
import api from "../../../services/api";
import { toast } from "react-toastify";
import { handleApiError } from "../../../helpers/errorHelper";
import Swal from "sweetalert2";

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

function Equipaments() {
  const [modalAberto, setModalAberto] = useState(false);
  const [tipoEquip, setTipoEquip] = useState("");
  const [descEquip, setDescEquip] = useState("");
  const [status, setStatus] = useState("livre");
  const [equipamentos, setEquipamentos] = useState([]);
  const [tipoEquipamentos, setTiposEquip] = useState([]);

  const [filtros, setFiltros] = useState({
    equipamento: "",
    descricao: "",
    status: "",
  });

  // Controle de edição
  const [editando, setEditando] = useState(false);
  const [equipamentoId, setEquipamentoId] = useState(null);
  const [equipamentoDescricao, setEquipamentoDescricao] = useState("");

  const [errosValidacao, setErrosValidacao] = useState({});

  const modalRef = useRef();

  const abrirModal = () => {
    setErrosValidacao({});
    setModalAberto(true);
  };

  const fecharModal = () => {
    setModalAberto(false);
    setEditando(false);
    setEquipamentoId(null);
    setEquipamentoDescricao("");
    setTipoEquip("");
    setDescEquip("");
    setErrosValidacao({});
    setStatus("livre");
  };

  const fetchTiposEquip = () => {
    const token = sessionStorage.getItem("token");
    if (!token) return;

    api
      .get("/tipo_equip", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        const lista = res.data?.data || res.data?.tipos || res.data || [];

        if (Array.isArray(lista)) {
          setTiposEquip(lista);
        } else {
          console.warn("Resposta inesperada do backend /tipo_equip:", res.data);
          setTiposEquip([]);
        }
      })
      .catch((err) => {
        console.error("Erro ao buscar tipos de equipamento:", err);
      });
  };

  const fetchEquipamentos = () => {
    const token = sessionStorage.getItem("token");
    if (!token) return;

    if (filtros.status === "desabilitado") {
      api
        .get("/equipamento/inativos/listar", {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((res) => {
          setEquipamentos(res.data.data || []);
        })
        .catch((err) => {
          console.error("Erro ao buscar equipamentos desativados: ", err);
          toast.error("Erro ao buscar equipamentos desativados!", {
            position: "top-right",
            autoClose: 2000,
            theme: "light",
          });
        });
      return;
    }

    api
      .get("/equipamento", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        if (response.data && response.data.data) {
          setEquipamentos(response.data.data);
        } else if (Array.isArray(response.data)) {
          setEquipamentos(response.data);
        } else {
          setEquipamentos([]);
        }
      })
      .catch((error) => {
        console.error("Erro ao buscar equipamentos:", error);
        setEquipamentos([]);
      });
  };

  //Função para reativar Equipamento
  const reativarEquipamento = async (id) => {
    try {
      const token = sessionStorage.getItem("token");
      if (!token) {
        toast.error("Você precisa estar logado!", {
          position: "top-right",
          autoClose: 2000,
        });
        return;
      }
      const result = await Swal.fire({
        title: "Reativar equipamento?",
        text: "O equipamento voltará a aparecer como ativo.",
        icon: "question",
        showCancelButton: true,
        confirmButtonColor: "#28a745",
        cancelButtonColor: "#6c757d",
        confirmButtonText: "Sim, reativar",
        cancelButtonText: "Cancelar",
      });
      if (!result.isConfirmed) return;

      const response = await api.patch(
        `/equipamento/${id}/reativar`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Equipamento reativado com sucesso!", {
        position: "top-right",
        autoClose: 2000,
      });
      setFiltros(prev => ({
      ...prev,
      status: ""}))
    } catch (error) {
      console.error("Erro ao reativar equipamento: ", error);
      handleApiError(error, "Erro ao reativar equipamento!");
    }
  };

  const deleteEquipamento = async () => {
    const result = await Swal.fire({
      title: "Você tem certeza?",
      html: `Você pode reativar o equipamento <strong>"${equipamentoDescricao}"</strong> caso seja necessário!`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc3545",
      cancelButtonColor: "#6c757d",
      confirmButtonText: "Sim, desativar!",
      cancelButtonText: "Cancelar",
    });

    if (!result.isConfirmed) {
      return;
    }

    try {
      const token = sessionStorage.getItem("token");
      if (!token) {
        toast.error("Você precisa estar logado!", {
          position: "top-right",
          autoClose: 2000,
          theme: "light",
        });
        return;
      }

      await api.delete(`/equipamento/${equipamentoId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      toast.success("Equipamento desativado com sucesso!", {
        position: "top-right",
        autoClose: 2000,
        theme: "light",
      });

      fecharModal();
      fetchEquipamentos(); // atualiza a lista
    } catch (error) {
      console.error("Erro ao desativar equipamento:", error);

      if (error.response && error.response.data) {
        //Tratamento de erros para dependências
        const errorData = error.response.data;

        const errorMessage =
          errorData.message ||
          errorData.error ||
          errorData.msg ||
          errorData.detail ||
          (typeof errorData === "string"
            ? errorData
            : JSON.stringify(errorData));

        console.log("Mensagem de erro extraída:", errorMessage);

        //Verifica se é um erro de depêndencias (controles ativos)
        if (
          typeof errorMessage === "string" &&
          (errorMessage.includes("controles ativos vinculados") ||
            errorMessage.includes("dependências") ||
            errorMessage.includes("controles ativos") ||
            errorMessage.includes("não é possível desativar") ||
            errorMessage.includes("Control"))
        ) {
          //Mensagem específica para erro de dependências
          Swal.fire({
            title: "Não é possível desativar",
            html: `
        <div style="text-align: left;">
              <p>O equipamento <strong>"${equipamentoDescricao}"</strong> não pode ser desativado porque:</p>
              <ul>
                <li>Existem dependências no Relatório vinculados a ele</li>
                <li>Caso desative este equipamento, sua tabela de controle do Relatório ficará órfã de FK.</li>
              </ul>
              <p><small>Mensagem técnica: ${errorMessage}</small></p>
            </div>
        `,
            icon: "error",
            confirmButtonColor: "#3085d6",
            confirmButtonText: "Entendi",
          });
          return;
        }
      }

      toast.error("Erro ao desativar equipamento!", {
        position: "top-right",
        autoClose: 2000,
        theme: "light",
      });
    }
  };

  useEffect(() => {
    fetchEquipamentos();
    fetchTiposEquip();
  }, []);

  //Atualiza a lista quando o filtro de status muda
  useEffect(() => {
    fetchEquipamentos();
  }, [filtros.status]);

  //Mudança nos filtros
  const handleFiltroChange = (e) => {
    const { name, value } = e.target;
    setFiltros((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
  const opcoesTipoEquipamento = tipoEquipamentos.map((tipo) => ({
    value: tipo.desc_tipo,
    label: tipo.desc_tipo,
  }));
  //Filtrar equipamentos
  const equipamentosFiltrados = equipamentos.filter((equip) => {
    const tipo = equip.tipo?.desc_tipo || "Sem tipo";
    const descricao = equip.desc_equip || "";

    return (
      (!filtros.equipamento ||
        tipo.toLowerCase().includes(filtros.equipamento.toLowerCase())) &&
      (!filtros.descricao ||
        descricao.toLowerCase().includes(filtros.descricao.toLowerCase()))
    );
  });

  // Salvar (criar ou atualizar)
  const handleSalvar = async (e) => {
    e.preventDefault();
    const token = sessionStorage.getItem("token");

    if (!token) {
      toast.error("Você precisa estar logado!", {
        position: "top-right",
        autoClose: 2000,
        theme: "light",
      });
      return;
    }

    // corpo da requisição corrigido
    const payload = editando
      ? {
          id: equipamentoId, // necessário pelo DTO de atualização
          desc_equip: descEquip,
          status: status,
        }
      : {
          tipo: tipoEquip,
          desc_equip: descEquip,
          status: status,
        };

    try {
      if (editando) {
        await api.put(`/equipamento/${equipamentoId}`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast.success("Equipamento atualizado com sucesso!", {
          position: "top-right",
          autoClose: 2000,
          theme: "light",
        });
      } else {
        await api.post("/equipamento", payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast.success("Equipamento cadastrado com sucesso!", {
          position: "top-right",
          autoClose: 2000,
          theme: "light",
        });
      }
      fecharModal();
      fetchEquipamentos();
    } catch (error) {
      console.error("Erro ao salvar equipamento:", error);

      const validationErrors = handleApiError(
        error,
        editando
          ? "Erro ao editar equipamento!"
          : "Erro ao cadastrar equipamento!"
      );

      if (validationErrors) {
        setErrosValidacao(validationErrors);
      }
    }
  };

  //  Editar equipamento
  const handleEditar = (equip) => {
    setEditando(true);
    setEquipamentoId(equip.id);
    setEquipamentoDescricao(equip.desc_equip || "");
    setTipoEquip(equip.tipo?.desc_tipo || "");
    setDescEquip(equip.desc_equip || "");
    setStatus(equip.status || "livre");
    abrirModal();
  };

  // Fecha modal ao clicar fora ou apertar ESC
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

    document.addEventListener("mousedown", handleClickFora);
    document.addEventListener("keydown", handleEsc);

    return () => {
      document.removeEventListener("mousedown", handleClickFora);
      document.removeEventListener("keydown", handleEsc);
    };
  }, [modalAberto]);

  return (
    <div className="equipamentos-page">
      <div className="equipamentos-container">
        <header className="chaves-header">
          <h1>Equipamentos</h1>
          <button className="btn-add" type="button" onClick={abrirModal}>
            Adicionar Equipamento
          </button>
        </header>

        <div className="usuarios-filtros">
          <div>
            <h3>Equipamento:</h3>
            <input
              type="text"
              placeholder="Equipamento"
              name="equipamento"
              value={filtros.equipamento}
              onChange={handleFiltroChange}
            />
          </div>
          <div>
            <h3>Descrição:</h3>
            <input
              type="text"
              placeholder="Descrição"
              name="descricao"
              value={filtros.descricao}
              onChange={handleFiltroChange}
            />
          </div>
          <div>
            <h3>Status:</h3>
            <select
              name="status"
              value={filtros.status}
              onChange={handleFiltroChange}
            >
              <option value="" disabled hidden>
                Selecione o status
              </option>
              <option value="">Todos</option>
              <option value="livre">Livre</option>
              <option value="ocupado">Ocupado</option>
              <option value="desabilitado">Desativados</option>
            </select>
          </div>
        </div>

        <div className="tabela-container">
          <table className="equipamentos-tabela">
            <thead>
              <tr>
                <th>Código</th>
                <th>Equipamento</th>
                <th>Descrição</th>
                <th>Status</th>
                {filtros.status !== "desabilitado" ? (
                  <th>Editar</th>
                ): null}
                {filtros.status === "desabilitado" ? (
                  <th>Ativar</th>
                ): null}
              </tr>
            </thead>
            <tbody>
              {equipamentosFiltrados.length > 0 ? (
                equipamentosFiltrados.map((equip) => (
                  <tr key={equip.id}>
                    <td>{equip.id}</td>
                    <td>{equip.tipo?.desc_tipo || "Sem tipo"}</td>
                    <td>{equip.desc_equip}</td>
                    <td>
                      <span className={`status-${equip.status?.toLowerCase()}`}>
                        {equip.status || "livre"}
                      </span>
                    </td>
                    {filtros.status !== "desabilitado" ? (
                    <td>
                      <button
                        className="editar-btn"
                        onClick={() => handleEditar(equip)}
                      >
                        ✏️
                      </button>
                    </td>
                    ): null}
                    {filtros.status === "desabilitado" ? (
                      <td>
                        <button
                        className="editar-btn"
                        onClick={() => reativarEquipamento(equip.id)}
                        title="Reativar equipamento">
                          <FaCheck />
                        </button>
                      </td>
                    ): null}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={filtros.status === "desabilitado" ? "5" : "5"} style={{ textAlign: "center" }}>
                    {equipamentos.length === 0
                      ? "Nenhum equipamento cadastrado"
                      : "Nenhum equipamento encontrado para os filtros aplicados"}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Modal */}
        {modalAberto && (
          <div className="modal-fundo">
            <div className="modal-conteudo" ref={modalRef}>
              <form onSubmit={handleSalvar}>
                <h2>
                  {editando ? "Editar Equipamento" : "Adicionar Equipamento"}
                </h2>

                {!editando && (
                  <>
                    <label>Tipo de equipamento:</label>
                    <SelectPesquisavel
                      options={opcoesTipoEquipamento}
                      placeholder="Digite o tipo do equipamento"
                      value={tipoEquip}
                      onChange={setTipoEquip}
                      required
                      className={errosValidacao.tipo ? "input-error" : ""}
                    />
                    {errosValidacao.tipo && (
                      <div className="erro-validacao">
                        {errosValidacao.tipo}
                      </div>
                    )}
                  </>
                )}

                <label>Descrição:</label>
                <input
                  type="text"
                  placeholder="Descrição"
                  value={descEquip}
                  onChange={(e) => setDescEquip(e.target.value)}
                  required
                  className={errosValidacao.desc_equip ? "input-error" : ""}
                />
                {errosValidacao.desc_equip && (
                  <div className="erro-validacao">
                    {errosValidacao.desc_equip}
                  </div>
                )}

                <label>Status:</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  required
                  className={errosValidacao.status ? "input-error" : ""} // Adicionado verificação de status (caso o BE valide)
                >
                  <option value="livre">Livre</option>
                  <option value="ocupado">Ocupado</option>
                </select>
                {errosValidacao.status && (
                  <div className="erro-validacao">{errosValidacao.status}</div>
                )}

                <div className="modal-botoes">
                  {editando && filtros.status !== "desabilitado" && (
                    <button type="button" onClick={deleteEquipamento}>
                      <FaTrash />
                    </button>
                  )}

                  <button type="button" onClick={fecharModal}>
                    Cancelar
                  </button>

                  <button type="submit">Salvar</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>

      <footer className="footer">
        <p>© 2025 - Sistema de Monitoramento de Laboratórios</p>
      </footer>
    </div>
  );
}

export default Equipaments;
