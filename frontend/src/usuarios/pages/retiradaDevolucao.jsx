import { useState, useEffect } from "react";
import "./retiradaDevolucao.css";
import api from "../../services/api";

function RetiradaDevolucao() {
  const [identificacao, setIdentificacao] = useState("");
  const [tipo, setTipo] = useState("");
  const [codigo, setCodigo] = useState("");
  const [professor, setProfessor] = useState(null);
  const [erro, setErro] = useState("");

  // Chaves
  const [labs, setLabs] = useState([]);
  const [filtroLabs, setFiltroLabs] = useState([]);
  const [labSelecionado, setLabSelecionado] = useState(null);
  const [mostrarSugestoesLabs, setMostrarSugestoesLabs] = useState(false);

  // Equipamentos
  const [equipamentos, setEquipamentos] = useState([]);
  const [filtroEquip, setFiltroEquip] = useState([]);
  const [equipSelecionado, setEquipSelecionado] = useState(null);
  const [mostrarSugestoesEquip, setMostrarSugestoesEquip] = useState(false);

  const normalizarRM = (identificador) => {
    if (!identificador) return identificador;

    const identificadorTrim = identificador.trim();

    //Se for CPF, retorna como está
    if (identificadorTrim.length !== 5 && identificadorTrim.length !== 6) {
      return identificadorTrim;
    }

    //Remove tudo que não é numero
    const apenasNum = identificadorTrim.replace(/\D/g, "");

    //Regras de normalização
    if (apenasNum.length === 5) {
      const normalizado = "0" + apenasNum;
      return normalizado;
    }

    if (apenasNum.length === 6) {
      return apenasNum;
    }

    //Se não se encaixar na regra, retorna o original
    return identificadorTrim;
  };

  const resetarFormulario = () => {
    setIdentificacao("");
    setTipo("");
    setCodigo("");
    setProfessor(null);
    setErro("");
    setLabSelecionado(null);
    setEquipSelecionado(null);
    setFiltroLabs([]);
    setFiltroEquip([]);
    setMostrarSugestoesLabs(false);
    setMostrarSugestoesEquip(false);
  };

  // Função para retirar
  const handleRetirar = async () => {
    if (!professor) return alert("Professor não identificado!");
    if (!tipo) return alert("Selecione se é chave ou equipamento!");

    try {
      //Normaliza a identificação antes de enviar
      const identificadorNormalizado = normalizarRM(identificacao);

      const payload = {
        identificador: identificadorNormalizado,
        status: "aberto",
      };
      if (tipo === "chave" && labSelecionado) {
        payload.id_labs = labSelecionado.id;
      } else if (tipo === "equipamento" && equipSelecionado) {
        payload.id_equip = equipSelecionado.id;
      } else {
        alert("Selecione um item válido para retirar!");
        return;
      }

      //PRA VER SE DEU CERTO E DEPOIS APAGA
      console.log("📤 Enviando para backend:", {
        original: identificacao,
        normalizado: identificadorNormalizado,
      });

      //Usando a rota da control no back
      const response = await api.post("/control/retirada", payload);
      alert(
        `✅ ${
          tipo === "chave" ? "Laboratório" : "Equipamento"
        } retirado com sucesso!`
      );
      console.log("Retirada registrada:", response.data);

      // Reseta o formulário após sucesso
      resetarFormulario();
    } catch (err) {
      console.error("Erro ao retirar:", err);
      alert("Erro ao retirar. Tente novamente.");
    }
  };

  // Função para devolver
  const handleDevolver = async () => {
    if (!professor) return alert("Professor não identificado!");
    if (!tipo) return alert("Selecione se é chave ou equipamento!");

    try {
      const identificadorNormalizado = normalizarRM(identificacao);
      const payload = {
        identificador: identificadorNormalizado,
      };
      if (tipo === "chave" && labSelecionado) {
        payload.id_labs = labSelecionado.id;
      } else if (tipo === "equipamento" && equipSelecionado) {
        payload.id_equip = equipSelecionado.id;
      } else {
        alert("Selecione um item válido para devolver!");
        return;
      }

      //DE TESTE E DEPOIS REMOVE
      console.log("📤 Enviando para backend:", {
        original: identificacao,
        normalizado: identificadorNormalizado,
      });

      const response = await api.put("/control/devolucao", payload);
      alert(
        `✅ ${
          tipo === "chave" ? "Laboratório" : "Equipamento"
        } devolvido com sucesso!`
      );
      console.log("Devolução registrada:", response.data);

      // Reseta o formulário após sucesso
      resetarFormulario();
    } catch (err) {
      console.error("Erro ao devolver:", err);
      alert("Erro ao devolver. Tente novamente.");
    }
  };

  // Buscar professor automaticamente
  useEffect(() => {
    if (identificacao.trim().length > 3) {
      const identificadorNormalizado = normalizarRM(identificacao);

      api
        .get(`/usuario/buscar/${identificadorNormalizado}`)
        .then((res) => {
          setProfessor(res.data);
          setErro("");
        })
        .catch(() => {
          setProfessor(null);
          setErro("Professor não encontrado");
        });
    } else {
      setProfessor(null);
      setErro("");
    }
  }, [identificacao]);

  //Estados para mostrar todos
  const [todosLabs, setTodosLabs] = useState([]);
  const [todosEquipamentos, setTodosEquipamentos] = useState([]);

  // Buscar laboratórios e equipamentos quando tipo muda
  useEffect(() => {
    const carregarDados = async () => {
      try {
        if (tipo === "chave") {
          const response = await api.get("/labs");
          const labsData = response.data.data || [];
          setTodosLabs(labsData);
          setFiltroLabs([]);
        } else if (tipo === "equipamento") {
          const response = await api.get("/equipamento");
          const equipData = response.data.data || [];
          setTodosEquipamentos(equipData);
          setFiltroEquip([]);
        }
      } catch (err) {
        console.error(`Erro ao carregar ${tipo}: `, err);
      }
    };
    if (tipo) {
      carregarDados();
    }
    // if (tipo === "chave") {
    //   api
    //     .get("/labs")
    //     .then((res) =>  {
    //       const todosLabs = res.data.data || [];
    //       setTodosLabs(todosLabs);
    //       //Filtra apenas os livres para seleção
    //       const labsLivres = todosLabs.filter(lab => lab.status === "livre")
    //       setLabs(labsLivres);
    //     })
    //     .catch((err) => console.error("Erro ao carregar labs:", err));
    // } else if (tipo === "equipamento") {
    //   api
    //     .get("/equipamento")
    //     .then((res) => {
    //       const todosEquip = res.data.data || []
    //       setTodosEquipamentos(todosEquip);
    //       //Filtra apenas os livres para seleção
    //       const equipLivres = todosEquip.filter(equip => equip.status === "livre")
    //       setEquipamentos(equipLivres);
    //     })
    //     .catch((err) => console.error("Erro ao carregar equipamentos:", err));
    // }

    // Limpa campos e sugestões ao trocar tipo
    setCodigo("");
    setLabSelecionado(null);
    setEquipSelecionado(null);
    setFiltroLabs([]);
    setFiltroEquip([]);
    setMostrarSugestoesLabs(false);
    setMostrarSugestoesEquip(false);
  }, [tipo]);

  // Filtrar laboratórios ou equipamentos conforme digita
  const handleCodigoChange = (e) => {
    const value = e.target.value;
    setCodigo(value);

    if (tipo === "chave") {
      if (value.trim().length > 0) {
        const filtrados = todosLabs.filter(
          (lab) =>
            lab.nome_lab?.toLowerCase().includes(value.toLowerCase()) ||
            lab.desc_lab?.toLowerCase().includes(value.toLowerCase())
        );

        setFiltroLabs(filtrados);
        setMostrarSugestoesLabs(true);
      } else {
        setFiltroLabs([]);
        setMostrarSugestoesLabs(false);
      }
    }

    if (tipo === "equipamento") {
      if (value.trim().length > 0) {
        const filtrados = todosEquipamentos.filter(
          (equip) =>
            equip.desc_equip?.toLowerCase().includes(value.toLowerCase()) ||
            equip.tipo?.desc_tipo?.toLowerCase().includes(value.toLowerCase())
        );
        setFiltroEquip(filtrados);
        setMostrarSugestoesEquip(true);
      } else {
        setFiltroEquip([]);
        setMostrarSugestoesEquip(false);
      }
    }
  };

  // Seleção de lab ou equipamento
  const handleSelecionarLab = (lab) => {
    //Só permite selecionar se estiver livre
    if (lab.status === "livre") {
      setCodigo(`${lab.nome_lab} - ${lab.desc_lab}`);
      setLabSelecionado(lab);
      setMostrarSugestoesLabs(false);
    }
  };

  const handleSelecionarEquip = (equip) => {
    //Só permite selecionar se estiver livre
    if (equip.status === "livre") {
      setCodigo(`${equip.tipo?.desc_tipo} - ${equip.desc_equip}`);
      setEquipSelecionado(equip);
      setMostrarSugestoesEquip(false);
    }
  };

  // Envio do formulário
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!professor) {
      alert("Professor não identificado!");
      return;
    }
    if (!tipo) {
      alert("Selecione se é chave ou equipamento!");
      return;
    }

    console.log("✅ Retirada/Devolução registrada:");
    console.log("Professor:", professor.nome);
    console.log("Tipo:", tipo);
    console.log("Código:", codigo);
    console.log("Lab selecionado:", labSelecionado);
    console.log("Equip selecionado:", equipSelecionado);
  };

  return (
    <div className="wrapper-pagprofs">
      <div className="container-pagprofs">
        <h2>Retirada e Devolução</h2>
        <form onSubmit={handleSubmit}>
          {/* Identificação */}
          <label htmlFor="identificacao" className="form-label">
            RM ou CPF:
          </label>
          <input
            id="identificacao"
            type="text"
            placeholder="Digite seu RM ou CPF"
            value={identificacao}
            onChange={(e) => setIdentificacao(e.target.value)}
            className="input-identificacao"
          />
          {professor && (
            <p className="professor-encontrado">Olá, {professor.nome}!</p>
          )}
          {erro && <p className="erro">{erro}</p>}

          {/* Tipo */}
          <div className="opcoes">
            <label className="radio-label">
              <input
                type="radio"
                name="tipo"
                value="chave"
                checked={tipo === "chave"}
                onChange={(e) => setTipo(e.target.value)}
              />
              <span className="custom-radio"></span> Chave
            </label>
            <label className="radio-label">
              <input
                type="radio"
                name="tipo"
                value="equipamento"
                checked={tipo === "equipamento"}
                onChange={(e) => setTipo(e.target.value)}
              />
              <span className="custom-radio"></span> Equipamento
            </label>
          </div>

          {/* Código / Autocomplete */}
          {tipo && (
            <>
              <label htmlFor="codigo" className="form-label">
                {tipo === "chave"
                  ? "Digite o nome do laboratório:"
                  : "Digite o equipamento ou tipo:"}
              </label>
              <input
                id="codigo"
                type="text"
                placeholder={
                  tipo === "chave"
                    ? "Ex: Laboratório de Redes"
                    : "Ex: Projetor A"
                }
                value={codigo}
                onChange={handleCodigoChange}
                className="input-codigo"
                autoComplete="off"
              />

              {tipo === "chave" && mostrarSugestoesLabs && (
                <ul className="lista-sugestoes">
                  {filtroLabs.map((lab) => (
                    <li
                      key={lab.id}
                      onClick={() => handleSelecionarLab(lab)}
                      className={`opcao-lab ${
                        lab.status === "livre" ? "livre" : "ocupado"
                      }`}
                    >
                      {lab.nome_lab} - {lab.desc_lab}
                      {lab.status !== "livre" && " (Ocupado)"}
                    </li>
                  ))}
                  {filtroLabs.length === 0 && (
                    <li className="opcao-lab vazio">
                      Nenhum laboratório encontrado
                    </li>
                  )}
                </ul>
              )}
              {tipo === "equipamento" && mostrarSugestoesEquip && (
                <ul className="lista-sugestoes">
                  {filtroEquip.map((equip) => (
                    <li
                      key={equip.id}
                      onClick={() => handleSelecionarEquip(equip)}
                      className={`opcao-equip ${
                        equip.status === "livre" ? "livre" : "ocupado"
                      }`}
                    >
                      {equip.tipo?.desc_tipo} - {equip.desc_equip}
                      {equip.status !== "livre" && " (Ocupado)"}
                    </li>
                  ))}
                  {filtroEquip.length === 0 && (
                    <li className="opcao-equip vazio">
                      Nenhum equipamento encontrado
                    </li>
                  )}
                </ul>
              )}
            </>
          )}

          <div className="buttons">
            <button
              type="button"
              className="btn-retirar"
              onClick={handleRetirar}
            >
              Retirar
            </button>
            <button
              type="button"
              className="btn-devolver"
              onClick={handleDevolver}
            >
              Devolver
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default RetiradaDevolucao;
