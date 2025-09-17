import express from "express";
import EquipService from "../services/equipamentoService.js";
import equipamentoService from "../services/equipamentoService.js";

const route = express.Router();

route.get("/", async (request, response) => {
    try {
        const equips = await EquipService.getEquip();
        return response.status(200).json(equips);
    } catch (error) {
        return response.status(500).json({ error: error.message });
    }
});

route.get("/:nome", async (request, response) => {
    try {
        const equips = await EquipService.getByDesc(request.params.nameFound);
        return response.status(200).json(equips)
    } catch (error) {
        return response.status(500).json ({error: error.message});
    }
});

route.post("/", async (request, response) => {
    try {
        const newEquip = await EquipService.postEquip(request.body);
        return response.status(201).json({
            response: "Equipamento cadastrado com sucesso!",
            data: newEquip
        })
    } catch (error) {
        return response.status(400).json({error: error.message})
    }
});

route.put("/:id", async (request, response) => {
    try {
        const updateEquip = await EquipService.putEquip(
            request.params.id,
            request.body
        );
        return response.status(200).json({
            response: "Equipamento atualizado com sucesso!",
            data:updateEquip
        });
    } catch (error) {
        return response.status(400).json({error: error.message})
    }
});

route.delete("/:id", async (request, response) => {
    try {
        await equipamentoService.deleteEquip(request.params.id);
        return response.status(200).json({
            response: "Equipamento excluído com sucesso!"
        });
    } catch(error){
        return response.status(400).json({error: error.message});
    }
});

export default route;