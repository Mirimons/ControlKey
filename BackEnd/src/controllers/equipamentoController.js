import express from "express";
import EquipService from "../services/equipamentoService.js";
import validationMiddleware from "../middleware/validationMiddleware.js";
import { EquipRequestDTO } from "../DTOs/index.js";

const validateCreate = validationMiddleware(EquipRequestDTO, "validateCreate");
const validateUpdate = validationMiddleware(EquipRequestDTO, "validateUpdate");
const validateDelete = validationMiddleware(EquipRequestDTO, "validateDelete");
const validateGetEquips = validationMiddleware(EquipRequestDTO, "validateGetEquips");

const route = express.Router();

route.get("/", validateGetEquips, async (request, response) => {
    try {
        const equips = await EquipService.getEquip(request.validatedData);
        return response.status(200).json(equips);
    } catch (error) {
        console.error("Erro ao listar os equipamentos: ", error);
        return response.status(500).json({
            error: "Erro interno ao listar os equipamentos."
        });
    }
});

route.get("/:id", async (request, response) => {
    try {
        const { id } = request.params;
        
        const equip = await EquipService.getEquipById(id);
        
        if (!equip) {
            return response.status(404).json({
                error: "Equipamento não encontrado."
            });
        }
        
        return response.status(200).json(equip);
    } catch (error) {
        console.error("Erro ao buscar equipamento por ID: ", error);
        return response.status(500).json({
            error: "Erro interno ao buscar equipamento."
        });
    }
});

route.post("/", validateCreate, async (request, response) => {
    try {
        const newEquip = await EquipService.postEquip(request.validatedData);
        return response.status(201).json({
            response: "Equipamento cadastrado com sucesso!",
            data: newEquip
        });
    } catch (error) {
        console.error("Erro ao criar equipamento: ", error);
        if (error.message.includes("Já existe um equipamento com esta descrição")) {
            return response.status(409).json({ error: error.message });
        }
        return response.status(400).json({ error: "Erro interno ao criar equipamento." });
    }
});

route.put("/:id", validateUpdate, async (request, response) => {
    try {
        const updateEquip = await EquipService.putEquip(
            request.validatedData.id,
            request.validatedData
        );
        return response.status(200).json({
            response: "Equipamento atualizado com sucesso!",
            data: updateEquip
        });
    } catch (error) {
        console.error("Erro ao atualizar equipamento: ", error);
        return response.status(400).json({ error: error.message });
    }
});

route.delete("/:id", validateDelete, async (request, response) => {
    try {
        await EquipService.deleteEquip(request.validatedData.id);
        return response.status(200).json({
            response: "Equipamento excluído com sucesso!"
        });
    } catch (error) {
        console.error("Erro ao excluir equipamento: ", error);
        return response.status(400).json({ error: error.message });
    }
});

export default route;