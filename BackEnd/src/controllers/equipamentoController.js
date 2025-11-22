import express from "express";
import EquipService from "../services/equipamentoService.js";
import validationMiddleware from "../middleware/validationMiddleware.js";
import { EquipRequestDTO } from "../DTOs/index.js";
import equipamentoService from "../services/equipamentoService.js";
import {
  getErrorMessage,
  handleDatabaseError,
} from "../helpers/errorHandler.js";

const route = express.Router();

const validateCreate = validationMiddleware(EquipRequestDTO, "validateCreate");
const validateUpdate = validationMiddleware(EquipRequestDTO, "validateUpdate");
const validateDelete = validationMiddleware(EquipRequestDTO, "validateDelete");
const validateGetEquips = validationMiddleware(
  EquipRequestDTO,
  "validateGetEquips"
);

route.get("/", validateGetEquips, async (request, response) => {
  try {
    const equips = await EquipService.getEquip(request.validatedData);
    return response.status(200).json(equips);
  } catch (error) {
    console.error("Erro ao listar os equipamentos: ", error);
    return response.status(500).json({
      error: "Erro interno ao listar os equipamentos.",
    });
  }
});

route.get("/:id", async (request, response) => {
  try {
    const { id } = request.params;

    const equip = await EquipService.getEquipById(id);

    if (!equip) {
      return response.status(404).json({
        error: "Equipamento não encontrado.",
      });
    }

    return response.status(200).json(equip);
  } catch (error) {
    console.error("Erro ao buscar equipamento por ID: ", error);
    return response.status(500).json({
      error: "Erro interno ao buscar equipamento.",
    });
  }
});

//NOVAS ROTAS PARA EQUIPAMENTOS DESATIVADOS
//Listar apenas os equipamentos inativos
route.get("/inativos/listar", async (request, response) => {
  try {
    const equipInativos = await equipamentoService.getInactiveEquip();
    return response.status(200).json(equipInativos);
  } catch (error) {
    console.error("Erro ao listar equipamentos inativos: ", error);
    return response.status(500).json({
      response: "Erro interno no servidor.",
      error: getErrorMessage(error),
    });
  }
});

//Listar por ID todos (ativos e inativos)
route.get("/:id/inativo", async (request, response) => {
  try {
    const { id } = request.params;
    const equipamento = await equipamentoService.getEquipByIdIncludingInactive(
      id
    );

    if (!equipamento) {
      return response
        .status(404)
        .json({ response: "Equipamento não encontrado." });
    }

    return response.status(200).json(equipamento);
  } catch (error) {
    console.error("Erro ao buscar equipamento (incluindo inativo): ", error);
    return response.status(500).json({
      response: "Erro interno no servidor.",
      error: getErrorMessage(error),
    });
  }
});

route.post("/", validateCreate, async (request, response) => {
  try {
    const newEquip = await EquipService.postEquip(request.validatedData);
    return response.status(201).json({
      response: "Equipamento cadastrado com sucesso!",
      data: newEquip,
    });
  } catch (error) {
    console.error("Erro ao criar equipamento: ", error);
    if (error.message.includes("Já existe um equipamento com esta descrição")) {
      return response.status(409).json({ error: error.message });
    }
    return response
      .status(400)
      .json({ error: "Erro interno ao criar equipamento." });
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
      data: updateEquip,
    });
  } catch (error) {
    console.error("Erro ao atualizar equipamento: ", error);
    return response.status(400).json({ error: error.message });
  }
});

route.patch("/:id/reativar", async (request, response) => {
  try {
    const { id } = request.params;
    const equipReativado = await equipamentoService.activateEquip(id);

    return response.status(200).json({
      response: "Equipamento reativado com sucesso!",
      data: equipReativado,
    });
  } catch (error) {
    console.error("Erro ao reativar equipamento: ", error);
    if (error.message.includes("não encontrado")) {
      return response.status(404).json({ error: error.message });
    }
    return response.status(400).json({ error: error.message });
  }
});

route.delete("/:id", validateDelete, async (request, response) => {
  try {
    await EquipService.deleteEquip(request.validatedData.id);
    return response.status(200).json({
      response: "Equipamento excluído com sucesso!",
    });
  } catch (error) {
    console.error("Erro ao excluir equipamento: ", error);
    return response.status(400).json({ error: error.message });
  }
});

export default route;
