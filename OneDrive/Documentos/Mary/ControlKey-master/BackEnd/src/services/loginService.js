import UsuarioCad from "../entities/usuario_cad.js";
import { AppDataSource } from "../database/data-source.js";
import { IsNull } from "typeorm";
import { generateToken, generateRefreshToken, generateNewPassword } from "../utils/index.js";
import { sendEmail } from "../helpers/nodemail.js";
import bcrypt from "bcrypt";

const usuarioCadRepository = AppDataSource.getRepository(UsuarioCad);

class LoginService {
  async login(email, senha) {
    if (!email && !senha) {
      throw new Error("Email e senha são obrigatórios.");
    }

    if (!email.includes("@")) {
      throw new Error("O email informado é inválido");
    }

    if (senha.length < 6) {
      throw new Error("A senha deve conter no mínimo 6 caracteres.");
    }

    const usuario = await usuarioCadRepository.findOne({
      where: {
        email: email,
        deletedAt: IsNull(),
      },
      relations: ["usuario", "usuario.tipo"],
    });

    if (!usuario) {
      throw new Error("Credenciais inválidas.");
    }

    const isPasswordValid = await bcrypt.compare(senha, usuario.senha);

    if (!isPasswordValid) {
      throw new Error("Credenciais inválidas.");
    }

    const tokenPayload = {
      id: usuario.id_usuario,
      email: usuario.email,
      tipo: usuario.usuario.tipo.desc_tipo,
      id_tipo: usuario.usuario.tipo.id
    };

    const token = generateToken(tokenPayload);
    const refreshToken = generateRefreshToken(tokenPayload);

    return {
      message: "Login efetuado com sucesso!",
      token,
      refreshToken,
      usuario: {
        id: usuario.id_usuario,
        email: usuario.email,
        tipo: usuario.usuario.tipo.desc_tipo,
        id_tipo: usuario.usuario.tipo.id
      },
    };
  }

  async resetPassword(email) {
    if (!email && !email.includes("@")) {
      throw new Error("O email informado é inválido");
    }

    const usuario = await usuarioCadRepository.findOne({
      where: {
        email: email,
        deletedAt: IsNull(),
      },
    });

    if (!usuario) {
      throw new Error("Email não encontrado");
    }

    const recentReset = new Date(Date.now() - 5 * 60 * 1000);

    if(usuario.passwordResetAt && usuario.passwordResetAt >= recentReset) {
      const tempoRestante = Math.ceil((usuario.passwordResetAt.getTime() - recentReset.getTime()) / 1000 / 60);
      throw new Error (`Aguarde ${tempoRestante} minutos antes de solicitar outro reset de senha.`);
    }

    const newPassword = generateNewPassword();

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await usuarioCadRepository.update(
      { email: email },
      {
        senha: hashedPassword,
        passwordResetAt: new Date()
      }
    );

    try {
      await sendEmail(newPassword, usuario.email);
    } catch (emailError) {
      console.error("Erro ao enviar email: ", emailError);
      throw new Error("Senha resetada, mas erro ao enviar email. Contate o administrador.");
    }

    return {
      message: "Senha enviada para o email cadastrado. Verifique seu email.",
    };
  }
}

export default new LoginService();