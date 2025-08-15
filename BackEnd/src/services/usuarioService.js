import Usuario from "../entities/usuario.js";
import TipoUsuario from "../entities/tipo_usuario.js";
import { AppDataSource } from "../database/data-source.js";
import { Like, IsNull } from "typeorm";
import { validateAndFormatDate } from "../utils/dateValidator.js";

const usuarioRepository = AppDataSource.getRepository(Usuario);
const tipoUsuarioRepository = AppDataSource.getRepository(TipoUsuario);

class UsuarioService {
  async getUsuarios() {
    return await usuarioRepository.findBy({ deletedAt: IsNull() });
  }

  async getByNome(nome) {
    return await usuarioRepository.findBy({ 
      nome: Like(`%${nome}%`),
      deletedAt: IsNull()
    });
  }

  async postUsuario(usuarioData) {
    // Validações:
    const { id_tipo, nome, cpf, data_nasc, telefone } = usuarioData;

    if (!id_tipo && isNaN(Number(id_tipo))) {
      throw new Error("O campo 'id_tipo' é obrigatório e precisa ser numérico.");
    }

    if (!nome?.trim() || nome.length < 2) {
      throw new Error("O campo 'nome' deve ter pelo menos 1 caractere.");
    }

    if (!cpf || cpf.length != 11 || isNaN(Number(cpf))) {
      throw new Error("O campo 'cpf' está no padrão incorreto. É preciso ter 11 dígitos.");
    }

    if (!data_nasc) {
      throw new Error("O campo 'data_nasc' é obrigatório.");
    }

    const dateValidation = validateAndFormatDate(data_nasc);
    if (!dateValidation.isValid) {
      throw new Error(dateValidation.error);
    }

    if (!telefone || isNaN(telefone)) {
      throw new Error("O campo 'telefone' é obrigatório e precisa ser numérico.");
    }

    // Verifica se o tipo de usuário existe:
    const tipoUsuario = await tipoUsuarioRepository.findOneBy({
      id: Number(id_tipo),
      deletedAt: IsNull()
    });

    if (!tipoUsuario) {
      throw new Error("Tipo de usuário informado não encontrado.");
    }

    // Verifica se o CPF já existe:
    const usuarioExiste = await usuarioRepository.findOneBy({
      cpf,
      deletedAt: IsNull()
    });

    if (usuarioExiste) {
      throw new Error("CPF já cadastrado.");
    }

    // Cria o novo usuário:
    const novoUsuario = usuarioRepository.create({
      id_tipo: Number(id_tipo),
      tipo: tipoUsuario,
      nome: nome.trim(),
      cpf,
      data_nasc: dateValidation.dateFormatted,
      telefone: telefone.toString().trim(),
      createdAt: new Date()
    });

    await usuarioRepository.save(novoUsuario);
    return novoUsuario;
  }

  async putUsuario(id, usuarioData) {
    const { id_tipo, nome, cpf, data_nasc, telefone } = usuarioData;

    if (isNaN(Number(id))) {
      throw new Error("O campo 'id' precisa ser um valor numérico.");
    }

    // Validações de novo, só que pro put:
    if (!id_tipo && isNaN(Number(id_tipo))) {
      throw new Error("O campo 'id_tipo' é obrigatório e precisa ser numérico.");
    }

    if (!nome?.trim() || nome.length < 2) {
      throw new Error("O campo 'nome' deve ter pelo menos 1 caractere.");
    }

    if (!cpf || cpf.length != 11 || isNaN(Number(cpf))) {
      throw new Error("O campo 'cpf' está no padrão incorreto. É preciso ter 11 dígitos.");
    }

    if (!data_nasc) {
      throw new Error("O campo 'data_nasc' é obrigatório.");
    }

    const dateValidation = validateAndFormatDate(data_nasc);
    if (!dateValidation.isValid) {
      throw new Error(dateValidation.error);
    }

    if (!telefone || isNaN(telefone)) {
      throw new Error("O campo 'telefone' é obrigatório e precisa ser numérico.");
    }

    // Verifica se o tipo de usuário existe
    const tipoUsuario = await tipoUsuarioRepository.findOneBy({
      id: Number(id_tipo),
      deletedAt: IsNull()
    });

    if (!tipoUsuario) {
      throw new Error("Tipo de usuário informado não encontrado.");
    }

    await usuarioRepository.update({ id }, { 
      id_tipo, 
      nome, 
      cpf, 
      data_nasc: dateValidation.dateFormatted, 
      telefone 
    });

    return await usuarioRepository.findOneBy({ id });
  }

  async deleteUsuario(id) {
    if (isNaN(Number(id))) {
      throw new Error("O id precisa ser um valor numérico.");
    }

    await usuarioRepository.update({ id }, { deletedAt: () => "CURRENT_TIMESTAMP" });
    return true;
  }
}

export default new UsuarioService();