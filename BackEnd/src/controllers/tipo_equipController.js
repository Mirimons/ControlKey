import express from "express";
import tipoEquipService from "../services/tipoEquipService.js";
import validationMiddleware from "../middleware/validationMiddleware.js";
import { tipoEquipRequestDTO } from "../DTOs/index.js";

const route = express.Router();

const validateCreate = validationMiddleware(
  tipoEquipRequestDTO,
  "validateCreate"
);
const validateUpdate = validationMiddleware(
  tipoEquipRequestDTO,
  "validateUpdate"
);
const validateDelete = validationMiddleware(
  tipoEquipRequestDTO,
  "validateDelete"
);

route.get("/", async (request, response) => {
  try {
    const tipos = await tipoEquipService.getTiposEquip();
    return response.status(200).json(tipos);
  } catch (error) {
    console.error("Erro ao listar tipos de equipamento: ", error);
    return response.status(500).json({ error: error.message });
  }
});

route.get("/:descricao", async (request, response) => {
  try {
    const { descricao } = request.params;
    const tipos = await tipoEquipService.getByDescricao(descricao);
    return response.status(200).json(tipos);
  } catch (error) {
    console.error("Erro ao buscar tipos por descrição: ", error);
    return response.status(500).json({ error: error.message });
  }
});

route.post("/", validateCreate, async (request, response) => {
  try {
    const newTipo = await tipoEquipService.postTipoEquip(request.validatedData);
    return response.status(201).json({
      response: "Tipo de equipamento cadastrado com sucesso!",
      data: newTipo,
    });
  } catch (error) {
    console.error("Erro ao cadastrar tipo de equipamento: ", error);
    return response.status(400).json({ error: error.message });
  }
});

route.put("/:id", validateUpdate, async (request, response) => {
  try {
    const updateTipo = await tipoEquipService.putTipoEquip(
      request.validatedData.id,
      request.validatedData
    );
    return response.status(200).json({
      response: "Tipo de equipamento atualizado com sucesso!",
      data: updateTipo,
    });
  } catch (error) {
    console.error("Erro ao atualizar tipo de equipamento: ", error);
    return response.status(400).json({ error: error.message });
  }
});

route.delete("/:id", validateDelete, async (request, response) => {
  try {
    await tipoEquipService.deleteTipoEquip(request.validatedData.id);
    return response.status(200).json({
      response: "Tipo de equipamento excluído com sucesso!",
    });
  } catch (error) {
    console.error("Erro ao excluir tipo de equipamento: ", error);
    return response.status(400).json({ error: error.message });
  }
});

export default route;
