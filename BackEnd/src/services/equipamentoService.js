import TipoEquip from "../entities/tipo_equip.js";
import Equip from "../entities/equipamento.js";
import { AppDataSource } from "../database/data-source.js";
import { Like, IsNull } from "typeorm";

const tipoEquipRepository = AppDataSource.getRepository(TipoEquip)
const equipamentoRepository = AppDataSource.getRepository(Equip)

class EquipService {
    async getEquip() {
        return await equipamentoRepository.findBy({ deletedAt: IsNull() })
    }
    async getByDesc(desc) {
        return await equipamentoRepository.findBy({
            desc: Like(`%${desc}%`),
            deletedAt: IsNull()
        });
    }

    async postEquip(equipData) {
        const { id_tipo, desc_equip } = equipData;
        if (!id_tipo && isNaN(Number(id_tipo))) {
            throw new Error("O campo 'id_tipo' é obrigatório e precisa ser numérico.");
        }
        if (!desc_equip && desc_equip.length < 1) {
            throw new Error("O campo 'desc_equip' é obrigatório deve ter pelo menos um caractere.");
        }
        const tipo_equip = await tipoEquipRepository.findOneBy({
            id: Number(id_tipo),
            deletedAt: IsNull()
        });

        if (!tipo_equip) {
            throw new Error("Tipo de equipamento infomado não encontrado.");
        }

        const newEquipamento = equipamentoRepository.create({
            id_tipo: Number(id_tipo),
            tipo: tipo_equip,
            desc_equip,
            createdAt: new Date()
        });

        await equipamentoRepository.save(newEquipamento);
        return newEquipamento;
    }
    async putEquip(id, equipData) {
        const { id_tipo, desc_equip } = equipData;
        if (!id && isNaN(Number(id))) {
            throw new Error("O campo 'id' precisa ser um valor numérico.");
        }
        if (!id_tipo && isNaN(Number(id_tipo))) {
            throw new Error("O campo 'id_tipo' é obrigatório e precisa ser numérico.");
        }
        if (!desc_equip && desc_equip.length < 1) {
            throw new Error("O campo 'desc_equip' é obrigatório deve ter pelo menos um caractere.");
        }
        const tipo_equip = await tipoEquipRepository.findOneBy({
             id: Number(id_tipo),
             deletedAt: IsNull()
        });
        if (!tipo_equip) {
             return response.status(404).send({ "response": "Tipo de equipamento informado não encontrado." });
        }
        await equipamentoRepository.update({id}, {
            id_tipo,
            desc_equip
        });
        return await equipamentoRepository.findOneBy({ id })
    }
      async deleteEquip(id) {
    if (isNaN(Number(id))) {
      throw new Error("O id precisa ser um valor numérico.");
    }

    await equipamentoRepository.update({ id }, { deletedAt: () => new Date()});
    return true;
  }
}
export default new EquipService();