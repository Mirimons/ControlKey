import express from "express";
import tipoEquipService from "../services/tipoEquipService.js";


const route = express.Router();
route.get("/", async (request, response) => {
    try {
        const tipos = await tipoEquipService.getTiposEquip();
        return response.status(200).json({ response: tipos });
    } catch (error) {
        return response.status(500).json({ error: error.message });
    }
});

route.get("/:nameFound", async (request, response) => {
    try {
        const tipos = await tipoEquipService.getByDescricao(request.params.nameFound);
        return response.status(200).json({ response: tipos });
    } catch (error) {
        return response.status(500).json({ error: error.message });
    }
});

route.post("/", async (request, response) => {
    try {
        const newTipo = await tipoEquipService.postTipoEquip(request.body);
        return response.status(201).json({
            response: "Tipo de equipamento cadastrado com sucesso!",
            data: newTipo
        });
    } catch (error) {
        return response.status(400).json({ error: error.message });
    }
});

route.put("/:id", async (request, response) => {
    try {
        const updateTipo = await tipoEquipService.putTipoEquip(
            request.params.id,
            request.body
        );
        return response.status(200).json({
            response: "Tipo de equipamento atualizado com sucesso!",
            data: updateTipo
        });
    } catch (error) {
        return response.status(400).json({ error: error.message });
    }
});


route.delete("/:id", async (request, response) => {
    try {
        await tipoEquipService.deleteTipoEquip(request.params.id);
        return response.status(200).json({
            response: "Tipo de equipamento excluído com sucesso!"
        });
    } catch (error) {
        return response.status(400).json({ error: error.message });
    }
});

export default route;