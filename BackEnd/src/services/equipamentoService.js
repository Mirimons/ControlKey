import TipoEquip from "../entities/tipo_equip.js";
import Equip from "../entities/equipamento.js";
import { AppDataSource } from "../database/data-source.js";
import { Like, IsNull } from "typeorm";

const tipoEquipRepository = AppDataSource.getRepository(TipoEquip);
const equipamentoRepository = AppDataSource.getRepository(Equip);

class EquipService {
   async getEquipById(id) {
      return await equipamentoRepository.findOne({
        where: { id, deletedAt: IsNull() },
        relations: ["tipo"],
      });
    }

  async getEquip(filtros = {}) {
    const {
      desc_equip,
      id_tipo,
      tipo_desc,
      filtro_tipo_tipo,
      // page = 1,
      // limit = 10,
    } = filtros;

    // const skip = (page - 1) * limit;

    const queryBuilder = equipamentoRepository
      .createQueryBuilder("equipamento")
      .leftJoinAndSelect("equipamento.tipo", "tipo")
      .where("equipamento.deletedAt IS NULL");

    if (desc_equip) {
      queryBuilder.andWhere("equipamento.desc_equip LIKE :desc_equip", {
        desc_equip: `%${desc_equip}%`,
      });
    }

    if (filtro_tipo_tipo === "id") {
      queryBuilder.andWhere("equipamento.id_tipo = :id_tipo", { id_tipo });
    } else if (filtro_tipo_tipo === "descricao") {
      queryBuilder.andWhere("tipo.desc_tipo LIKE :tipo_desc", {
        tipo_desc: `%${tipo_desc}%`,
      });
    }
    queryBuilder
      .orderBy("equipamento.desc_equip", "ASC")
      // .skip(skip)
      // .take(limit);

    const [equipamentos, total] = await queryBuilder.getManyAndCount();

    return {
      data: equipamentos,
      // pagination: {
      //   page,
      //   limit,
      //   total,
      //   totalPages: Math.ceil(total / limit),
      // },
    };
  }

  async getByDesc(desc_equip) {
    return await equipamentoRepository.findBy({
      where: { desc_equip: Like(`%${desc_equip}%`), deletedAt: IsNull() },
      relations: ["tipo"],
    });
  }

  async postEquip(equipData) {
    const { id_tipo, desc_equip, status } = equipData;

    const statusLower = (status || "livre")?.toLowerCase();
    const newEquipamento = equipamentoRepository.create({
      id_tipo: id_tipo,
      desc_equip: desc_equip,
      status: statusLower,
      createdAt: new Date(),
    });

    await equipamentoRepository.save(newEquipamento);

    return await equipamentoRepository.findOne({
      where: { id: newEquipamento.id },
      relations: ["tipo"],
    });
  }

  async putEquip(id, equipData) {
    const { id_tipo, desc_equip, status } = equipData;

    const statusLower = (status || "livre")?.toLowerCase();

    const updateData = {};
    if (id_tipo !== undefined) updateData.id_tipo = id_tipo;
    if (desc_equip !== undefined) updateData.desc_equip = desc_equip;
    if (status !== undefined) updateData.status = statusLower;

    if (Object.keys(updateData).length > 0) {
      await equipamentoRepository.update({ id }, updateData);
    }

    return await equipamentoRepository.findOne({
      where: { id },
      relations: ["tipo"],
    });
  }
  async deleteEquip(id) {
    await equipamentoRepository.update({ id }, { deletedAt: new Date() });
    return true;
  }
}
export default new EquipService();
