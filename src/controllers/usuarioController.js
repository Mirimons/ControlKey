import express from "express";
import usuario from "../entities/usuario.js";
import { AppDataSource } from "../database/data-source.js";
import { Like, IsNull } from "typeorm";

const route = express.Router();
const usuarioRepository = AppDataSource.getRepository(usuario);

route.get("/", async (request, response) => {
    const usuarios = await usuarioRepository.findBy({deletedAt: IsNull()});
    return response.status(200).send({"response": usuarios});
});

route.get("/:nameFound", async (request, response) => {
    const {nameFound} = request.params;
    const usuarioFound = await usuarioRepository.findBy({nome: Like(`%${nameFound}%`)});
    return response.status(200).send({"response": usuarioFound});
});

route.post("/", async (request, response) => {
    const {cpf, nome, telefone, data_nasc, id_tipo } = request.body;

});




export default route;