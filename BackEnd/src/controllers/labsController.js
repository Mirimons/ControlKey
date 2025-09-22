import express from "express";
import labsService from "../services/labsService.js";
import validationMiddleware from "../middleware/validationMiddleware.js";
import { LabRequestDTO } from "../DTOs/index.js";

const validateCreate = validationMiddleware(LabRequestDTO, "validateCreate");
const validateUpdate = validationMiddleware(LabRequestDTO, "validateUpdate");
const validateDelete = validationMiddleware(LabRequestDTO, "validateDelete");

const route = express.Router();

route.get("/", async (request, response) => {
    try{
        const labs = await labsService.getLabs();
        return response.status(200).json(labs);
    } catch (error) {
        console.error("Erro ao listar os laboratórios: ", error);
        return response.status(500).json({
            error: "Erro interno ao listar os laboratórios."
        });
    }
});

route.get("/:nome", async (request, response) => {
    try {
        const { nome } = request.params;
        const labs = await labsService.getByNome(nome);
        return response.status(200).json(labs);
    } catch (error) {
    console.error("Erro ao buscar laboratório por nome: ", error);
    return response.status(500).json({ 
      error: error.message});
  }
});

route.post("/", validateCreate, async (request, response) => {
  try {
    const newLab = await labsService.postLabs(request.validatedData);
    return response.status(201).json({
      response: "Laboratório criado com sucesso",
      data: newLab
    });
  } catch (error) {
    console.error("Erro ao criar laboratório: ", error);
    if (error.message.includes("Já existe um laboratório com este nome.")) {
      return response.status(409).json({ error: error.message });
    }
    }
    
    return response.status(500).json({ error: "Erro interno ao criar laboratório." });
  }
);

route.put("/:id", validateUpdate, async (request, response) => {
  try {
    const updatedLab = await labsService.putLabs(request.validatedData.id, request.validatedData);
    return response.status(200).json({
      response: "Laboratório atualizado com sucesso!",
      data: updatedLab
    });
  } catch (error) {
    console.error("Erro ao atualizar laboratório: ", error);
    
    return response.status(500).json({ error:error.message});
  }
});

route.delete("/:id", validateDelete, async (request, response) => {
  try {
    await labsService.deleteLabs(request.validatedData.id);
    return response.status(200).json({ 
      response: "Laboratório excluído com sucesso!" 
    });
  } catch (error) {
    console.error("Erro ao excluir laboratório: ", error);
    
    return response.status(500).json({ error: error.message});
  }
});

export default route;
