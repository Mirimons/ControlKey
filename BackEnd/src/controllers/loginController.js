import express from "express";
import UsuarioCad from "../entities/usuario_cad.js";
import { AppDataSource } from "../database/data-source.js";
import { IsNull } from "typeorm";
import { generateToken } from "../utils/jwt.js";
import { generateNewPassword } from "../utils/login.js";
import { sendEmail } from "../helpers/nodemail.js";

const route = express.Router();
const usuario_cadRepository = AppDataSource.getRepository(UsuarioCad);

//Para que os dados do usuário, como o login e senha, não sejam expostos com o get,é usado o post
route.post("/", async (request, response) => {
    const { email, senha } = request.body;

    if (!email.includes("@")) {
        return response.status(400).send({ "response": "O email informado é inválido." });
    }

    if (senha.length < 6) {
        return response.status(400).send({ "response": "A senha deve conter no mínimo 6 caracteres." });
    }

    const user = await usuario_cadRepository.findOneBy({
        email, senha, deleteAt: IsNull()
    });

    if (!user) {
        return response.status(401).send({ "response": "Usuário ou senha inválido" });
    }

    const token = generateToken({ user: user.nome, email: user.email });

    return response.status(200).send({ "respponse": "Login efetuado com sucesso", token });

});

route.put("/reset", async (request, response) => {
    const { email } = request.body;

    const user = await usuario_cadRepository.findOneBy({ email, deleteAt: IsNull() });

    if (!user) {
        return response.status(400).send({ "response": "Email inválido." });
    }

    const newPassword = generateNewPassword();

    await usuario_cadRepository.update({ email }, { senha: newPassword });

    //Enviar Email
    sendEmail(newPassword, user.email);

    return response.status(200).send({ "response": "Senha enviada para o email cadastrado. Verifique seu email." });

});

export default route;