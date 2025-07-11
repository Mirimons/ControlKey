/////////////////  ARRUMAR DEPOIS!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!  \\\\\\\\\\\\\\\\\\\


import express from "express";
import UsuarioCad from "../entities/usuario_cad";
import Usuario from "../entities/usuario";
import { AppDataSource } from "../database/data-source.js";
import { Like, IsNull } from "typeorm";

const route = express.Router();

const usuario_cadRepository = AppDataSource.getRepository(UsuarioCad);
const usuarioRepository = AppDataSource.getRepository(Usuario);

route.get("/", async (request, response) => {
    const usuarios = await usuarioRepository.findBy({ deletedAt: IsNull() });
    return response.status(200).send({ "response": usuarios });
});

route.get("/:nameFound", async (request, response) => {
    const { nameFound } = request.params;
    const usuarioFound = await usuarioRepository.findBy({ nome: Like(`%${nameFound}%`) });
    return response.status(200).send({ "response": usuarioFound });
});

route.post("/", async (request, response) => {
    const { id_usuario, matricula, email_institucional, senha } = request.body;

    if (!id_usuario && isNaN(Number(id_usuario))) {
        return response.status(400).send({ "response": "O campo 'id_usuario' é obrigatório e precisa ser numérico." });
    }

    if (!matricula && isNaN(Number(matricula))) {
        return response.status(400).send({ "response": "O campo 'matricula' é obrigatório e precisa ser numérico."});
    }

    if (!email_institucional && !email_institucional.includes("@")) {
    return response.status(400).send({"response": 'O campo "email" está no padrão incorreto.'});
    }

    if (senha.length < 6){
    return response.status(400).send({"response": 'A senha deve conter ao menos 6 caracteres.'});
    }

    try {
        // const usuario = await usuarioRepository.



        const newUsuarioCad = usuarioRepository.create({
            id_usuario: Number(id),
            usuario: usuario,
            matricula,
            email_institucional,
            senha,
            createdAt: new Date()
        });
        
        await usuario_cadRepository.save(newUsuarioCad);
        return response.status(201).send({ "response": "Usuário cadastrado com sucesso!" });
    } catch (error) {
        console.error("Erro ao cadastrar usuário: ", error)
        return response.status(500).send({ "response": error });
    }
});



export default route;