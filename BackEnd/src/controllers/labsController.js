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

// Buscar laboratórios livres conforme o nome digitado
route.get("/buscar/:nome", async (request, response) => {
  try {
    const { nome } = request.params;
    const labsLivres = await labsService.getByNomeLivre(nome);
    return response.status(200).json(labsLivres);
  } catch (error) {
    console.error("Erro ao buscar laboratórios: ", error);
    return response.status(500).json({
      response: "Erro interno no servidor.",
      error: error.message,
    });
  }
});

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

//NOVAS ROTAS PARA LABORATÓRIOS DESATIVADOS
//Listar apenas os laboratórios inativos
route.get("/inativos/listar", async (request, response) => {
  try {
    const labsInativos = await labsService.getInactiveLab();
    return response.status(200).json(labsInativos);
  } catch (error) {
    console.error("Erro ao listar equipamentos inativos: ", error);
    return response.status(500).json({
      response: "Erro interno no servidor.",
      error: getErrorMessage(error),
    });
  }
});

//Lostar por ID todos (ativos e inativos)
route.get("/:id/inativo", async (request, response) => {
  try {
    const { id } = request.params;
    const lab = await labsService.getLabByIdIncludingInactive(id);

    if (!lab) {
      return response
        .status(404)
        .json({ response: "Laboratório não encontrado." });
    }
    return response.status(200).json(lab);
  } catch (error) {
    console.error("Erro ao buscar laboratório (incluindo inativo): ", error);
    return response.status(500).json({
      response: "Erro interno no servidor.",
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

route.patch("/:id/reativar", async (request, response) => {
  try {
    const { id } = request.params;
    const labReativado = await labsService.activateLab(id);

    return response.status(200).json({
      response: "Laboratório reativado com sucesso!",
      data: labReativado,
    });
  } catch (error) {
    console.error("Erro ao reativar laboratório: ", error);
    if (error.message.includes("não encontrado")) {
      return response.status(404).json({ error: error.message });
    }
    return response.status(400).json({ error: error.message });
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
