import BaseDTO from "./BaseDTO.js";
import Labs from "../entities/labs.js";
import { AppDataSource } from "../database/data-source.js";
import { IsNull, Not } from "typeorm";

const labRepository = AppDataSource.getRepository(Labs);

class LabRequestDTO extends BaseDTO {
    async validateCreate() {
        this.clearValidatedData();
        const { nome_lab, desc_lab } = this.data;
        this.data.nome_lab = nome_lab
        this.data.desc_lab = desc_lab
        if (!this.validateString("nome_lab", "Nome do laboratório", 2)) {
            return false;
        }
        if (!this.validateString("desc_lab", "Descrição do laboratório", 2)) {
            return false;
        }
        try {
            const labExiste = await labRepository.findOne({
                where: {
                    nome_lab: this.validatedData.nome_lab,
                    deletedAt: IsNull(),
                },
            });
            if (labExiste) {
                this.addError(
                    "nome_lab",
                    "Já existe um laboratório com este nome"
                );
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
        const { nome_lab, desc_lab } = this.data;

    if (!this.data.id && isNaN(Number(this.data.id))) {
      this.addError('id', 'O ID é obrigatório e precisa ser um valor numérico.');
      return false;
    }
    this.validatedData.id = Number(this.data.id);

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
                const labExiste = await labRepository.findOne({
                    where: {
                        nome_lab: this.validatedData.nome_lab,
                        deletedAt: IsNull(),
                        id: Not(this.validatedData.id)
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
        return this.isValid();
    }
  async validateDelete() {
    this.clearValidatedData();

     if(!this.data.id && isNaN(Number(this.data.id))) {
      this.addError('id', 'O ID é obrigatório e precisa ser numérico.');
      return false;
    }

    this.validatedData.id = Number(this.data.id);
    return this.isValid();
  }
}

export default LabRequestDTO;