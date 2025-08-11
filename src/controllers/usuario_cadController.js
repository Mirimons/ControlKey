/////////////////            ARRUMAR DEPOIS!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!       \\\\\\\\\\\\\\\\\\\


import express from "express";
import UsuarioCad from "../entities/usuario_cad.js";
import Usuario from "../entities/usuario.js";
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

        // talvez usuario_cadRepository?
        const newUsuarioCad = usuarioRepository.create({
            id_usuario: Number(id),
            // usuario: usuario,
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

route.put("/:id", async (request, response) => {
    const { id_usuario, matricula, email_institucional, senha } = request.body;
    const { id } = request.params;

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
        // talvez usuario_cadRepository?
        const usuario = await usuarioRepository.findOneBy({
            id: Number(id),
            deletedAt: IsNull()
        });

        if (!usuario) {
            return response.status(404).send({ "response": "Usuário informado não encontrado." });
        }

        await usuario_cadRepository.update({ id_usuario, matricula, email_institucional, senha });
        return response.status(201).send({ "response": "Usuário atualizado com sucesso!" });

    } catch (error) {
        console.error("Erro ao atualizar usuário:", error);
        return response.status(500).send({ "response": error });
    }
});
route.delete('/:id', async (request, response) => {
    const { id } = request.params;

    if (isNaN(Number(id))) {
        return response.status(400).send({ "response": "O id precisa ser um valor numérico." });
    }

    //Hard delete:
    // await userRepository.delete({id});

    await usuario_cadRepository.update({ id }, { deletedAt: () => "CURRENT_TIMESTAMP" });

    return response.status(200).send({ "response": "Usuário excluído com sucesso!" });
});




export default route;