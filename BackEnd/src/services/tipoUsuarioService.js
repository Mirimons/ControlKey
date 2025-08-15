import TipoUsuario from "../entities/tipo_usuario.js";
import { AppDataSource } from "../database/data-source.js";
import { Like, IsNull } from "typeorm";

const tipoUsuarioRepository = AppDataSource.getRepository(TipoUsuario);

class TipoUsuarioService {
  async getTiposUsuario() {
    return await tipoUsuarioRepository.findBy({ deletedAt: IsNull() });
  }

  async getByDescricao(descricao) {
    return await tipoUsuarioRepository.findBy({
      desc_tipo: Like(`%${descricao}%`),
      deletedAt: IsNull(),
    });
  }

  async postTipoUsuario(tipoUsuarioData) {
    if (
      !tipoUsuarioData.desc_tipo ||
      tipoUsuarioData.desc_tipo.trim().length < 1
    ) {
      throw new Error("O campo 'desc_tipo' deve ter pelo menos um caractere.");
    }

    const newTipoUsuario = tipoUsuarioRepository.create({
      desc_tipo: tipoUsuarioData.desc_tipo.trim(),
    });

    await tipoUsuarioRepository.save(newTipoUsuario);
    return newTipoUsuario;
  }

  async putTipoUsuario(id, tipoUsuarioData) {
    if (isNaN(Number(id))) {
      throw new Error("O 'id' precisa ser um valor numérico.");
    }

    if (
      !tipoUsuarioData.desc_Tipo ||
      tipoUsuarioData.desc_tipo.trim().length < 1
    ) {
      throw new Error("O campo 'desc_tipo' deve ter pelo menos um caractere.");
    }

    await tipoUsuarioRepository.update(
      { id },
      {
        desc_Tipo: tipoUsuarioData.desc_Tipo.trim(),
      }
    );

    return await tipoUsuarioRepository.findOneBy({ id });
  }

  async deleteTipoUsuario(id) {
    if(isNaN(Number(id))) {
        throw new Error("O 'id' precisa ser um valor numérico.");
    }

    await tipoUsuarioRepository.update({id}, {
        deletedAt: () => "CURRENT_TIMESTAMP"
    });

    return true;
  }
}

export default new TipoUsuarioService();