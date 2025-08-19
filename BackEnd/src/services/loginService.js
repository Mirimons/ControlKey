import UsuarioCad from "../entities/usuario_cad.js";
import { AppDataSource } from "../database/data-source.js";
import { IsNull } from "typeorm";
import { generateToken } from "../utils/jwt.js";
import { generateNewPassword } from "../utils/login.js";
import { sendEmail } from "../helpers/nodemail.js";

const usuario_cadRepository = AppDataSource.getRepository(UsuarioCad);

class LoginService {
    async login(email, senha) {
        if(!email && !senha) {
            throw new Error("Email e senha são obrigatórios.");
        }

        if(!email.includes("@")) {
            throw new Error ("O email informado é inválido");
        }

        if(senha.length < 6)
    }
}

export default route;