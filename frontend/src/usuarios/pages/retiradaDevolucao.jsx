import { useState, useEffect } from "react";
import "./retiradaDevolucao.css";
import api from "../../services/api";
import Swal from "sweetalert2";

function RetiradaDevolucao() {
  const [identificacao, setIdentificacao] = useState("");
  const [tipo, setTipo] = useState("");
  const [codigo, setCodigo] = useState("");
  const [professor, setProfessor] = useState(null);
  const [erro, setErro] = useState("");
  const [acao, setAcao] = useState("");

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

  //Verifica se é cpf
  const isCPF = (identificador) => {
    if (!identificador) return false;

    const apenasNumeros = identificador.replace(/\D/g, "");

    if (apenasNumeros.length > 6) {
      return true;
    }

    if (identificador.includes(".") || identificador.includes("-")) {
      return true;
    }

    return false;
  };

  //Máscara do cpf
  const formatarCPF = (input) => {
    if (!input) return "";

    let cpf = input.replace(/\D/g, "");

    //Se tiver mais de 7 dígitos aplica a máscara progressiva
    if (cpf.length >= 7) {
      if (cpf.length <= 3) {
        return cpf;
      } else if (cpf.length <= 6) {
        return cpf.replace(/(\d{3})(\d{0,3})/, "$1.$2");
      } else if (cpf.length <= 9) {
        return cpf.replace(/(\d{3})(\d{3})(\d{0,3})/, "$1.$2.$3");
      } else {
        return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{0,2})/, "$1.$2.$3-$4");
      }
    }
    //Se tiver menos de 7 dígitos, retorna sem formatação (pode ser RM)
    return cpf;
  };

  const normalizarRM = (identificador) => {
    if (!identificador) return identificador;

    const identificadorTrim = identificador.trim();

    // Remove formatação do CPF para o backend
  const apenasNumeros = identificadorTrim.replace(/\D/g, "");
  
  // Se tem 11 dígitos, é CPF
  if (apenasNumeros.length === 11) {
    return apenasNumeros;
  }
  
  // Se tem mais de 6 dígitos mas menos de 11, ainda é CPF (incompleto)
  // Mas o backend vai validar
  if (apenasNumeros.length > 6) {
    return apenasNumeros;
  }

  // Código original para RM (5 ou 6 dígitos)
  if (identificadorTrim.length !== 5 && identificadorTrim.length !== 6) {
    return identificadorTrim;
  }

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

  const handleIdentificacaoChange = (value) => {
  // Remove caracteres não numéricos para contar
  const apenasNumeros = value.replace(/\D/g, "");
  
  // Se tiver mais de 6 dígitos OU já tiver pontos/traço, aplica máscara de CPF
  if (apenasNumeros.length > 6 || value.includes(".") || value.includes("-")) {
    const valorFormatado = formatarCPF(value);
    setIdentificacao(valorFormatado);
  } else {
    // Se tiver 6 ou menos dígitos, não formata (pode ser RM)
    setIdentificacao(value);
  }
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
    setAcao("");
  };

  //Função para verificar se há labs em aberto sem ciente
  const verificarLabsAbertosSemCiente = async (identificadorNormalizado) => {
    try {
      const response = await api.get(
        `/control/professor/${identificadorNormalizado}`
      );
      const controlesAbertos = response.data.data || [];

      const labsAbertosSemCiente = controlesAbertos.filter(
        (controle) =>
          controle.id_labs &&
          controle.ciente === false &&
          controle.status === "aberto"
      );
      return labsAbertosSemCiente;
    } catch (error) {
      console.error("Erro ao verificar laboratórios abertos: ", error);
      return [];
    }
  };

  //Função para fazer retirada
  const fazerRetirada = async (payload) => {
    try {
      const response = await api.post("/control/retirada", payload);

      Swal.fire({
        icon: "success",
        title: "Retirada Registrada!",
        text: `${
          tipo === "chave" ? "Laboratório" : "Equipamento"
        } retirado com sucesso!`,
        timer: 2500,
        showConfirmButton: false,
      });
      console.log("Retirada registrada: ", response.data);

      resetarFormulario();
    } catch (err) {
      console.error("Erro ao retirar: ", err);

      //Verifica se é erro específico do backend
      if (
        err.response?.data?.response?.includes(
          "já tem este laboratório em aberto"
        )
      ) {
        Swal.fire({
          icon: "warning",
          title: "Laboratório já em uso",
          text: "Este laboratório já está em aberto em seu nome.",
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "Erro na Retirada",
          text:
            err.response?.data?.response ||
            "Não foi possível registrar a retirada.",
        });
      }
    }
  };

  //Função fechar labs anteriores
  const fecharLabsAnteriores = async (labsAbertos, novoPayload) => {
    try {
      Swal.fire({
        title: "Fechando laboratório anterior...",
        text: "Por favor, aguarde",
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });

      // Fecha todos os labs anteriores
      for (const lab of labsAbertos) {
        const closePayload = {
          identificador: normalizarRM(identificacao),
          id: lab.id,
          id_labs: lab.id_labs,
          data_fim: new Date(),
          status: "fechado",
        };

        await api.put("/control/devolucao", closePayload);
      }

      Swal.close();

      //Após fechar o lab anterior, faz a nova retirada
      await fazerRetirada(novoPayload);
    } catch (error) {
      console.error("Erro ao fechar laboratório anterior:", error);
      Swal.fire({
        icon: "error",
        title: "Erro",
        html: `
          Não foi possível fechar o laboratório anterior.<br>
          <small>${error.response?.data?.response || error.message}</small>
        `,
      });
    }
  };

  const marcarLabsComoCienteEContinuar = async (labsAbertos, novoPayload) => {
    try {
      Swal.fire({
        title: "Processando...",
        text: "Registrando confirmação",
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });

      // Marca todos os labs anteriores como ciente
      for (const lab of labsAbertos) {
        await api.patch(`/control/ciente/${lab.id}`, {
          ciente: true,
        });
      }

      Swal.close();
      // Faz a nova retirada
      await fazerRetirada(novoPayload);
    } catch (error) {
      console.error("Erro ao marcar laboratório como ciente:", error);
      Swal.fire({
        icon: "error",
        title: "Erro",
        html: `
          Não foi possível confirmar o laboratório anterior.<br>
          <small>${error.response?.data?.response || error.message}</small>
        `,
      });
    }
  };

  // Função para retirar
  const handleRetirar = async () => {
    if (!professor)
      return Swal.fire("Atenção", "Usuário não identificado!", "warning");
    if (!tipo)
      return Swal.fire(
        "Atenção",
        "Selecione se é chave ou equipamento!",
        "warning"
      );

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
        Swal.fire(
          "Atenção",
          "Selecione um item válido para retirar!",
          "warning"
        );
        return;
      }

      if (tipo === "chave") {
        const labsAbertosSemCiente = await verificarLabsAbertosSemCiente(
          identificadorNormalizado
        );

        //Se houver labs em aberto sem ciente, mostra o aviso
        if (labsAbertosSemCiente.length > 0) {
          const labsHTML = labsAbertosSemCiente
            .map((lab) => {
              const dataFormatada = new Date(lab.data_inicio).toLocaleString(
                "pt-BR"
              );

              return `
           <div class="lab-item" style="margin-bottom: 10px; padding: 8px; background: #fff3cd; border-radius: 5px; border-left: 4px solid #ffc107;">
              <strong>${lab.laboratorio?.nome_lab || "Laboratório"}</strong><br>
              <small>${lab.laboratorio?.desc_lab || ""}</small><br>
              <small><i>Desde: ${dataFormatada}</i></small>
            </div>
          `;
            })
            .join("");

          //Novo laboratório que está tentando retirar
          const novoLabNome = labSelecionado?.nome_lab;
          const novoLabDesc = labSelecionado?.desc_lab;

          //Mostra o SweetAlert apenas para labs
          const { value: opcao } = await Swal.fire({
            title: `<strong style="color: #856404">Atenção!</strong>`,
            html: `
                <div style ="text-align: left;">
                  <p>Você já possui <strong>${labsAbertosSemCiente.length} laboratório(s)</strong> em aberto.</p>
                  <div style="background: #e8f5e9; padding: 10px; border-radius: 5px; margin: 10px 0; border-left: 4px solid #4caf50;">
                    <strong>Novo laboratório a retirar: </strong> <br>
                    <strong>${novoLabNome}</strong> - ${novoLabDesc}
                  </div>             

                  <p><strong>Laboratórios atualmente em aberto:</strong></p>
                  ${labsHTML}

                  <p style="margin-top: 15px; color: #666; font-size: 0.9em;">
                    <i class="fas fa-info-circle"></i>
                    <strong>Importante:</strong> Você tem certeza que deseja pegar duas chaves simultâneamente?<br>
                     <strong> Escolha uma opção:</strong>
                    </p>
                </div>
              `,
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: '<i class="fas fa-times"></i> Fechar anterior',
            cancelButtonText:
              '<i class="fas fa-check"></i> Cancelar',
            showDenyButton: true,
            denyButtonText: '<i class="fas fa-ban"></i> Continuar',
            confirmButtonColor: "#5ca9da",
            cancelButtonColor: "#dc3545",
            denyButtonColor: "#6c757d",
            reverseButtons: true,
            width: "600px",
            customClass: {
              popup: "sweet-alert-multiplas-retiradas",
            },
            buttonsStyling: true,
            allowOutsideClick: false,
          });

          //Lida com a opção escolhida
          if (opcao === true) {
            //Usuário clicou em "Fechar anterior"
            await fecharLabsAnteriores(labsAbertosSemCiente, payload);
            return;
          } else if (opcao === false) {
            //Usuário clicou em "Continuar mesmo assim"
            await marcarLabsComoCienteEContinuar(labsAbertosSemCiente, payload);
            return;
          }
          //Se for undefined (cancelar), não faz nada
          return;
        }
      }

      //Se for equipamento ou se não houver labs abertos, faz a retirada normalmente
      await fazerRetirada(payload);

      // //Usando a rota da control no back
      // const response = await api.post("/control/retirada", payload);

      // Swal.fire({
      //   icon: "success",
      //   title: "Retirada Registrada!",
      //   text: `${
      //     tipo === "chave" ? "Laboratório" : "Equipamento"
      //   } retirado com sucesso!`,
      //   timer: 2500,
      //   showConfirmButton: false,
      // });
      // console.log("Retirada registrada:", response.data);

      // Reseta o formulário após sucesso
      // resetarFormulario();
    } catch (err) {
      console.error("Erro ao retirar:", err);
      Swal.fire({
        icon: "error",
        title: "Erro na Retirada",
        text: "Não foi possível registrar a retirada. Verifique se o item está livre ou se há alguma reserva pendente.",
      });
    }
  };

  // Função para devolver
  const handleDevolver = async () => {
    if (!professor)
      return Swal.fire("Atenção", "Usuário não identificado!", "warning");
    if (!tipo)
      return Swal.fire(
        "Atenção",
        "Selecione se é chave ou equipamento!",
        "warning"
      );

    const identificadorNormalizado = normalizarRM(identificacao);
    let idControlToClose = null;

    let idLabsToClose = null;
    let idEquipToClose = null;

    if (tipo === "chave" && labSelecionado) {
      idControlToClose = labSelecionado.id_control;
      idLabsToClose = labSelecionado.id;
    } else if (tipo === "equipamento" && equipSelecionado) {
      idControlToClose = equipSelecionado.id_control;
      idEquipToClose = equipSelecionado.id;
    } else {
      Swal.fire(
        "Atenção",
        "Selecione um item válido para devolver!",
        "warning"
      );
      return;
    }

    if (!idControlToClose) {
      Swal.fire("Atenção", "ID do controle de posse não encontrado.", "error");
      return;
    }
    try {
      const payload = {
        // ID da Transação (Control)
        id: idControlToClose,

        // 💡 CAMPO OBRIGATÓRIO (Identificador, já corrigido anteriormente)
        identificador: identificadorNormalizado,

        // 💡 CORREÇÃO FINAL: Incluir o ID do item devolvido
        ...(idLabsToClose && { id_labs: idLabsToClose }), // Adiciona id_labs se houver
        ...(idEquipToClose && { id_equip: idEquipToClose }), // Adiciona id_equip se houver

        // Dados de fechamento
        data_fim: new Date(),
        status: "fechado",
      };

      //DE TESTE E DEPOIS REMOVE
      console.log("📤 Enviando para backend:", {
        original: identificacao,
        normalizado: identificadorNormalizado,
        payload: payload,
      });

      const response = await api.put("/control/devolucao", payload);

      Swal.fire({
        icon: "success",
        title: "Devolução Registrada!",
        text: `${
          tipo === "chave" ? "Laboratório" : "Equipamento"
        } devolvido com sucesso!`,
        timer: 2500,
        showConfirmButton: false,
      });

      console.log("Devolução registrada:", response.data);

      // Reseta o formulário após sucesso
      resetarFormulario();
    } catch (err) {
      console.error("Erro ao devolver:", err);
      Swal.fire({
        icon: "error",
        title: "Erro na Devolução",
        text: "Não foi possível registrar a devolução. Verifique se o item está realmente em posse ou se o código está correto.",
      });
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
          setErro("Usuário não encontrado");
        });
    } else {
      setProfessor(null);
      setErro("");
    }
  }, [identificacao]);

  //Estados para mostrar todos
  const [todosLabs, setTodosLabs] = useState([]);
  const [todosEquipamentos, setTodosEquipamentos] = useState([]);

  // Buscar laboratórios e equipamentos quando tipo e ação mudam
  useEffect(() => {
    // Garante que o professor esteja identificado se a ação for devolução
    if (acao === "devolucao" && !professor) {
      setTodosLabs([]);
      setTodosEquipamentos([]);
      return;
    }

    const carregarDados = async () => {
      try {
        if (acao === "retirada") {
          // FLUXO DE RETIRADA: Carrega TODOS os itens disponíveis
          if (tipo === "chave") {
            const response = await api.get("/labs");
            setTodosLabs(response.data.data || []);
          } else if (tipo === "equipamento") {
            const response = await api.get("/equipamento");
            setTodosEquipamentos(response.data.data || []);
          }
        } else if (acao === "devolucao" && professor) {
          // FLUXO DE DEVOLUÇÃO: Carrega APENAS os itens em posse do professor.
          const identificadorNormalizado = normalizarRM(identificacao);

          // Endpoint que busca todos os itens abertos do professor
          const response = await api.get(
            `/control/professor/${identificadorNormalizado}`
          );
          const itensEmPosse = response.data.data || [];

          console.log("▶️ Itens em posse (Retorno da API):", itensEmPosse);

          if (tipo === "chave") {
            // Filtra chaves (labs) em posse
            const labsEmPosse = itensEmPosse
              .filter(
                (item) =>
                  item.id_labs && item.status === "aberto" && item.laboratorio
              )
              .map((item) => ({
                // Mapeia o ID da TRANSAÇÃO (Control) para a devolução
                id_control: item.id,
                // Mapeia o ID e nome do Laboratório para a exibição
                id: item.laboratorio.id,
                nome_lab: item.laboratorio.nome_lab,
                desc_lab: item.laboratorio.desc_lab,
              }));

            setTodosLabs(labsEmPosse);
            setTodosEquipamentos([]);
          } else if (tipo === "equipamento") {
            // Filtra equipamentos em posse
            const equipamentosEmPosse = itensEmPosse
              .filter(
                (item) =>
                  item.id_equip && item.status === "aberto" && item.equipamento
              )
              .map((item) => ({
                // Mapeia o ID da TRANSAÇÃO (Control) para a devolução
                id_control: item.id,
                // Mapeia o ID e descrição do Equipamento para a exibição
                id: item.equipamento.id,
                desc_equip: item.equipamento.desc_equip,
                tipo: item.equipamento.tipo,
              }));

            setTodosEquipamentos(equipamentosEmPosse);
            setTodosLabs([]);
          }
        }
      } catch (err) {
        console.error(`Erro ao carregar dados para ${acao}: `, err);
        setTodosLabs([]);
        setTodosEquipamentos([]);
      }
    };

    if (tipo) {
      carregarDados();
    }
    // Limpa campos e sugestões ao trocar tipo
    setCodigo("");
    setLabSelecionado(null);
    setEquipSelecionado(null);
    setFiltroLabs([]);
    setFiltroEquip([]);
    setMostrarSugestoesLabs(false);
    setMostrarSugestoesEquip(false);
  }, [tipo, acao, professor, identificacao]);

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
    //Só permite selecionar se estiver livre OU se a ação for DEVOLUÇÃO (pois ele só vê os que tem posse)
    if (lab.status === "livre" || acao === "devolucao") {
      setCodigo(`${lab.nome_lab} - ${lab.desc_lab}`);
      setLabSelecionado(lab);
      setMostrarSugestoesLabs(false);
    }
  };

  const handleSelecionarEquip = (equip) => {
    //Só permite selecionar se estiver livre OU se a ação for DEVOLUÇÃO
    if (equip.status === "livre" || acao === "devolucao") {
      setCodigo(`${equip.tipo?.desc_tipo} - ${equip.desc_equip}`);
      setEquipSelecionado(equip);
      setMostrarSugestoesEquip(false);
    }
  };

  // Envio do formulário
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!professor) {
      Swal.fire(
        "Atenção",
        "Usuário não identificado! Por favor, insira um RM ou CPF válido.",
        "warning"
      );
      return;
    }
    if (!tipo) {
      Swal.fire("Atenção", "Selecione se é Chave ou Equipamento!", "warning");
      return;
    }
    if (acao === "retirada") {
      handleRetirar();
    } else if (acao === "devolucao") {
      handleDevolver();
    } else {
      // Caso o 'acao' (Retirada/Devolução) não esteja selecionado (embora deva ter um valor padrão)
      Swal.fire("Erro", "Selecione a Ação (Retirada ou Devolução).", "error");
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
            onChange={(e) => handleIdentificacaoChange(e.target.value)}
            className="input-identificacao"
            maxLength={14}
          />
          {professor && (
            <p className="professor-encontrado">Olá, {professor.nome}!</p>
          )}
          {erro && <p className="erro">{erro}</p>}

          {/* Ações: Retirada / Devolução (NOVO POSICIONAMENTO) */}
          <div className="opcoes acao-opcoes">
            <label className="radio-label">
              <input
                type="radio"
                name="acao"
                value="retirada"
                checked={acao === "retirada"}
                onChange={(e) => setAcao(e.target.value)}
              />
              <span className="custom-radio"></span> Retirada
            </label>
            <label className="radio-label">
              <input
                type="radio"
                name="acao"
                value="devolucao"
                checked={acao === "devolucao"}
                onChange={(e) => setAcao(e.target.value)}
              />
              <span className="custom-radio"></span> Devolução
            </label>
          </div>

          {/* Tipo: Chave / Equipamento */}
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

          {/* Conteúdo Dinâmico (Código ou Tabela) */}
          {tipo && acao === "retirada" && (
            // FLUXO DE RETIRADA: Input de Código e Autocomplete (como estava)
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

          {tipo &&
            acao === "devolucao" &&
            professor &&
            //Renderiza a tabela SOMENTE se houver labs OU equipamentos em posse.
            (todosLabs.length > 0 || todosEquipamentos.length > 0 ? (
              <>
                <p className="form-label">
                  Itens em sua posse (Selecione para Devolver):
                </p>
                <ul className="lista-sugestoes">
                  {tipo === "chave" &&
                    todosLabs.length > 0 &&
                    todosLabs.map((lab) => (
                      <li
                        key={lab.id_control} //ID do controle para a chave
                        onClick={() => handleSelecionarLab(lab)} // Ação de seleção
                        className={`opcao-lab ${
                          labSelecionado?.id_control === lab.id_control
                            ? "selecionado"
                            : ""
                        }`}
                      >
                        {lab.nome_lab} - {lab.desc_lab}
                        <span className="status-posse"> (Em Posse)</span>
                      </li>
                    ))}

                  {/* Mapeamento para EQUIPAMENTOS */}
                  {tipo === "equipamento" &&
                    todosEquipamentos.length > 0 &&
                    todosEquipamentos.map((equip) => (
                      <li
                        key={equip.id_control} // Use o ID do controle para a chave
                        onClick={() => handleSelecionarEquip(equip)} // Ação de seleção
                        className={`opcao-equip ${
                          equipSelecionado?.id_control === equip.id_control
                            ? "selecionado"
                            : ""
                        }`}
                      >
                        {equip.tipo?.desc_tipo} - {equip.desc_equip}
                        {/* Adicione um ícone ou texto para indicar "Em Posse" se desejar */}
                        <span className="status-posse"> (Em Posse)</span>
                        {/* O rádio button é opcional, a classe 'selecionado' já indica */}
                      </li>
                    ))}
                </ul>
              </>
            ) : (
              <p className="tabela-vazia-mensagem">Nenhum item em sua posse.</p>
            ))}
          {/* Botão de Confirmação */}
          <div className="buttons">
            <button type="submit" className={`btn-${acao}`}>
              {acao === "retirada"
                ? "Confirmar Retirada"
                : "Confirmar Devolução"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default RetiradaDevolucao;
