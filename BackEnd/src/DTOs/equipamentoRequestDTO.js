import BaseDTO from "./BaseDTO.js";
import Equipamento from "../entities/equipamento.js";
import tipoEquip from "../entities/tipo_equip.js";
import { AppDataSource } from "../database/data-source.js";
import { IsNull } from "typeorm";

const tipoEquipRepository = AppDataSource.getRepository(tipoEquip);
const equipRepository = AppDataSource.getRepository(Equipamento);

class EquipRequestDTO extends BaseDTO {
    async validateCreate() {
        this.clearValidatedData();
        const { id_tipo, desc_equip } = this.data;

        this.data.desc_equip = desc_equip;

        if (!id_tipo && isNaN(Number(id_tipo))) {
      this.addError('id_tipo', 'O Tipo de Usuário é obrigatório e precisa ser numérico.');
      return false;
        }
        this.validatedData.id_tipo = Number(id_tipo);

        if (!desc_equip && !desc_equip.trim() && desc_equip.trim().length < 2) {
            this.addError("desc_equip", "A descrição do equipamento deve ter pelo menos 2 caracteres.");
            return false;
        }
        this.validatedData.desc_equip = desc_equip.trim();

        try {
            const tipoEquip = await tipoEquipRepository.findOne({
                where: {
                id: Number(id_tipo),
                deletedAt: IsNull(),
            }
            });

            if (!tipoEquip) {
                this.addError("id_tipo", "Tipo de equipamento informado não encontrado.");
                return false;
            }  
            this.validatedData.tipo = tipoEquip;
        } catch (error) {
            this.addError("id_tipo", "Erro ao validar tipo de equipamento");
            return false;
        }
        try {
            const equipExiste = await equipRepository.findOne({
                where: {
                desc_equip: this.validatedData.desc_equip,
                deletedAt: IsNull()
                }
            });
            if (equipExiste) {
                this.addError(
                    "Já existe um equipamento com esta descrição");
                    return false;

            }
        } catch (error) {
            this.addError("desc_equip", "Erro ao verificar equipamento existente");
            return false;
        }
        return this.isValid();
    }
    async validateUpdate() {
        this.clearValidatedData();
        const { id_tipo, desc_equip } = this.data;

        if (!id_tipo && isNaN(Number(id_tipo))) {
      this.addError('id_tipo', 'O Tipo de Usuário é obrigatório e precisa ser numérico.');
      return false;
        }
        this.validatedData.id_tipo = Number(id_tipo);

        if (!desc_equip && !desc_equip.trim() && desc_equip.trim().length < 2) {
            this.addError("desc_equip", "A descrição do equipamento deve ter pelo menos 2 caracteres.");
            return false;
        }
        this.validatedData.desc_equip = desc_equip.trim();
                try {
            const equipExiste = await equipRepository.findOne({
                where: {
                desc_equip: this.validatedData.desc_equip,
                deletedAt: IsNull()
                }
            });
            if (equipExiste) {
                this.addError(
                    "Já existe um equipamento com esta descrição");
                    return false;
            }
        } catch (error) {
            this.addError("desc_equip", "Erro ao verificar equipamento existente");
            return false;
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

export default EquipRequestDTO