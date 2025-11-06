import Usuario from "../entities/usuario.js";
import UsuarioCad from "../entities/usuario_cad.js";
import { AppDataSource } from "../database/data-source.js";
import { IsNull } from "typeorm";
import bcrypt from "bcrypt";

const usuarioRepository = AppDataSource.getRepository(Usuario);
const usuarioCadRepository = AppDataSource.getRepository(UsuarioCad);

class UsuarioService {
  async getUsuarioById(id) {
    return await usuarioRepository.findOne({
      where: { id, deletedAt: IsNull() },
      relations: ["tipo", "usuario_cad"],
    });
  }

  //Filtros
  async getUsuarios(validatedData = {}) {
    const {
      nome,
      id_tipo,
      tipo_desc,
      filtro_tipo_tipo,
      // page = 1,
      // limit = 10,
    } = validatedData;

    // const skip = (page - 1) * limit;

    const queryBuilder = usuarioRepository
      .createQueryBuilder("usuario")
      .leftJoinAndSelect("usuario.tipo", "tipo")
      .leftJoinAndSelect("usuario.usuario_cad", "usuario_cad")
      .where("usuario.deletedAt IS NULL");

    // Filtro por nome
    if (nome) {
      queryBuilder.andWhere("usuario.nome LIKE :nome", { nome: `%${nome}%` });
    }
    // Filtro por tipo de usuário - flexível
    if (filtro_tipo_tipo === "id") {
      queryBuilder.andWhere("usuario.id_tipo = :id_tipo", {
        id_tipo: Number(id_tipo),
      });
    } else if (filtro_tipo_tipo === "descricao") {
      queryBuilder.andWhere("tipo.desc_tipo LIKE :tipo_desc", {
        tipo_desc: `%${tipo_desc}`,
      });
    }

    // Ordenação e paginação
    queryBuilder.orderBy("usuario.nome", "ASC")
    // .skip(skip)
    // .take(limit);

    const [usuarios, total] = await queryBuilder.getManyAndCount();

    return {
      data: usuarios,
      // pagination: {
      //   page,
      //   limit,
      //   total,
      //   totalPages: Math.ceil(total / limit),
      // },
    };
  }

  cadastroExtra(id_tipo) {
    const tipoCad = [1, 2];
    return tipoCad.includes(Number(id_tipo));
  }

  async postUsuario(usuarioData) {
    // Dados já validados no DTO
    const {
      id_tipo,
      nome,
      cpf,
      data_nasc,
      telefone,
      requiresCadastroExtra,
      matricula,
      email,
      senha,
      tipo,
    } = usuarioData;

    // Criação do usuário base
    const newUsuario = usuarioRepository.create({
      id_tipo: Number(id_tipo),
      tipo: tipo,
      nome: nome,
      cpf: cpf,
      data_nasc: data_nasc,
      telefone: telefone,
      createdAt: new Date(),
    });

    // Criação do UsuarioCad (se necessário)
    if (requiresCadastroExtra) {
      const hashedPassword = senha ? await bcrypt.hash(senha, 10) : null;

      newUsuario.usuario_cad = usuarioCadRepository.create({
        matricula: matricula,
        email: email,
        senha: hashedPassword,
        createdAt: new Date(),
      });
    }

    await usuarioRepository.save(newUsuario);

    const usuarioCompleto = await usuarioRepository.findOne({
      where: { id: newUsuario.id },
      relations: ["tipo", "usuario_cad"],
    });

    return usuarioCompleto;
  }

  async putUsuario(id, usuarioData) {
    // Dados já validados no DTO
    const {
      id_tipo,
      nome,
      cpf,
      data_nasc,
      telefone,
      requiresCadastroExtra,
      matricula,
      email,
      senha,
      tipo,
    } = usuarioData;

    const currentUsuario = await usuarioRepository.findOne({
      where: { id, deletedAt: IsNull() },
      relations: ["usuario_cad", "tipo"],
    });

    if (!currentUsuario) {
      throw new Error("Usuário não encontrado.");
    }

    // Atualização dos dados básicos
    const updateData = {};
    if (id_tipo !== undefined) updateData.id_tipo = Number(id_tipo);
    if (nome !== undefined) updateData.nome = nome;
    if (cpf !== undefined) updateData.cpf = cpf;
    if (data_nasc !== undefined) updateData.data_nasc = data_nasc;
    if (telefone !== undefined) updateData.telefone = telefone;

    if (Object.keys(updateData).length > 0) {
      await usuarioRepository.update({ id }, updateData);
    }

    // Atualização do cadastro extra
    if (requiresCadastroExtra) {
      const updateCadData = {};

      if (matricula !== undefined) updateCadData.matricula = matricula;
      if (email !== undefined) updateCadData.email = email;

      if (senha !== undefined && senha.trim() !== "") {
        updateCadData.senha = await bcrypt.hash(senha, 10);
      }

      //Se já existe usuarioCad, atualiza
      if (currentUsuario.usuario_cad) {
        if (Object.keys(updateCadData).length > 0) {
          await usuarioCadRepository.update(
            { id_usuario: currentUsuario.usuario_cad.id_usuario },
            updateCadData
          );
        }
        //Se não existe, mas precisa criar (mudou o tipo e agora precisa)
      } else if (Object.keys(updateCadData).length > 0) {
        const hashedPassword = senha ? await bcrypt.hash(senha, 10) : null;

        await usuarioCadRepository.save({
          id_usuario: id,
          matricula: matricula || "",
          email: email || "",
          senha: hashedPassword,
          createdAt: new Date(),
        });
      }
    }
    // Se não precisa mais de cadastro extra, mas tinha antes
    else if (currentUsuario.usuario_cad) {
      await usuarioCadRepository.delete({ id_usuario: id });
    }

    return await this.getUsuarioById(id);
  }

  async deleteUsuario(id) {
    if (isNaN(Number(id))) {
      throw new Error("O id precisa ser um valor numérico.");
    }

    await usuarioRepository.update({ id }, { deletedAt: new Date() });
    return true;
  }
}

export default new UsuarioService();
