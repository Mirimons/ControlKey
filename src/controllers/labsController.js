import express from "express";
import Labs from "../entities/labs.js";
import { AppDataSource } from "../database/data-source.js";
import { Like, IsNull } from "typeorm";

const route = express.Router();

const labsRepository = AppDataSource.getRepository(Labs);

route.get("/", async (request, response) => {
    const Labs = await labsRepository.findBy({ deletedAt: IsNull() });
    return response.status(200).send({ "response": Labs });
});

route.get("/:nameFound", async (request, response) => {
    const { nameFound } = request.params;
    const labFound = await labsRepository.findBy({ nome: Like(`%${nameFound}%`) });
    return response.status(200).send({ "response": labFound });
});

route.post("/", async (request, response) => {
    const { desc_lab, nome_lab, status } = request.body;

    if (desc_lab.length < 1) {
        return response.status(400).send({ "response": "O campo 'desc_lab' deve ter pelo menos um caractere." });
    }
    if(nome_lab.length < 1) {
        return response.status(400).send({ "response": "O campo 'nome_lab' deve ter pelo menos um caractere."});
    }
    if (status.toLowercase() != 'livre' && status.toLowercase() != 'ocupado'){
        return response.status(400).send({ "response": 'O status deve ser "livre" ou "ocupado". '})
    }

    try {
        const newLab = labsRepository.create({
            desc_lab,
            nome_lab, 
            status,
            createdAt: new Date()
        });
        await labsRepository.save(newLab);

        return response.status(201).send({"response": "Laboratório cadastrado com sucesso!"});
        } catch(erro){
            return response.status(500).send({"error": erro});
        };
    }
);

route.put("/:id", async (request, response) => {
    const { desc_lab, nome_lab, status } = request.body;
    const { id } = request.params;

    if (isNaN(id)) {
    return response.status(400).send({ "response": "O campo 'id' precisa ser um valor numérico." });
    }
    if (desc_lab.length < 1) {
        return response.status(400).send({ "response": "O campo 'desc_lab' deve ter pelo menos um caractere." });
    }
    if(nome_lab.length < 1) {
        return response.status(400).send({ "response": "O campo 'nome_lab' deve ter pelo menos um caractere."});
    }
    if (status.toLowercase() != 'livre' && status.toLowercase() != 'ocupado'){
        return response.status(400).send({ "response": 'O status deve ser "livre" ou "ocupado". '})
    }

    try {
        await labsRepository.update({
            id,
            desc_lab,
            nome_lab,
            status
        });

        return response.status(201).send({"response": "Laboratório atualizado com sucesso!"});
        } catch(erro){
            return response.status(500).send({"error": erro});
        };
});
route.delete("/:id", async (request, response) => {
    const { id } = request.params;

    if (isNaN(id)) {
        return response.status(400).send({ "response": "O 'id' precisa ser um valor numérico" });
    }
    //Soft delete
    await labsRepository.update({ id }, { deletedAt: () => "CURRENT_TIMESTAMP" });

    return response.status(200).send({"response": "Laboratório excluído com sucesso!"});
});

export default route;