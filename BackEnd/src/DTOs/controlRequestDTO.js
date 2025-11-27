import BaseDTO from "./BaseDTO.js";
import Control from "../entities/control.js";
import Usuario from "../entities/usuario.js";
import Labs from "../entities/labs.js";
import Equipamento from "../entities/equipamento.js";
import { AppDataSource } from "../database/data-source.js";
import { IsNull } from "typeorm";
import validationUtils from "../utils/validationUtils.js";

const controlRepository = AppDataSource.getRepository(Control);
const usuarioRepository = AppDataSource.getRepository(Usuario);
const labsRepository = AppDataSource.getRepository(Labs);
const equipamentoRepository = AppDataSource.getRepository(Equipamento);

class ControlRequestDTO extends BaseDTO {
  async validateGetControls() {
    this.clearValidatedData();

    const data = this.data;
    const {
      id_usuario,
      id_labs,
      id_equip,
      nome_usuario,
      nome_lab,
      desc_equip,
      status,
      ciente,
      data_inicio,
      data_fim,
      // page,
      // limit,
    } = data;

    // this.validatedData.page = 1;
    // this.validatedData.limit = 10;

    // if (page !== undefined && page !== null && page !== '') {
    //   if (!this.validateParamsId("page", "Página", 1, 1000)) return false;
    //   this.validatedData.page = Math.max(1, Number(page));
    // }

    // if (limit !== undefined && limit !== null && limit !== '') {
    //   if (!this.validateParamsId("limit", "Limite", 1, 100)) return false;
    //   this.validatedData.limit = Math.min(Math.max(1, Number(limit)), 100);
    // }

    if (status !== undefined) {
      const statusValidos = ["aberto", "fechado", "pendente"];
      if (!statusValidos.includes(status)) {
        this.addError("status", "Status deve ser: aberto, fechado ou pendente");
        return false;
      }
      this.validatedData.status = status;
    }

    if (ciente !== undefined) {
      if (
        ciente !== "true" &&
        ciente !== "false" &&
        ciente !== true &&
        ciente !== false
      ) {
        this.addError("ciente", "Campo ciente deve ser true ou false");
        return false;
      }
      this.validatedData.ciente = ciente === "true" || ciente === true;
    }

    //Validação com prioridade - Usuario
    if (id_usuario !== undefined) {
      if (!this.validateForeignKeyId("id_usuario", "ID do Usuário", false))
        return false;
      this.validatedData.filtro_usuario_tipo = "id";
    } else if (nome_usuario !== undefined) {
      if (typeof nome_usuario !== "string") {
        this.addError("nome_usuario", "Nome do usuário deve ser um texto");
        return false;
      }
      this.validatedData.nome_usuario = nome_usuario.trim();
      this.validatedData.filtro_usuario_tipo = "nome";
    }

    //Validação com prioridade - Laboratório
    if (id_labs !== undefined && id_labs !== null && id_labs !== "") {
      if (!this.validateForeignKeyId("id_labs", "ID do Laboratório", false))
        return false;
      this.validatedData.filtro_lab_tipo = "id";
    } else if (nome_lab !== undefined) {
      if (typeof nome_lab !== "string") {
        this.addError("nome_lab", "Nome do laboratório deve ser um texto");
        return false;
      }
      this.validatedData.nome_lab = nome_lab.trim();
      this.validatedData.filtro_lab_tipo = "nome";
    }

    //Validação com prioridade - Equipamento
    if (id_equip !== undefined && id_equip !== null && id_equip !== "") {
      if (!this.validateForeignKeyId("id_equip", "ID do Equipamento", false))
        return false;
      this.validatedData.filtro_equip_tipo = "id";
    } else if (desc_equip !== undefined) {
      if (typeof desc_equip !== "string") {
        this.addError(
          "desc_equip",
          "Descrição do equipamento deve ser um texto"
        );
        return false;
      }
      this.validatedData.desc_equip = desc_equip.trim();
      this.validatedData.filtro_equip_tipo = "nome";
    }

    if (data_inicio !== undefined) {
      if (!validationUtils.validateDate(data_inicio)) {
        this.addError("data_inicio", "Data do início inválida");
        return false;
      }
      this.validatedData.data_inicio = data_inicio;
    }

    if (data_fim !== undefined) {
      if (!validationUtils.validateDate(data_fim)) {
        this.addError("data_fim", "Data do fim inválida");
        return false;
      }
      this.validatedData.data_fim = data_fim;
    }

    //Data de início não é maior que a data de fim
    if (data_inicio && data_fim) {
      const inicio = new Date(data_inicio);
      const fim = new Date(data_fim);
      if (inicio > fim) {
        this.addError(
          "datas",
          "Data de início não pode ser maior que data de fim"
        );
        return false;
      }
    }

    return this.isValid();
  }

  async validateOpen() {
    this.clearValidatedData();

    const { identificador, id_equip, id_labs } = this.data;

    //Valida cpf e matricula e busca usuário
    if (!identificador || !identificador.trim()) {
      this.addError("identificador", "CPF ou matrícula é obrigatório");
      return false;
    }

    //Busca por cpf ou matricula
    try {
      const usuario = await usuarioRepository.findOne({
        where: [
          { cpf: identificador.trim(), deletedAt: IsNull() },
          {
            usuario_cad: { matricula: identificador.trim() },
            deletedAt: IsNull(),
          },
        ],
        relations: ["usuario_cad"],
      });

      if (!usuario) {
        this.addError("identificador", "Usuário não encontrado");
        return false;
      }
      this.validatedData.id_usuario = usuario.id;
      this.validatedData.usuario = usuario;
    } catch (error) {
      this.addError("identificador", "Erro ao buscar usuário");
      return false;
    }

    if (!id_equip && !id_labs) {
      this.addError(
        "sistema",
        "Informe um equipamento ou laboratório para a retirada"
      );
      return false;
    }

    if (id_equip !== undefined && id_equip !== null && id_equip !== "") {
      if (!this.validateForeignKeyId("id_equip", "Equipamento", false))
        return false;
    }

    if (id_labs !== undefined && id_labs !== null && id_labs !== "") {
      if (!this.validateForeignKeyId("id_labs", "Laboratório", false))
        return false;
    }

    try {
      const usuario = await usuarioRepository.findOneBy({
        id: this.validatedData.id_usuario,
        deletedAt: IsNull(),
      });

      if (!usuario) {
        this.addError("id_usuario", "Usuário não encontrado");
        return false;
      }
      this.validatedData.usuario = usuario;
    } catch (error) {
      this.addError("id_usuario", "Erro ao validar usuário");
      return false;
    }

    if (id_equip) {
      try {
        const equipamento = await equipamentoRepository.findOneBy({
          id: this.validatedData.id_equip,
          deletedAt: IsNull(),
        });

        if (!equipamento) {
          this.addError("id_equip", "Equipamento não encontrado");
          return false;
        }
        this.validatedData.equipamento = equipamento;
      } catch (error) {
        this.addError("id_equip", "Erro ao validar equipamento");
        return false;
      }
    }

    if (id_labs) {
      try {
        const laboratorio = await labsRepository.findOneBy({
          id: this.validatedData.id_labs,
          deletedAt: IsNull(),
        });
        if (!laboratorio) {
          this.addError("id_labs", "Laboratório não encontrado");
          return false;
        }
        this.validatedData.laboratorio = laboratorio;

        //Verifica se o usuario já tem este laboratório em aberto
        const controleLabAberto = await controlRepository.findOne({
          where: {
            id_usuario: this.validatedData.id_usuario,
            id_labs: this.validatedData.id_labs,
            status: "aberto",
            deletedAt: IsNull(),
          },
        });

        if (controleLabAberto) {
          this.addError("id_labs", "Usuário já tem este laboratório em aberto");
          return false;
        }

        //Verifica se o usuário tem outros labs em aberto (para acionar o campo: aberto)
        const outroLabAberto = await controlRepository.find({
          where: {
            id_usuario: this.validatedData.id_usuario,
            id_labs: IsNull(),
            status: "aberto",
            ciente: false,
            deletedAt: IsNull(),
          },
        });
        //Marcar o aberto como true (usuario ciente)
        if (outroLabAberto.length > 0) {
          for (const control of outroLabAberto) {
            await controlRepository.update(control.id, { ciente: true });
          }
        }
      } catch (error) {
        this.addError("id_labs", "Erro ao validar laboratório");
        return false;
      }
    }

    this.validatedData.status = "aberto";
    this.validatedData.ciente = false;
    this.validatedData.data_inicio = new Date();

    return this.isValid();
  }

  async validateClose() {
    this.clearValidatedData();

    const { identificador, id_equip, id_labs } = this.data;

    if (!identificador || !identificador.trim()) {
      this.addError("identificador", "CPF ou matrícula é obrigatório");
      return false;
    }

    //Busca por cpf ou matricula
    try {
      const usuario = await usuarioRepository.findOne({
        where: [
          { cpf: identificador.trim(), deletedAt: IsNull() },
          {
            usuario_cad: { matricula: identificador.trim() },
            deletedAt: IsNull(),
          },
        ],
        relations: ["usuario_cad"],
      });

      if (!usuario) {
        this.addError("identificador", "Usuário não encontrado");
        return false;
      }
      this.validatedData.id_usuario = usuario.id;
    } catch (error) {
      this.addError("identificador", "Erro ao buscar usuário");
      return false;
    }

    if (!id_equip && !id_labs) {
      this.addError(
        "sistema",
        "Informe um equipamento ou laboratório para a devolução"
      );
      return false;
    }

    if (id_equip !== undefined && id_equip !== null && id_equip !== "") {
      if (!this.validateForeignKeyId("id_equip", "Equipamento", false))
        return false;
    }

    if (id_labs !== undefined && id_labs !== null && id_labs !== "") {
      if (!this.validateForeignKeyId("id_labs", "Laboratório", false))
        return false;
    }

    //Busca um control em aberto para fechar
    try {
      const whereConditions = {
        id_usuario: this.validatedData.id_usuario,
        status: "aberto",
        deletedAt: IsNull(),
      };

      if (id_equip) {
        whereConditions.id_equip = this.validatedData.id_equip;
      } else if (id_labs) {
        whereConditions.id_labs = this.validatedData.id_labs;
      }

      const controleAberto = await controlRepository.findOne({
        where: whereConditions,
      });

      if (!controleAberto) {
        this.addError(
          "sistema",
          "Nenhum controle em aberto encontrado para fechar"
        );
        return false;
      }

      this.validatedData.id = controleAberto.id;
      this.validatedData.data_fim = new Date();
      this.validatedData.status = "fechado";
    } catch (error) {
      this.addError("sistema", "Erro ao buscar controle para fechar");
      return false;
    }
    return this.isValid();
  }

  async validateAdminClose() {
    this.clearValidatedData();

    const { id_control } = this.data;

    if (!id_control) {
      this.addError("id_control", "ID do controle é obrigatório.");
      return false;
    }

    if (!this.validateParamsId("id_control", "ID do Controle")) return false;

    return this.isValid();
  }

  async validateCiente() {
    this.clearValidatedData();

    if (!this.validateParamsId("id", "ID do Controle")) return false;

    try {
      const controle = await controlRepository.findOneBy({
        id: this.validatedData.id,
        status: "aberto",
        deletedAt: IsNull(),
      });

      if (!controle) {
        this.addError("id", "Erro ao validar controle");
        return false;
      }

      //Marca como ciente
      this.validatedData.ciente = true;
    } catch (error) {
      this.addError("id", "Erro ao validar controle");
      return false;
    }
    return this.isValid();
  }

  async validateDelete() {
    this.clearValidatedData();

    if (!this.validateParamsId("id", "ID do Controle")) return false;
    return this.isValid();
  }
}

export default ControlRequestDTO;
