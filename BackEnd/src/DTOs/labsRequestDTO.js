import BaseDTO from "./BaseDTO.js";
import Labs from "../entities/labs.js";
import { AppDataSource } from "../database/data-source.js";
import { IsNull, Not } from "typeorm";

const labsRepository = AppDataSource.getRepository(Labs);

class LabsRequestDTO extends BaseDTO {
  async validateGetLabs() {
    this.clearValidatedData();

    const { nome_lab, desc_lab, status, page, limit } = this.data;

    this.validatedData.page = 1;
    this.validatedData.limit = 10;

    if (page !== undefined && page != null && page !== "") {
      if (!this.validateParamsId("page", "Página", 1, 1000)) return false;
      this.validatedData.page = Math.max(1, Number(page));
    }

    if (limit !== undefined && limit !== null && limit !== "") {
      if (!this.validateParamsId("limit", "Limite", 1, 100)) return false;
      this.validatedData.limit = Math.min(Math.max(1, Number(limit)), 100);
    }

    if (nome_lab !== undefined && nome_lab !== null && nome_lab !== "") {
      if (!this.validateString("nome_lab", "Nome do laboratório", 2))
        return false;
      this.validatedData.nome_lab = nome_lab.trim();
    }

    if (desc_lab !== undefined && desc_lab !== null && desc_lab !== "") {
      if (!this.validateString("desc_lab", "Descrição", false)) return false;
      this.validatedData.desc_lab = desc_lab.trim();
    }
    if (status !== undefined) {
      const statusValidos = ["livre", "ocupado"];
      if (!statusValidos.includes(status)) {
        this.addError("status", "Status deve ser: livre ou ocupado");
        return false;
      }
      this.validatedData.status = status;
    }
    return this.isValid();
  }

  async validateCreate() {
    this.clearValidatedData();
    const { nome_lab, desc_lab, status } = this.data;
    // this.validatedData.nome_lab = nome_lab;
    // this.validatedData.desc_lab = desc_lab;
    if (!this.validateString("nome_lab", "Nome do laboratório", 2)) {
      return false;
    }
    if (!this.validateString("desc_lab", "Descrição do laboratório", 2)) {
      return false;
    }

    if (status !== undefined && status !== null && status !== "") {
      const statusValidos = ["livre", "ocupado"];
      if (!statusValidos.includes(status.toLowerCase())) {
        this.addError("status", "Status deve ser: livre ou ocupado");
        return false;
      }
      this.validatedData.status = status.toLowerCase();
    } else {
      this.validatedData.status = "livre";
    }

    try {
      const labExiste = await labsRepository.findOne({
        where: {
          nome_lab: this.validatedData.nome_lab,
          deletedAt: IsNull(),
        },
      });
      if (labExiste) {
        this.addError("nome_lab", "Já existe um laboratório com este nome");
        return false;
      }
    } catch (error) {
      this.addError("nome_lab", "Erro ao verificar laboratório existente");
      return false;
    }
    return this.isValid();
  }
  async validateUpdate() {
    this.clearValidatedData();
    const { nome_lab, desc_lab, status } = this.data;

    if (!this.validateParamsId("id", "ID do Laboratório")) return false;

    if (desc_lab !== undefined) {
      if (!this.validateString("desc_lab", "Descrição do laboratório", 2)) {
        return false;
      }
    }
    if (nome_lab !== undefined) {
      if (!this.validateString("nome_lab", "Nome do laboratório", 2)) {
        return false;
      }

      try {
        const labExiste = await labsRepository.findOne({
          where: {
            nome_lab: this.validatedData.nome_lab,
            deletedAt: IsNull(),
            id: Not(this.validatedData.id),
          },
        });
        if (labExiste) {
          this.addError("nome_lab", "Já existe um laboratório com este nome");
          return false;
        }
      } catch (error) {
        console.error("Erro ao verificar laboratório:", error);
        this.addError("nome_lab", "Erro ao verificar laboratório existente");
        return false;
      }
    }

    if (status !== undefined && status !== null && status !== "") {
      const statusValidos = ["livre", "ocupado"];
      if (!statusValidos.includes(status.toLowerCase())) {
        this.addError("status", "Status deve ser: livre ou ocupado");
        return false;
      }
      this.validatedData.status = status.toLowerCase();
    }
    return this.isValid();
  }
  async validateDelete() {
    this.clearValidatedData();

    if (!this.data.id && isNaN(Number(this.data.id))) {
      this.addError("id", "O ID é obrigatório e precisa ser numérico.");
      return false;
    }

    this.validatedData.id = Number(this.data.id);
    return this.isValid();
  }
}

export default LabsRequestDTO;
