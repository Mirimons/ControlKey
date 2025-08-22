import UsuarioCad from "../entities/usuario_cad.js";
import { AppDataSource } from "../database/data-source.js";
import { IsNull } from "typeorm";
import { generateToken } from "../utils/jwt.js";
import { sendEmail } from "../helpers/nodemail.js";
import { generateNewPassword } from "../utils/login.js";
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

    const user = await usuarioCadRepository.findOneBy({
      where: {
        email_institucional: email,
        deletedAt: IsNull(),
      },
      relations: ["usuario"],
    });

    if (!user) {
      throw new Error("Credenciais inválidas.");
    }

    const isPasswordValid = await bcrypt.compare(senha, user.senha);

    if (!isPasswordValid) {
      throw new Error("Credenciais inválidas.");
    }

    const token = generateToken({
      userId: user.id_usuario,
      usuarioId: user.id_usuario,
      email: user.email_institucional,
    });

    return {
      message: "Login efetuado com sucesso!",
      token,
      user: {
        id: user.id,
        usuarioId: user.id_usuario,
        email: user.email_institucional,
      },
    };
  }

  async resetPassword(email) {
    if (!email && !email.includes("@")) {
      throw new Error("O email informado é inválido");
    }

    const user = await usuarioCadRepository.findOneBy({
      email_institucional: email,
      deletedAt: IsNull(),
    });

    if (!user) {
      throw new Error("Email não encontrado");
    }

    const recentReset = new Date(Date.now() - 5 * 60 * 1000);

    if(user.passwordResetAt && user.passwordResetAt >= recentReset) {
      const tempoRestante = Math.ceil((user.passwordResetAt.getTime() - recentReset.getTime()) / 1000 / 60);
      throw new Error (`Aguarde ${tempoRestante} minutos antes de solicitar outro reset de senha.`);
    }

    const newPassword = generateNewPassword();

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await usuarioCadRepository.update(
      { email_institucional: email },
      {
        senha: hashedPassword,
        passwordResetAt: new Date()
      }
    );

    try {
      await sendEmail(newPassword, user.email_institucional);
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