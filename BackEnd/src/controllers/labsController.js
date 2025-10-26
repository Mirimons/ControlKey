import express from "express";
import labsService from "../services/labsService.js";
import validationMiddleware from "../middleware/validationMiddleware.js";
import { LabsRequestDTO } from "../DTOs/index.js";
import { getErrorMessage } from "../helpers/errorHandler.js";

const validateGetLabs = validationMiddleware(LabsRequestDTO, "validateGetLabs");
const validateCreate = validationMiddleware(LabsRequestDTO, "validateCreate");
const validateUpdate = validationMiddleware(LabsRequestDTO, "validateUpdate");
const validateDelete = validationMiddleware(LabsRequestDTO, "validateDelete");

const route = express.Router();

route.get("/:id", async (request, response) => {
  try {
    const { id } = request.params;
    const labs = await labsService.getLabById(id);

    if (!labs) {
      return response
        .status(404)
        .json({ response: "Laboratório não encontrado." });
    }

    return response.status(200).json(labs);
  } catch (error) {
    console.error("Erro ao buscar lab: ", error);
    return response.status(500).json({
      reponse: "Erro interno no servidor.",
      error: getErrorMessage(error),
    });
  }
});

route.get("/", validateGetLabs, async (request, response) => {
  try {
    const labs = await labsService.getLabs(request.validatedData);
    return response.status(200).json(labs);
  } catch (error) {
    console.error("Erro ao listar os laboratórios com filtro: ", error);
    return response.status(500).json({
      response: "Erro interno no servidor",
      error: getErrorMessage(error),
    });
  }
});

route.post("/", validateCreate, async (request, response) => {
  try {
    const newLab = await labsService.postLabs(request.validatedData);
    return response.status(201).json({
      response: "Laboratório criado com sucesso",
      data: newLab,
    });
  } catch (error) {
    console.error("Erro ao criar laboratório: ", error);
    if (error.message.includes("Já existe um laboratório com este nome.")) {
      return response.status(409).json({ error: error.message });
    }
  }

  return response
    .status(500)
    .json({ error: "Erro interno ao criar laboratório." });
});

route.put("/:id", validateUpdate, async (request, response) => {
  try {
    const updatedLab = await labsService.putLabs(
      request.validatedData.id,
      request.validatedData
    );
    return response.status(200).json({
      response: "Laboratório atualizado com sucesso!",
      data: updatedLab,
    });
  } catch (error) {
    console.error("Erro ao atualizar laboratório: ", error);

    return response.status(500).json({ error: error.message });
  }
});

route.delete("/:id", validateDelete, async (request, response) => {
  try {
    await labsService.deleteLabs(request.validatedData.id);
    return response.status(200).json({
      response: "Laboratório excluído com sucesso!",
    });
  } catch (error) {
    console.error("Erro ao excluir laboratório: ", error);

    return response.status(500).json({ error: error.message });
  }
});

export default route;
