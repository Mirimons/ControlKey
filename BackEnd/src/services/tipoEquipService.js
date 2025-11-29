import TipoEquip from "../entities/tipo_equip.js";
import { AppDataSource } from "../database/data-source.js";
import { Like, IsNull } from "typeorm";

const tipoEquipRepository = AppDataSource.getRepository(TipoEquip);

class TipoEquipService {
  async getTiposEquip() {
    return await tipoEquipRepository.findBy({ deletedAt: IsNull() });
  }

  async getTipoById(id) {
    return await tipoEquipRepository.findOne({
      where: { id, deletedAt: IsNull() },
    });
  }

  async getByDescricao(descricao) {
    return await tipoEquipRepository.findBy({
      desc_tipo: Like(`%${descricao}%`),
      deletedAt: IsNull(),
    });
  }

  async postTipoEquip(tipoEquipData) {
    const { desc_tipo } = tipoEquipData;

    const newTipoEquip = tipoEquipRepository.create({
      desc_tipo: desc_tipo,
    });

    await tipoEquipRepository.save(newTipoEquip);
    return newTipoEquip;
  }

  async putTipoEquip(id, tipoEquipData) {
    const { desc_tipo } = tipoEquipData;
    await tipoEquipRepository.update(
      { id },
      {
        desc_tipo: desc_tipo,
      }
    );
    return await tipoEquipRepository.findOneBy({ id });
  }
  async deleteTipoEquip(id) {
    //Verificar se existe
    const tipoEquip = await this.getTipoById(id);
    if (!tipoEquip) {
      throw new Error("Tipo de equipamento não encontrado.");
    }

    //Verifica se existem dependências
    const equipamentosAtivos = await AppDataSource.getRepository("Equipamento")
      .createQueryBuilder("equipamento")
      .where("equipamento.id_tipo = :id", { id })
      .andWhere("equipamento.deletedAt IS NULL")
      .getCount();

    if (equipamentosAtivos > 0) {
      throw new Error(
        "Não é possível desativar este tipo de equipamento, pois existem equipamentos ativos vinculados a ele."
      );
    }

    await tipoEquipRepository.update(
      { id: Number(id) },
      {
        deletedAt: () => "CURRENT_TIMESTAMP",
      }
    );
    return true;
  }
}

export default new TipoEquipService();
