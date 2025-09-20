import BaseDTO from "./BaseDTO.js";
import Agendamento from "../entities/agendamento.js";
import Labs from "../entities/labs.js";
import Usuario from "../entities/usuario.js";
import { AppDataSource } from "../database/data-source";
import { IsNull } from "typeorm";
import validationUtils from "../utils/validationUtils.js";

const agendamentoRepository = AppDataSource.getRepository(Agendamento);
const labsRepository = AppDataSource.getRepository(Labs);
const usuarioRepository = AppDataSource.getRepository(Usuario);

class AgendamentoRequestDTO extends BaseDTO {
  async validateCreate() {
    this.clearValidatedData();

    const {
      id_labs,
      id_usuario,
      data_utilizacao,
      hora_inicio,
      hora_fim,
      finalidade,
    } = this.data;

    this.data.id_labs = id_labs;
    this.data.id_usuario = id_usuario;
    this.data.data_utilizacao = data_utilizacao;
    this.data.hora_inicio = hora_inicio;
    this.data.hora_fim = hora_fim;
    this.data.finalidade = finalidade;

    if (!this.validateNumber("id_labs", "ID do Laboratório")) return false;
    if (!this.validateNumber("id_usuario", "ID do Usuário")) return false;
    if (!this.validateString("finalidade", "Finalidade", 5)) return false;
    if (!this.validateDate("data_utilizacao", "Data de utilização"))
      return false;
    if (!this.validateTime("hora_inicio", "Hora do início")) return false;
    if (!this.validateTime("hora_fim", "Hora do fim")) return false;

    if (
      validationUtils.compareTimes(
        this.validatedData.hora_inicio,
        this.validatedData.hora_fim
      ) >= 0
    ) {
      this.addError(
        "hora_inicio",
        "A hora do início deve ser anterior à hora do fim"
      );
      return false;
    }

    const duracaoMinutos = validationUtils.getTimeDifferenceInMinutes(
      this.validatedData.hora_inicio,
      this.validatedData.hora_fim
    );

    if (duracaoMinutos < 30) {
      this.addError(
        "hora_inicio",
        "Duração mínima do agendamento é de 30 minutos"
      );
      return false;
    }

    //Lab existe
    try {
      const laboratorio = await labsRepository.findOne({
        where: { id: this.validatedData.id_labs, deletedAt: IsNull() },
      });

      if (!laboratorio) {
        this.addError("id_labs", "Laboratório não encontrado");
        return false;
      }
      this.validatedData.laboratorio = laboratorio;
    } catch (error) {
      this.addError("id_labs", "Erro ao verificar laboratório");
      return false;
    }

    //Usuário existe
    try {
      const usuario = await usuarioRepository.findOne({
        where: { id: this.validatedData.id_usuario, deletedAt: IsNull() },
      });

      if (!usuario) {
        this.addError("id_usuario", "Usuário não encontrado");
        return false;
      }
      this.validatedData.usuario = usuario;
    } catch (error) {
      this.addError("id_usuario", "Erro ao verificar usuário");
      return false;
    }

    //Conflitos no agendamento
    try {
      const conflitos = await agendamentoRepository
        .createQueryBuilder("agendamento")
        .where("agendamento.id_labs = :id_labs", {
          id_labs: this.validatedData.id_labs,
        })
        .andWhere("agendamento.data_utilizacao = :data_utilizacao", {
          data_utilizacao: this.validatedData.data_utilizacao,
        })
        .andWhere("agendamento.status != :status", { status: "cancelado" })
        .andWhere("agendamento.deletedAt IS NULL")
        .andWhere(
          `(agendamento.hora_inicio BETWEEN :hora_inicio AND :hora_fim
            OR agendamento.hora_fim BETWEEN :hora_inicio AND :hora_fim
            OR (:hora_inicio BETWEEN agendamento.hora_inicio AND agendamento.hora_fim
            AND :hora_fim BETWEEN agendamento.hora_inicio AND agendamento.hora_fim))`,
          {
            hora_inicio: this.validatedData.hora_inicio,
            hora_fim: this.validatedData.hora_fim,
          }
        )
        .getMany();

      if (conflitos.length > 0) {
        this.addError(
          "hora_inicio",
          "Conflito de agendamento: laboratório já está reservado para este horário"
        );
        return false;
      }
    } catch (error) {
      this.addError(
        "hora_inicio",
        "Erro ao verificar conflitos de agendamento"
      );
      return false;
    }
    return this.isValid();
  }

  async validateUpdate() {
    this.clearValidatedData();

    const {
      id_labs,
      id_usuario,
      data_utilizacao,
      hora_inicio,
      hora_fim,
      finalidade,
      status,
    } = this.data;

    if (!this.validateNumber("id", "ID do Agendamento")) return false;
    if (id_labs !== undefined) this.data.id_labs = id_labs;
    if (id_usuario !== undefined) this.data.id_usuario = id_usuario;
    if (data_utilizacao !== undefined)
      this.data.data_utilizacao = data_utilizacao;
    if (hora_inicio !== undefined) this.data.hora_inicio = hora_inicio;
    if (hora_fim !== undefined) this.data.hora_fim = hora_fim;
    if (finalidade !== undefined) this.data.finalidade = finalidade;

    if (id_labs !== undefined) {
      if (!this.validateNumber("id_labs", "ID do Laboratório")) return false;
    }

    if (id_usuario !== undefined) {
      if (!this.validateNumber("id_usuario", "ID do Usuário")) return false;
    }

    if (finalidade !== undefined) {
      if (!this.validateNumber("finalidade", "Finalidade", 5)) return false;
    }

    if (hora_inicio !== undefined) {
      if (!this.validateNumber("hora_inicio", "Hora do início")) return false;
    }

    if (hora_fim !== undefined) {
      if (!this.validateNumber("hora_fim", "Hora do fim")) return false;
    }

    if (hora_inicio !== undefined && hora_fim !== undefined) {
      if (
        validationUtils.compareTimes(
          this.validatedData.hora_inicio,
          this.validatedData.hora_fim
        ) >= 0
      ) {
        this.addError(
          "hora_inicio",
          "A hora do início deve ser anterior à hora do fim"
        );
        return false;
      }

      const duracaoMinutos = validationUtils.getTimeDifferenceInMinutes(
        this.validatedData.hora_inicio,
        this.validatedData.hora_fim
      );

      if (duracaoMinutos < 30) {
        this.addError(
          "hora_inicio",
          "Duração mínima do agendamento é de 30 minutos"
        );
        return false;
      }
    }

    if (status !== undefined) {
      const statusValidos = ["pendente", "confirmado", "cancelado"];
      if (!statusValidos.includes(status)) {
        this.addError(
          "status",
          "Status deve ser: pendente, confirmado ou cancelado"
        );
        return false;
      }
      this.validatedData.status = status;
    }

    //Laboratório existe
    if (id_labs !== undefined) {
      try {
        const laboratorio = await labsRepository.findOne({
          where: { id: this.validatedData.id_labs, deletedAt: IsNull() },
        });

        if (!laboratorio) {
          this.addError("id_labs", "Laboratório não encontrado");
          return false;
        }
        this.validatedData.laboratorio = laboratorio;
      } catch (error) {
        this.addError("id_labs", "Erro ao verificar laboratório");
        return false;
      }
    }

    //Usuário existe
    if (id_usuario !== undefined) {
      try {
        const usuario = await usuarioRepository.findOne({
          where: { id: this.validatedData.id_usuario, deletedAt: IsNull() },
        });

        if (!usuario) {
          this.addError("id_usuario", "Usuário não encontrado");
          return false;
        }
        this.validatedData.usuario = usuario;
      } catch (error) {
        this.addError("id_usuario", "Erro ao verificar usuário");
        return false;
      }
    }

    //Conflitos de agendamento
    if (
      id_labs !== undefined ||
      data_utilizacao !== undefined ||
      hora_inicio !== undefined ||
      hora_fim !== undefined
    ) {
      try {
        const laboratorioId =
          id_labs !== undefined ? this.validatedData.id_labs : undefined;
        const dataUtil =
          data_utilizacao !== undefined
            ? this.validatedData.data_utilizacao
            : undefined;
        const horaInicio =
          hora_inicio !== undefined
            ? this.validatedData.hora_inicio
            : undefined;
        const horaFim =
          hora_fim !== undefined ? this.validatedData.hora_fim : undefined;

        if (laboratorioId && dataUtil && horaInicio && horaFim) {
          const conflitos = await agendamentoRepository
            .createQueryBuilder("agendamento")
            .where("agendamento.id_labs = :laboratorioId", { laboratorioId })
            .andWhere("agendamento.data_utilizacao = :dataUtil", { dataUtil })
            .andWhere("agendamento.status != :status", { status: "cancelado" })
            .andWhere("agendamento.deletedAt IS NULL")
            .andWhere("agendamento.id != :agendamentoId", {
              agendamentoId: this.validatedData.id,
            })
            .andWhere(
              `(agendamento.hora_inicio BETWEEN :horaInicio AND :horaFim 
               OR agendamento.hora_fim BETWEEN :horaInicio AND :horaFim
               OR (:horaInicio BETWEEN agendamento.hora_inicio AND agendamento.hora_fim
                   AND :horaFim BETWEEN agendamento.hora_inicio AND agendamento.hora_fim))`,
              { horaInicio, horaFim }
            )
            .getMany();

          if (conflitos.length > 0) {
            this.addError(
              "hora_inicio",
              "Conflito de agendamento: laboratório já reservado neste horário"
            );
            return false;
          }
        }
      } catch (error) {
        this.addError(
          "hora_inicio",
          "Erro ao verificar conflitos de agendamento"
        );
        return false;
      }
    }

    return this.isValid();
  }

  async validateDelete() {
    this.clearValidatedData();

    if (!this.validateNumber("id", "ID do Agendamento")) return false;

    return this.isValid();
  }

  async validateGetFiltros() {
    this.clearValidatedData();

    const { page, limit, status } = this.data;

    if (page !== undefined) {
      if (!this.validateRequiredNumber("page", "Página")) return false;
      this.validatedData.page = Math.max(1, Number(page));
    }

    if (limit !== undefined) {
      if (!this.validateRequiredNumber("limit", "Limite")) return false;
      this.validatedData.limit = Math.min(Math.max(1, Number(limit)), 100); // Max 100 por página
    }

    if (status !== undefined) {
      const statusValidos = ["pendente", "confirmado", "cancelado"];
      if (!statusValidos.includes(status)) {
        this.addError(
          "status",
          "Status deve ser: pendente, confirmado ou cancelado"
        );
        return false;
      }
      this.validatedData.status = status;
    }

    //Campos de texto para pesquisa
    const { nomeProfessor, laboratorio, data_utilizacao } = this.data;

    if (nomeProfessor !== undefined) {
      this.validatedData.nomeProfessor = nomeProfessor.toString().trim();
    }

    if (laboratorio !== undefined) {
      this.validatedData.laboratorio = laboratorio.toString().trim();
    }

    if (data_utilizacao !== undefined) {
      this.validatedData.data_utilizacao = data_utilizacao;
    }

    if (hora_inicio !== undefined) {
      if (!this.validateDate("hora_inicio", "Data inicial")) return false;
    }

    if (hora_fim !== undefined) {
      if (!this.validateDate("hora_fim", "Data final")) return false;
    }

    if ((hora_inicio && !hora_fim) || (!hora_inicio && hora_fim)) {
      this.addError(
        "hora_inicio",
        "Para filtrar por intervalo, forneça ambas as datas"
      );
      return false;
    }

    return this.isValid();
  }
}

export default AgendamentoRequestDTO;
