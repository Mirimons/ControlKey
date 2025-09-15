import Usuario from "../entities/usuario.js";
import UsuarioCad from "../entities/usuario_cad.js";
import TipoUsuario from "../entities/tipo_usuario.js";
import { AppDataSource } from "../database/data-source.js";
import { Like, IsNull } from "typeorm";
import bcrypt from "bcrypt";

const usuarioRepository = AppDataSource.getRepository(Usuario);
const usuarioCadRepository = AppDataSource.getRepository(UsuarioCad);

class UsuarioService {
  async getUsuarios() {
    return await usuarioRepository.find({
      where: { deletedAt: IsNull() },
      relations: ["tipo", "usuario_cad"],
    });
  }

  async getByNome(nome) {
    return await usuarioRepository.find({
      where: {
        nome: Like(`%${nome}%`),
        deletedAt: IsNull(),
      },
      relations: ["tipo", "usuario_cad"],
    });
  }

  async getUsuarioById(id) {
    return await usuarioRepository.findOne({
      where: { id, deletedAt: IsNull() },
      relations: ["tipo", "usuario_cad"],
    });
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
      relations: ["usuario_cad"],
    });

    if (!currentUsuario) {
      throw new Error("Usuário não encontrado.");
    }

    await usuarioRepository.update(
      { id },
      {
        id_tipo: Number(id_tipo),
        nome: nome,
        cpf: cpf,
        data_nasc: data_nasc,
        telefone: telefone,
      }
    );

    if(currentUsuario.usuario_cad) {
      const hashedPassword = senha ? await bcrypt.hash(senha, 10): currentUsuario.usuario_cad.senha;

      await usuarioCadRepository.update(currentUsuario.usuario_cad.id_usuario, {
        matricula: matricula,
        email: email,
        senha: hashedPassword
      });
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
    if (requiresCadastroExtra && currentUsuario.usuario_cad) {
      const updateCadData = {};
      if (matricula !== undefined) updateCadData.matricula = matricula;
      if (email !== undefined) updateCadData.email = email;
      
      if (senha !== undefined) {
        updateCadData.senha = await bcrypt.hash(senha, 10);
      }
      
      if (Object.keys(updateCadData).length > 0) {
        await usuarioCadRepository.update(
          { id_usuario: currentUsuario.usuario_cad.id_usuario },
          updateCadData
        );
      }
    }
    return await this.getUsuarioById(id);

  }

  async deleteUsuario(id) {
    if(isNaN(Number(id))) {
      throw new Error("O id precisa ser um valor numérico.");
    }

    await usuarioRepository.update({ id }, { deletedAt: new Date() });
    return true;
  }
}

export default new UsuarioService();
