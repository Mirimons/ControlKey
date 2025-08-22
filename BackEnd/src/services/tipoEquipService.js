import TipoEquip from "../entities/tipo_equip.js";
import { AppDataSource } from "../database/data-source.js";
import { Like, IsNull } from "typeorm";

const tipoEquipRepository = AppDataSource.getRepository(TipoEquip);

class TipoEquipService {
    async getTiposEquip() {
        return await tipoEquipRepository.findBy({ deletedAt: IsNull() });
    }
    async getByDescricao(descricao) {
        return await tipoEquipRepository.findBy({
            desc_tipo: Like(`%${descricao}%`),
            deletedAt: IsNull(),
        });
    }
    async postTipoEquip(tipoEquipData) {
        if (
            !tipoEquipData.desc_tipo ||
            tipoEquipData.desc_tipo.trim().length < 1
        ) {
            throw new Error("O campo 'desc_tipo' deve ter pelo menos um caractere.");
        }
        const newTipoEquip = tipoEquipRepository.create({
            desc_tipo: tipoEquipData.desc_tipo.trim(),
        });
        await tipoEquipRepository.save(newTipoEquip);
        return newTipoEquip;
    }
    async putTipoEquip(id, tipoEquipData) {
        if (isNaN(Number(id))) {
            throw new Error("O 'id' precisa ser um valor numérico.");
        }
        if (
            !tipoEquipData.desc_Tipo ||
            tipoEquipData.desc_tipo.trim().length < 1
        ) {
            throw new Error("O campo 'desc_tipo' deve ter pelo menos um caractere.");
        }
        await tipoEquipRepository.update(
            { id },
            {
                desc_Tipo: tipoEquipData.desc_Tipo.trim(),
            }
        );
        return await tipoEquipRepository.findOneBy({ id });
    }
    async deleteTipoEquip(id) {
        if (isNaN(Number(id))) {
            throw new Error("O 'id' precisa ser um valor numérico.");
        }
        await tipoEquipRepository.update({ id }, {
            deletedAt: () => "CURRENT_TIMESTAMP"
        });
        return true;
    }
}

export default new TipoEquipService();