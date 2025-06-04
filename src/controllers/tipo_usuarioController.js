import express from "express";
import tipo_usuario from "../entities/tipo_usuario.js";
import { AppDataSource } from "../database/data-source.js";
import { Like, IsNull } from "typeorm";

const route = express.Router();
const tipo_usuarioRepository = AppDataSource.getRepository(tipo_usuario);
route.get("/", async (request, response) => {
    const tipos_usuario = await tipo_usuarioRepository.findBy({ deletedAt: IsNull() });
    return response.status(200).send({ "response": tipos_usuario });
});

route.get("/:nameFound", async (request, response) => {
    const { nameFound } = request.params;
    const tipoFound = await tipo_usuarioRepository.findBy({ desc_tipo: Like(`%${nameFound}%`) });
    return response.status(200).send({ "response": tipoFound });
});

route.post("/", async (request, response) => {
    const { desc_tipo } = request.body;

    if (desc_tipo.length < 1) {
        return response.status(400).send({ "response": 'Campo "desc_tipo" deve ter pelo menos um caractere.' });
    }

    //Tratamentos de erro 
    try {
        const newTipo = tipo_usuarioRepository.create({ desc_tipo });
        await tipo_usuarioRepository.save(newTipo);

        return response.status(201).send({ "response": "Tipo de usuário cadastrado com sucesso!" });
    } catch (erro) {
        return response.status(500).send({ "error": erro });
    }
});

route.put("/:id", async (request, response) => {
    const { desc_tipo } = request.body;
    const { id } = request.params;

    if (isNaN(id)) {
        return response.status(400).send({ "response": "O 'id' precisa ser um valor numérico." });
    }
    if (desc_tipo.length < 1) {
        return response.status(400).send({ "response": "Campo 'desc_tipo' deve ter pelo menos um caractere." });
    }

    //Tratamentos de erro 
    try {
        await tipo_usuarioRepository.update({ id }, { desc_tipo });

        return response.status(200).send({ "response": "Tipo de usuário atualizado com sucesso!" });
    } catch (erro) {
        return response.status(500).send({ "error": erro });
    }
});

route.delete("/:id", async (request, response) => {
    const { id } = request.params;

    if (isNaN(id)) {
        return response.status(400).send({ "response": "O 'id' precisa ser um valor numérico" });
    }
    //Soft delete
    await tipo_usuarioRepository.update({ id }, { deletedAt: () => "CURRENT_TIMESTAMP" });

    return response.status(200).send({"response": "Tipo de usuário excluído com sucesso!"});
});

export default route;