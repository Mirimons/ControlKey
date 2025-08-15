import express from "express";
import usuarioService from "../services/usuarioService.js";

const route = express.Router();

route.get("/", async (request, response) => {
  try {
    const usuarios = await usuarioService.getUsuarios();
    return response.status(200).json({ response: usuarios });
  } catch (error) {
    return response.status(500).json({ response: error.message });
  }
});

route.get("/:nameFound", async (request, response) => {
  try {
    const { nameFound } = request.params;
    const usuarioFound = await usuarioService.getByNome(nameFound);
    return response.status(200).json({ response: usuarioFound });
  } catch (error) {
    return response.status(500).json({ response: error.message });
  }
});

route.post("/", async (request, response) => {
  try {
    const novoUsuario = await usuarioService.postUsuario(request.body);
    return response.status(201).json({
      response: "Usuário cadastrado com sucesso!",
      usuario: novoUsuario,
    });
  } catch (error) {
    console.error("Erro ao cadastrar usuário:", error);
    if (
      error.message.includes("já cadastrado") ||
      error.message.includes("não encontrado")
    ) {
      return response.status(409).json({ response: error.message });
    }
    return response.status(400).json({ response: error.message });
  }
});

route.put("/:id", async (request, response) => {
  try {
    const { id } = request.params;
    const usuarioAtualizado = await usuarioService.putUsuario(id, request.body);
    return response.status(200).json({
      response: "Usuário atualizado com sucesso!",
      usuario: usuarioAtualizado,
    });
  } catch (error) {
    console.error("Erro ao atualizar usuário:", error);
    return response.status(400).json({ response: error.message });
  }
});

route.delete("/:id", async (request, response) => {
  try {
    const { id } = request.params;
    await usuarioService.deleteUsuario(id);
    return response
      .status(200)
      .json({ response: "Usuário excluído com sucesso!" });
  } catch (error) {
    console.error("Erro ao excluir usuário:", error);
    return response.status(400).json({ response: error.message });
  }
});

export default route;