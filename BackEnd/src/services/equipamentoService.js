import TipoEquip from "../entities/tipo_equip.js";
import Equip from "../entities/equipamento.js";
import { AppDataSource } from "../database/data-source.js";
import { Like, IsNull } from "typeorm";

const tipoEquipRepository = AppDataSource.getRepository(TipoEquip);
const equipamentoRepository = AppDataSource.getRepository(Equip);

class EquipService {
  async getEquip() {
    return await equipamentoRepository.findBy({ deletedAt: IsNull() });
  }
  async getByDesc(desc) {
    return await equipamentoRepository.findBy({
      desc: Like(`%${desc}%`),
      deletedAt: IsNull(),
    });
  }

  async postEquip(equipData) {
    const { id_tipo, desc_equip, status } = equipData;

    const tipo_equip = await tipoEquipRepository.findOneBy({
      id: Number(id_tipo),
      deletedAt: IsNull(),
    });

    const statusLower = (status || "livre")?.toLowerCase();
    const newEquipamento = equipamentoRepository.create({
      id_tipo: Number(id_tipo),
      tipo: tipo_equip,
      desc_equip: desc_equip,
      status: statusLower,
      createdAt: new Date(),
    });

    await equipamentoRepository.save(newEquipamento);
    return newEquipamento;
  }

  async putEquip(id, equipData) {
    const { id_tipo, desc_equip, status } = equipData;

    const statusLower = (status || "livre")?.toLowerCase();

    
    // const tipo_equip = await tipoEquipRepository.findOneBy({
    //   id: Number(id_tipo),
    //   deletedAt: IsNull(),
    // });
    await equipamentoRepository.update(
      { id },
      {
        id_tipo,
        status: statusLower,
        desc_equip: desc_equip,
      }
    );
    return await equipamentoRepository.findOneBy({ id });
  }
  async deleteEquip(id) {
    await equipamentoRepository.update({ id }, { deletedAt: new Date() });
    return true;
  }
}
export default new EquipService();
