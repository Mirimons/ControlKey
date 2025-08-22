import Usuario from "../entities/usuario.js";
import UsuarioCad from "../entities/usuario_cad.js";
import TipoUsuario from "../entities/tipo_usuario.js";
import { AppDataSource } from "../database/data-source.js";
import { Like, IsNull } from "typeorm";
import { validateAndFormatDate } from "../utils/dateValidator.js";
import bcrypt from "bcrypt";

const usuarioRepository = AppDataSource.getRepository(Usuario);
const usuarioCadRepository = AppDataSource.getRepository(UsuarioCad);
const tipoUsuarioRepository = AppDataSource.getRepository(TipoUsuario);

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
    const tipoCad = [2, 3];
    return tipoCad.includes(Number(id_tipo));
  }

  async postUsuario(usuarioData) {
    // Validações:
    const {
      id_tipo,
      nome,
      cpf,
      data_nasc,
      telefone,
      matricula,
      email_institucional,
      senha,
    } = usuarioData;

    if (!id_tipo && isNaN(Number(id_tipo))) {
      throw new Error(
        "O Tipo de Usuário é obrigatório e precisa ser numérico."
      );
    }

    if (!nome?.trim() && nome.length.trim() < 2) {
      throw new Error("O nome deve ter pelo menos 2 caracteres.");
    }

    if (!cpf && cpf.length != 11 && isNaN(Number(cpf))) {
      throw new Error(
        "O CPF está no padrão incorreto. É preciso ter 11 dígitos."
      );
    }

    if (!data_nasc) {
      throw new Error("A Data de Nascimento é obrigatória.");
    }

    const dateValidation = validateAndFormatDate(data_nasc);
    if (!dateValidation.isValid) {
      throw new Error(dateValidation.error);
    }

    if (!telefone && isNaN(telefone)) {
      throw new Error("O Telefone é obrigatório e precisa ser numérico.");
    }

    // Verifica se o tipo de usuário existe:
    const tipoUsuario = await tipoUsuarioRepository.findOneBy({
      id: Number(id_tipo),
      deletedAt: IsNull(),
    });

    if (!tipoUsuario) {
      throw new Error("Tipo de usuário informado não encontrado.");
    }

    //Vendo se precisa do cadastroExtra Extra
    const cadastro = this.cadastroExtra(Number(id_tipo));

    if (cadastro) {
      if (!matricula?.trim()) {
        throw new Error(
          "A matrícula é obrigatória para este tipo de usuário."
        );
      }
      if (!email_institucional?.includes("@")) {
        throw new Error("Email está no padrão incorreto.");
      }
      if (senha && senha.length < 6) {
        throw new Error("Senha deve conter pelo menos 6 caracteres.");
      }
    }

    // Verifica se o CPF já existe:
    const usuarioExiste = await usuarioRepository.findOneBy({
      cpf,
      deletedAt: IsNull(),
    });

    if (usuarioExiste) {
      throw new Error("CPF já cadastrado.");
    }

    // Criação do usuário base:
    const newUsuario = usuarioRepository.create({
      id_tipo: Number(id_tipo),
      tipo: tipoUsuario,
      nome: nome.trim(),
      cpf,
      data_nasc: dateValidation.dateFormatted,
      telefone: telefone.toString().trim(),
      createdAt: new Date(),
    });

    // Criação do UsuarioCad
    if (cadastro) {
      const hashedPassword = senha ? await bcrypt.hash(senha, 10) : null;

      newUsuario.usuario_cad = usuarioCadRepository.create({
        matricula: matricula.trim(),
        email_institucional: email_institucional.trim(),
        senha: hashedPassword,
        createdAt: new Date(),
      });
    }

    //Salva em CASCATE
    await usuarioRepository.save(newUsuario);
    return newUsuario;
  }

  async putUsuario(id, usuarioData) {
    const {
      id_tipo,
      nome,
      cpf,
      data_nasc,
      telefone,
      matricula,
      email_institucional,
      senha,
    } = usuarioData;

    if (!id && isNaN(Number(id))) {
      throw new Error("O ID é obrigatório e precisa ser um valor numérico.");
    }

    // Validações iguais, só que pro put agora
    if (!id_tipo && isNaN(Number(id_tipo))) {
      throw new Error(
        "O Tipo de Usuário é obrigatório e precisa ser numérico."
      );
    }

    if (!nome?.trim() && nome.length.trim() < 2) {
      throw new Error("O nome deve ter pelo menos 2 caracteres.");
    }

    if (!cpf && cpf.length != 11 && isNaN(Number(cpf))) {
      throw new Error(
        "O CPF está no padrão incorreto. É preciso ter 11 dígitos."
      );
    }

    if (!data_nasc) {
      throw new Error("A Data de Nascimento é obrigatória.");
    }

    const dateValidation = validateAndFormatDate(data_nasc);
    if (!dateValidation.isValid) {
      throw new Error(dateValidation.error);
    }

    if (!telefone && isNaN(telefone)) {
      throw new Error("O Telefone é obrigatório e precisa ser numérico.");
    }

    // Verifica se o tipo de usuário existe:
    const tipoUsuario = await tipoUsuarioRepository.findOneBy({
      id: Number(id_tipo),
      deletedAt: IsNull(),
    });

    if (!tipoUsuario) {
      throw new Error("Tipo de usuário informado não encontrado.");
    }

    //Vendo se precisa do cadastro Extra
    const cadastro = this.cadastroExtra(Number(id_tipo));
    
    if (cadastro) {
      if (!matricula?.trim()) {
        throw new Error(
          "A matrícula é obrigatória para este tipo de usuário."
        );
      }
      if (!email_institucional?.includes("@")) {
        throw new Error("Email está no padrão incorreto.");
      }
      if (senha && senha.length < 6) {
        throw new Error("Senha deve conter pelo menos 6 caracteres.");
      }
    }

    // Verifica se o CPF já existe:
    const usuarioExiste = await usuarioRepository.findOneBy({
      cpf,
      deletedAt: IsNull(),
    });

    if (usuarioExiste) {
      throw new Error("CPF já cadastrado.");
    }

    const usuarioAtual = await usuarioRepository.findOne({
      where: { id, deletedAt: IsNull()},
      relations: ['usuario_cad']
    });

    if (!usuarioAtual){
      throw new Error("Usuário não encontrado.")
    }

    //Atualização dos dados básicos
    await usuarioRepository.update(
      { id },
      {
        id_tipo: Number(id_tipo),
        nome: nome.trim(),
        cpf,
        data_nasc: dateValidation.dateFormatted,
        telefone: telefone.toString().trim()
      }
    );

    //Se tiver usuarioCad:
    if(usuarioAtual.usuario_cad) {
      const hashedPassword = senha ? await bcrypt.hash(senha, 10): usuarioAtual.usuario_cad.senha;

      await usuarioCadRepository.update(usuarioAtual.usuario_cad.id_usuario, {
        matricula: matricula.trim(),
        email_institucional: email_institucional.trim(),
        senha: hashedPassword
      });
    }
    
    return await this.getUsuarioById(id);
  }

  async deleteUsuario(id) {
    if (isNaN(Number(id))) {
      throw new Error("O id precisa ser um valor numérico.");
    }

    await usuarioRepository.update({ id }, { deletedAt: () => new Date() });
    return true;
  }
}

export default new UsuarioService();
