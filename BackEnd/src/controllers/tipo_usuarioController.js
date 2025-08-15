import express from "express";
import tipoUsuarioService from "../services/tipoUsuarioService";
import tipoUsuarioService from "../services/tipoUsuarioService";

const route = express.Router();

route.get("/", async (request, response) => {
  try {
    const tipos = await tipoUsuarioService.getTiposUsuario();
    return response.status(200).json({ response: tipos });
  } catch (error) {
    return response.status(500).json({ error: error.mensage });
  }
});

route.get("/:nameFound", async (request, response) => {
    try {
        const tipos = await tipoUsuarioService.getByDescricao(request.params.nameFound);
        return response.status(200).json({ response: tipos});
    } catch (error) {
        return response.status(500).json({ error: error.mensage});
    }
});

route.post("/", async (request, response) => {
    try {
        const newTipo = await tipoUsuarioService.postTipoUsuario(request.body);
        return response.status(201).json({ 
            response: "Tipo de usuário cadastrado com sucesso!",
            data: newTipo
        });
    } catch (error) {
    return response.status(400).json({ error: error.message });
  }
});

route.put("/:id", async (request, response) => {
  try {
    const updateTipo = await tipoUsuarioService.putTipoUsuario(
      request.params.id, 
      request.body
    );
    return response.status(200).json({ 
      response: "Tipo de usuário atualizado com sucesso!",
      data: updateTipo
    });
  } catch (error) {
    return response.status(400).json({ error: error.message });
  }
});

route.delete("/:id", async (request, response) => {
  try {
    await tipoUsuarioService.deleteTipoUsuario(request.params.id);
    return response.status(200).json({
      response: "Tipo de usuário excluído com sucesso!"
    });
  } catch (error) {
    return response.status(400).json({ error: error.message });
  }
});

export default route;