import express from "express";
import Equipamento from "../entities/equipamento.js";
import TipoEquipamento from "../entities/tipo_equip.js";
import { AppDataSource } from "../database/data-source.js";
import { Like, IsNull } from "typeorm";

const route = express.Router();

const equipamentoRepository = AppDataSource.getRepository(Equipamento);
const tipo_equipRepository = AppDataSource.getRepository(TipoEquipamento);

route.get("/", async (request, response) => {
    const equipamentos = await equipamentoRepository.findBy({ deletedAt: IsNull() });
    return response.status(200).send({ "response": equipamentos });
});

route.get("/:nameFound", async (request, response) => {
    const { nameFound } = request.params;
    const equipamentoFound = await equipamentoRepository.findBy({ nome: Like(`%${nameFound}%`) });
    return response.status(200).send({ "response": equipamentoFound });
});

route.post("/", async (request, response) => {
    const { id_tipo, desc_equip } = request.body;

    if (!id_tipo && isNaN(Number(id_tipo))) {
        return response.status(400).send({ "response": "O campo 'id_tipo' é obrigatório e precisa ser numérico." });
    }

    if (desc_equip.length < 1) {
        return response.status(400).send({ "response": "O campo 'desc_equip' deve ter pelo menos um caractere." });
    }

    try {
        const tipo_equip = await tipo_equipRepository.findOneBy({
            id: Number(id_tipo),
            deletedAt: IsNull()
        });

        if (!tipo_equip) {
            return response.status(404).send({ "response": "Tipo de equipamento infomado não encontrado." });
        }

        const newEquipamento = equipamentoRepository.create({
            id_tipo: Number(id_tipo),
            tipo: tipo_equip,
            desc_equip,
            createdAt: new Date()
        });

        await equipamentoRepository.save(newEquipamento);
        return response.status(201).send({ "response": "Equipamento cadastrado com sucesso!" });
    } catch (error) {
        console.error("Erro ao cadastrar equipamento: ", error);
        return response.status(500).send({ "response": error });
    }
});

route.put("/:id", async (request, response) => {
    const { id_tipo, desc_equip } = request.body;
    const { id } = request.params;

    if (isNaN(id)) {
        return response.status(400).send({ "response": "O campo 'id' precisa ser um valor numérico." });
    }

    if (!id_tipo && isNaN(Number(id_tipo))) {
        return response.status(400).send({ "response": "O campo 'id_tipo' é obrigatório e precisa ser numérico." });
    }

    if (desc_equip.length < 1) {
        return response.status(400).send({ "response": "O campo 'desc_equip' deve ter pelo menos um caractere." });
    }

    try {
        //Verificação de Foreign key
        const tipo_equip = await tipo_equipRepository.findOneBy({
            id: Number(id_tipo),
            deletedAt: IsNull()
        });
        if (!tipo_equip) {
            return response.status(404).send({ "response": "Tipo de equipamento informado não encontrado." });
        }

        await equipamentoRepository.update({ id, id_tipo, desc_equip });
        return response.status(201).send({ "response": "Equipamento atualizado com sucesso!" });
    } catch (error) {
        return response.status(500).send({ "response": error });
    }
});

route.delete("/:id", async (request, response) => {
    const { id } = request.params;

    if (isNaN(id)) {
        return response.status(400).send({ "response": "O 'id' precisa ser um valor numérico" });
    }
    //Soft delete
    await equipamentoRepository.update({ id }, { deletedAt: () => "CURRENT_TIMESTAMP" });

    return response.status(200).send({"response": "Equipamento excluído com sucesso!"});
});

export default route;