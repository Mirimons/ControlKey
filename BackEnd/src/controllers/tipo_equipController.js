import express from "express";
import TipoEquipamento from "../entities/tipo_equip.js";
import { AppDataSource } from "../database/data-source.js";
import { Like, IsNull } from "typeorm";

const route = express.Router();
const tipo_equipRepository = AppDataSource.getRepository(TipoEquipamento);
route.get("/", async (request, response) => {
    const tipos_equip = await tipo_equipRepository.findBy({ deletedAt: IsNull() });
    return response.status(200).send({ "response": tipos_equip });
});

route.get("/:nameFound", async (request, response) => {
    const { nameFound } = request.params;
    const tipoFound = await tipo_equipRepository.findBy({ desc_tipo: Like(`%${nameFound}%`) });
    return response.status(200).send({ "response": tipoFound });
});

route.post("/", async (request, response) => {
    const { desc_tipo } = request.body;

    if (desc_tipo.length < 1) {
        return response.status(400).send({ "response": "O campo 'desc_tipo' deve ter pelo menos um caractere." });
    }

    //Tratamentos de erro 
    try {
        const newTipo = tipo_equipRepository.create({ desc_tipo });
        await tipo_equipRepository.save(newTipo);

        return response.status(201).send({ "response": "Tipo de equipamento cadastrado com sucesso!" });
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
        return response.status(400).send({ "response": "O campo 'desc_tipo' deve ter pelo menos um caractere." });
    }

    //Tratamentos de erro 
    try {
        await tipo_equipRepository.update({ id, desc_tipo });

        return response.status(200).send({ "response": "Tipo de equipamento atualizado com sucesso!" });
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
    await tipo_equipRepository.update({ id }, { deletedAt: () => "CURRENT_TIMESTAMP" });

    return response.status(200).send({"response": "Tipo de equipamento excluído com sucesso!"});
});

export default route;