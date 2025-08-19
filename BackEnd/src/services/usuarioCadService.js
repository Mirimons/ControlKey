import Usuario from "../entities/usuario.js";
import UsuarioCad from "../entities/usuario_cad.js";
import { AppDataSource } from "../database/data-source.js";
import { Like, IsNull } from "typeorm";

const usuarioRepository = AppDataSource.getRepository(Usuario);
const usuarioCadRepository = AppDataSource.getRepository(UsuarioCad);

class UsuarioCadService {
    async getUsuarioCad() {
        return await usuarioCadRepository.findBy({ deletedAt: IsNull() });
    }

    async getByNome(nome) {
        return await usuarioCadRepository.findBy({
            nome: Like(`%${nome}%`),
            deletedAt: IsNull()
        });
    }

    async postUsuarioCad(usuarioCadData) {
        const { id_usuario, matricula, email_institucional, senha } = usuarioCadData;
        if (!id_usuario && isNaN(Number(id_usuario))) {
            throw new Error("o campo 'id_usuario' é obrigatório e precisa ser numérico");
        }
        if (!matricula && isNaN(Number(matricula))) {
            throw new Error("O campo 'matricula' é obrigatório e precisa ser numérico.");
        }
        if (!email_institucional && !email_institucional.includes("@")) {
            throw new Error('O campo "email" está no padrão incorreto.');
        }
        if (senha.length < 6) {
            throw new Error('A senha deve conter ao menos 6 caracteres.');
        }
        const usuario = await usuarioCadRepository.findOneBy({
            id: Number(id_usuario),
            deletedAt: IsNull()
        });
        if (!usuario) {
            throw new Error("Usuário informado não encontrado.")
        }
        const newUsuarioCad = usuarioRepository.create({
            id_usuario: Number(id_usuario),
            matricula,
            email_institucional,
            senha,
            createdAt: new Date()
        });
        await usuarioCadRepository.save(newUsuarioCad)
        return newUsuarioCad;
    }
    async putUsuarioCad(id, usuarioCadData) {
        const { id_usuario, matricula, email_institucional, senha } = usuarioCadData;
        if (!id_usuario && isNaN(Number(id_usuario))) {
            throw new Error("o campo 'id_usuario' é obrigatório e precisa ser numérico");
        }
        if (!matricula && isNaN(Number(matricula))) {
            throw new Error("O campo 'matricula' é obrigatório e precisa ser numérico.");
        }
        if (!email_institucional && !email_institucional.includes("@")) {
            throw new Error('O campo "email" está no padrão incorreto.');
        }
        if (senha.length < 6) {
            throw new Error('A senha deve conter ao menos 6 caracteres.');
        }
        const usuario = await usuarioCadRepository.findOneBy({
            id: Number(id_usuario),
            deletedAt: IsNull()
        });
        if (!usuario) {
            throw new Error("Usuário informado não encontrado.")
        }
        await usuarioCadRepository.update({ id }, {
            id_usuario: Number(id_usuario),
            matricula,
            email_institucional,
            senha
        });
        return await usuarioCadRepository.findOneBy({ id });
    }
    async deleteUsuarioCad(id) {
        if (!id && isNaN(Number(id))) {
            throw new Error("O id é obrigatório e precisa ser um valor numérico")
        }
        await usuarioCadRepository.update({ id }, {
            deletedAt: () => new Date()
        });
        return true;
    }
}

export default new UsuarioCadService();