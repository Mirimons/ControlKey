import BaseDTO from "./BaseDTO.js";
import Equipamento from "../entities/equipamento.js";
import tipoEquip from "../entities/tipo_equip.js";
import { AppDataSource } from "../database/data-source.js";
import { IsNull, Not } from "typeorm";

const tipoEquipRepository = AppDataSource.getRepository(tipoEquip);
const equipRepository = AppDataSource.getRepository(Equipamento);

class EquipRequestDTO extends BaseDTO {
  async validateGetEquips() {
    this.clearValidatedData();

    const {
      desc_equip,
      id_tipo,
      tipo_desc,
      // page,
      // limit
    } = this.data;

    // this.validatedData.page = 1;
    // this.validatedData.limit = 10;

    // if (page !== undefined && page != null && page !== "") {
    //   if (!this.validateParamsId("page", "Página", 1, 1000)) return false;
    //   this.validatedData.page = Math.max(1, Number(page));
    // }

    // if (limit !== undefined && limit !== null && limit !== "") {
    //   if (!this.validateParamsId("limit", "Limite", 1, 100)) return false;
    //   this.validatedData.limit = Math.min(Math.max(1, Number(limit)), 100);
    // }

    if (desc_equip !== undefined && desc_equip !== null && desc_equip !== "") {
      if (!this.validateString("desc_equip", "Descrição do equipamento", 2))
        return false;
    }

    if (id_tipo !== undefined && id_tipo !== null && id_tipo !== "") {
      if (!this.validateForeignKeyId("id_tipo", "Tipo de Equipamento", false))
        return false;
      this.validatedData.filtro_tipo_tipo = "id";
    } else if (
      tipo_desc !== undefined &&
      tipo_desc !== null &&
      tipo_desc !== ""
    ) {
      if (!this.validateString("tipo_desc", "Tipo de equipamento", 2))
        return false;
      this.validatedData.filtro_tipo_tipo = "descricao";
    }
    return this.isValid();
  }

  async validateCreate() {
    this.clearValidatedData();
    const { tipo, desc_equip } = this.data;

    if (!this.validateString("tipo", "Tipo de equipamento", 2)) return false;

    try {
      const tipoFind = await tipoEquipRepository.findOne({
        where: {
          desc_tipo: this.validatedData.tipo,
          deletedAt: IsNull(),
        },
      });

      if (!tipoFind) {
        this.addError("tipo", "Tipo de equipamento não encontrado.");
        return false;
      }
      this.validatedData.id_tipo = tipoFind.id;
      this.validatedData.tipoEntity = tipoFind;
    } catch (error) {
      this.addError("tipo", "Erro ao buscar tipo de equipamento");
      return false;
    }

    if (!this.validateString("desc_equip", "Descrição do equipamento", 2))
      return false;

    try {
      const equipExiste = await equipRepository.findOne({
        where: {
          desc_equip: this.validatedData.desc_equip,
          deletedAt: IsNull(),
        },
      });
      if (equipExiste) {
        this.addError(
          "desc_equip",
          "Já existe um equipamento com esta descrição"
        );
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
    const { id, tipo, id_tipo, desc_equip } = this.data;

    if (!this.validateParamsId("id", "ID do Equipamento")) return false;

    // Tipo de Equipamento
    if (tipo !== undefined && tipo !== null && tipo !== "") {
      if (!this.validateString("tipo", "Tipo de equipamento", 2)) return false;

      try {
        const tipoFind = await tipoEquipRepository.findOne({
          where: {
            desc_tipo: this.validatedData.tipo,
            deletedAt: IsNull(),
          },
        });
        if (!tipoFind) {
          this.addError("tipo", "Tipo de equipamento não encontrado.");
          return false;
        }
        this.validatedData.id_tipo = tipoFind.id;
        this.validatedData.tipoEntity = tipoFind;
      } catch (error) {
        this.addError("tipo", "Erro ao buscar tipo de equipamento");
        return false;
      }
    } else if (id_tipo !== undefined && id_tipo !== null && id_tipo !== "") {
      if (
        !this.validateForeignKeyId(
          "id_tipo",
          "ID do Tipo de Equipamento",
          false
        )
      )
        return false;

      try {
        const tipoFind = await tipoEquipRepository.findOne({
          where: {
            id: this.validatedData.id_tipo,
            deletedAt: IsNull(),
          },
        });

        if (!tipoFind) {
          this.addError(
            "id_tipo",
            "Tipo de equipamento informado não encontrado."
          );
          return false;
        }
        this.validatedData.tipoEntity = tipoFind;
      } catch (error) {
        this.addError("id_tipo", "Erro ao validar tipo de equipamento");
        return false;
      }
    }

    if (desc_equip !== undefined && desc_equip !== null && desc_equip !== "") {
      if (!this.validateString("desc_equip", "Descrição do equipamento", 2))
        return false;

      try {
        const equipExiste = await equipRepository.findOne({
          where: {
            desc_equip: this.validatedData.desc_equip,
            deletedAt: IsNull(),
            id: Not(this.validatedData.id),
          },
        });
        if (equipExiste) {
          this.addError(
            "desc_equip",
            "Já existe um equipamento com esta descrição"
          );
          return false;
        }
      } catch (error) {
        this.addError("desc_equip", "Erro ao verificar equipamento existente");
        return false;
      }
    }

    return this.isValid();
  }

  async validateDelete() {
    this.clearValidatedData();
    if (!this.validateParamsId("id", "ID do Equipamento")) return false;
    return this.isValid();
  }
}

export default EquipRequestDTO;
