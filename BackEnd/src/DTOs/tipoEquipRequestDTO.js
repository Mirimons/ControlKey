import BaseDTO from "./BaseDTO.js";
import TipoEquip from "../entities/tipo_equip.js";
import { AppDataSource } from "../database/data-source.js";
import { IsNull, Not } from "typeorm";

const tipoEquipRepository = AppDataSource.getRepository(TipoEquip);

class TipoEquipRequestDTO extends BaseDTO {
    async validateCreate() {
        this.clearValidatedData();
        const { desc_tipo } = this.data;

        this.data.desc_tipo = desc_tipo;
        if (!this.validateString("desc_tipo", "Descrição do tipo", 2)) {
            return false;
        }
        try {
            const tipoExiste = await tipoEquipRepository.findOne({
                where: {
                    desc_tipo: this.validatedData.desc_tipo,
                    deletedAt: IsNull(),
                },
            });
            if (tipoExiste) {
                this.addError(
                    "desc_tipo",
                    "Já existe um tipo de equipamento com esta descrição"
                );
                return false;
            }
        } catch (error) {
            this.addError("desc_tipo", "Erro ao verificar tipo de equipamento existente");
            return false;
        }
        return this.isValid();
    }
  async validateUpdate() {
    this.clearValidatedData();

    const { desc_tipo } = this.data;

    if(!this.data.id && isNaN(Number(this.data.id))) {
      this.addError('id', 'O ID é obrigatório e precisa ser numérico.');
      return false;
    }

    this.validatedData.id = Number(this.data.id);

    if (desc_tipo !== undefined) {
      this.data.desc_tipo = desc_tipo;

      if (desc_tipo !== undefined) {
        if (!this.validateString("desc_tipo", "Descrição do tipo", 2)) {
          return false;
        }

        try {
          const tipoExiste = await tipoEquipRepository.findOne({
            where: {
              desc_tipo: this.validatedData.desc_tipo,
              deletedAt: IsNull(),
              id: Not(this.validatedData.id)
            },
          });
          if (tipoExiste) {
            this.addError(
              "desc_tipo",
              "Já existe um tipo de equipamento com esta descrição"
            );
            return false;
          }
        } catch (error) {
          this.addError(
            "desc_tipo",
            "Erro ao verificar tipo de equipamento existente"
          );
          return false;
        }
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
export default TipoEquipRequestDTO;