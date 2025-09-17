import express from "express";
import tipoUsuarioService from "../services/tipoUsuarioService.js";
import validationMiddleware from "../middleware/validationMiddleware.js";
import TipoUsuarioRequestDTO from "../DTOs/index.js";

const route = express.Router();

const validateCreate = validationMiddleware(
  TipoUsuarioRequestDTO,
  "validateCreate"
);
const validateUpdate = validationMiddleware(
  TipoUsuarioRequestDTO,
  "validateUpdate"
);
const validateDelete = validationMiddleware(
  TipoUsuarioRequestDTO,
  "validateDelete"
);

route.get("/", async (request, response) => {
  try {
    const tipos = await tipoUsuarioService.getTiposUsuario();
    return response.status(200).json(tipos);
  } catch (error) {
    console.error("Erro ao listar tipos de usuário: ", error);
    return response.status(500).json({ error: error.mensage });
  }
});

route.get("/:descricao", async (request, response) => {
  try {
    const { descricao } = request.params;
    const tipos = await tipoUsuarioService.getByDescricao(descricao);
    return response.status(200).json(tipos);
  } catch (error) {
    console.error("Erro ao buscar tipos por descrição: ", error);
    return response.status(500).json({ error: error.mensage });
  }
});

route.post("/", validateCreate, async (request, response) => {
  try {
    const newTipo = await tipoUsuarioService.postTipoUsuario(
      request.validatedData
    );
    return response.status(201).json({
      response: "Tipo de usuário cadastrado com sucesso!",
      data: newTipo,
    });
  } catch (error) {
    console.error("Erro ao cadastrar tipo de usuário: ", error);
    return response.status(400).json({ error: error.message });
  }
});

route.put("/:id", validateUpdate, async (request, response) => {
  try {
    const updateTipo = await tipoUsuarioService.putTipoUsuario(
      request.validatedData.id,
      request.validatedData
    );

    return response.status(200).json({
      response: "Tipo de usuário atualizado com sucesso!",
      data: updateTipo,
    });
  } catch (error) {
    console.error("Erro ao atualizar tipo de usuário: ", error);
    return response.status(400).json({ error: error.message });
  }
});

route.delete("/:id", validateDelete, async (request, response) => {
  try {
    await tipoUsuarioService.deleteTipoUsuario(request.validatedData.id);
    
    return response.status(200).json({
      response: "Tipo de usuário excluído com sucesso!",
    });
  } catch (error) {
    console.error("Erro ao excluir tipo de usuário: ", error);
    return response.status(400).json({ error: error.message });
  }
});

export default route;
