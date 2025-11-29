import TipoUsuario from "../entities/tipo_usuario.js";
import { AppDataSource } from "../database/data-source.js";
import { Like, IsNull } from "typeorm";

const tipoUsuarioRepository = AppDataSource.getRepository(TipoUsuario);

class TipoUsuarioService {
  async getTiposUsuario() {
    return await tipoUsuarioRepository.findBy({ deletedAt: IsNull() });
  }

  async getTipoById(id) {
    return await tipoUsuarioRepository.findOne({
      where: { id, deletedAt: IsNull() },
    });
  }

  async getByDescricao(descricao) {
    return await tipoUsuarioRepository.findBy({
      desc_tipo: Like(`%${descricao}%`),
      deletedAt: IsNull(),
    });
  }

  async postTipoUsuario(tipoUsuarioData) {
    const { desc_tipo } = tipoUsuarioData;

    const newTipoUsuario = tipoUsuarioRepository.create({
      desc_tipo: desc_tipo,
    });

    await tipoUsuarioRepository.save(newTipoUsuario);
    return newTipoUsuario;
  }

  async putTipoUsuario(id, tipoUsuarioData) {
    const { desc_tipo } = tipoUsuarioData;

    await tipoUsuarioRepository.update(
      { id: Number(id) },
      {
        desc_tipo: desc_tipo,
      }
    );

    return await tipoUsuarioRepository.findOneBy({ id });
  }

  async deleteTipoUsuario(id) {
    //Verificar se existe
    const tipoUsuario = await this.getTipoById(id);
    if (!tipoUsuario) {
      throw new Error("Tipo de usuário não encontrado.");
    }

    //Verifica se existem usuários ativos com este tipo
    const usuariosAtivos = await AppDataSource.getRepository("Usuario")
      .createQueryBuilder("usuario")
      .where("usuario.id_tipo = :id", { id })
      .andWhere("usuario.deletedAt IS NULL")
      .getCount();

    if (usuariosAtivos > 0) {
      throw new Error(
        "Não é possível desativar este tipo de usuário, pois existem usuários ativos vinculados a ele."
      );
    }

    //Se não houver dependências, faz o Soft Delete
    await tipoUsuarioRepository.update(
      { id: Number(id) },
      {
        deletedAt: () => "CURRENT_TIMESTAMP",
      }
    );

    return true;
  }
}

export default new TipoUsuarioService();
