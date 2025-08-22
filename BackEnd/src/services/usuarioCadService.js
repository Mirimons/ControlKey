/// TESTAR O SERVICE UNIFICADO PARA OS USUARIOS ANTES DE APAGAR ESTA BBBBBBOOOOOMMMMMMMMMBBBBBBBBBAAAAAAAAAA

/*
import Usuario from "../entities/usuario.js";
import UsuarioCad from "../entities/usuario_cad.js";
import { AppDataSource } from "../database/data-source.js";
import { Like, IsNull } from "typeorm";
import bcrypt from "bcrypt";

const usuarioRepository = AppDataSource.getRepository(Usuario);
const usuarioCadRepository = AppDataSource.getRepository(UsuarioCad);

class UsuarioCadService {
  async getUsuarioCad() {
    return await usuarioCadRepository.findBy({ deletedAt: IsNull() });
  }

  async getByNome(nome) {
    return await usuarioCadRepository.findBy({
      nome: Like(`%${nome}%`),
      deletedAt: IsNull(),
    });
  }

  async postUsuarioCad(usuarioCadData) {
    const { id_usuario, matricula, email_institucional, senha } =
      usuarioCadData;

    if (!id_usuario && isNaN(Number(id_usuario))) {
      throw new Error("O ID do usuário é obrigatório e precisa ser numérico");
    }
    if (!matricula && isNaN(Number(matricula))) {
      throw new Error("A matricula é obrigatória e precisa ser numérica.");
    }
    if (!email_institucional && !email_institucional.includes("@")) {
      throw new Error("O email está no padrão incorreto.");
    }
    if (senha.length < 6) {
      throw new Error("A senha deve conter ao menos 6 caracteres.");
    }
    const usuario = await usuarioCadRepository.findOneBy({
      id: Number(id_usuario),
      deletedAt: IsNull(),
    });
    if (!usuario) {
      throw new Error("Usuário informado não encontrado.");
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(senha, saltRounds);

    const newUsuarioCad = usuarioRepository.create({
      id_usuario: Number(id_usuario),
      matricula,
      email_institucional,
      senha: hashedPassword,
      createdAt: new Date(),
    });

    await usuarioCadRepository.save(newUsuarioCad);
    return newUsuarioCad;
  }

  async putUsuarioCad(id, usuarioCadData) {
    const { id_usuario, matricula, email_institucional, senha } =
      usuarioCadData;

    if (!id_usuario && isNaN(Number(id_usuario))) {
      throw new Error(
        "O ID do usuário é obrigatório e precisa ser numérico"
      );
    }
    if (!matricula && isNaN(Number(matricula))) {
      throw new Error(
        "A matrícula é obrigatória e precisa ser numérica."
      );
    }
    if (!email_institucional && !email_institucional.includes("@")) {
      throw new Error('O email está no padrão incorreto.');
    }
    if (senha.length < 6) {
      throw new Error("A senha deve conter ao menos 6 caracteres.");
    }

    const usuario = await usuarioCadRepository.findOneBy({
      id: Number(id_usuario),
      deletedAt: IsNull(),
    });

    if (!usuario) {
      throw new Error("Usuário informado não encontrado.");
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(senha, saltRounds);

    await usuarioCadRepository.update(
      { id },
      {
        id_usuario: Number(id_usuario),
        matricula,
        email_institucional,
        senha: hashedPassword
      }
    );

    return await usuarioCadRepository.findOneBy({ id });
  }
  async deleteUsuarioCad(id) {
    if (!id && isNaN(Number(id))) {
      throw new Error("O ID é obrigatório e precisa ser um valor numérico");
    }
    await usuarioCadRepository.update(
      { id },
      {
        deletedAt: () => new Date(),
      }
    );
    return true;
  }
}

export default new UsuarioCadService();
*/
