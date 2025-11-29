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
    queryBuilder.orderBy("equipamento.desc_equip", "ASC");
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
    //Verifica se existe
    const equip = await this.getEquipById(id);
    if (!equip) {
      throw new Error("Equipamento não encontrado.");
    }

    //Verifica se existem dependências
    const controlsAtivos = await AppDataSource.getRepository("Control")
      .createQueryBuilder("control")
      .where("control.id_equip = :id", { id })
      .andWhere("control.deletedAt IS NULL")
      .getCount();

    if (controlsAtivos > 0) {
      throw new Error(
        "Não é possível desativar este equipamento, pois existem controles ativos vinculados a ele."
      );
    }

    await equipamentoRepository.update(
      { id: Number(id) },
      { deletedAt: new Date() }
    );
    return true;
  }

  //MÉTODOS PARA ATIVAÇÃO/REATIVAÇÃO
  //Get apenas com os inativos
  async getInactiveEquip() {
    const queryBuilder = equipamentoRepository
      .createQueryBuilder("equipamento")
      .leftJoinAndSelect("equipamento.tipo", "tipo")
      .withDeleted()
      .where("equipamento.deletedAt IS NOT NULL");

    queryBuilder.orderBy("equipamento.deletedAt", "DESC");

    const [equipamentos, total] = await queryBuilder.getManyAndCount();

    return {
      data: equipamentos,
      total,
    };
  }

  //Get que inclui os inativos
  async getEquipByIdIncludingInactive(id) {
    return await equipamentoRepository.findOne({
      where: { id },
      relations: ["tipo"],
      withDeleted: true,
    });
  }

  //Função para reativar equipamento
  async activateEquip(id) {
    if (isNaN(Number(id))) {
      throw new Error("O id precisa ser um valor numérico.");
    }

    const equipInativo = await this.getEquipByIdIncludingInactive(id);
    if (!equipInativo) {
      throw new Error("Equipamento não encontrado.");
    }

    await equipamentoRepository.update({ id }, { deletedAt: null });

    return await this.getEquipById(id);
  }
}

export default new EquipService();
