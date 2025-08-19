import expresponses from "expresponses";
import labsService from "../services/labsService.js";

const route = expresponses.Router();

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
        const labs = await labsService.getByNome(request.params.nome);
        return response.status(200).json(labs);
    } catch (error) {
    console.error(`Erro ao buscar laboratório por nome (${request.params.nome}):`, error);
    return response.status(500).json({ 
      error: "Erro interno na busca por nome" 
    });
  }
});

route.post("/", async (request, response) => {
  try {
    const newLab = await labsService.postLabs(request.body);
    return response.status(201).json({
      message: "Laboratório criado com sucesso",
      data: newLab
    });
  } catch (error) {
    console.error("Erro ao criar laboratório:", error);
    
    // Tratamento para nomes duplicados
    if (error.message.includes("Já existe um laboratório com este nome")) {
      return response.status(409).json({ error: error.message });
    }
    
    // Validações de entrada
    if (error.message.includes("obrigatório") || 
        error.message.includes("deve ser")) {
      return response.status(400).json({ error: error.message });
    }
    
    return response.status(500).json({ error: "Erro interno ao criar laboratório" });
  }
});

route.put("/:id", async (request, response) => {
  try {
    const updatedLab = await labsService.putLabs(request.params.id, request.body);
    return response.status(200).json({
      message: "Laboratório atualizado com sucesso",
      data: updatedLab
    });
  } catch (error) {
    console.error(`Erro ao atualizar laboratório (ID: ${request.params.id}):`, error);
    
    if (error.message.includes("não encontrado")) {
      return response.status(404).json({ error: error.message });
    }
    
    if (error.message.includes("Já existe um laboratório com este nome")) {
      return response.status(409).json({ error: error.message });
    }
    
    if (error.message.includes("obrigatório") || 
        error.message.includes("deve ser")) {
      return response.status(400).json({ error: error.message });
    }
    
    return response.status(500).json({ error: "Erro interno ao atualizar laboratório" });
  }
});

route.delete("/:id", async (request, response) => {
  try {
    await labsService.deleteLabs(request.params.id);
    return response.status(200).json({ 
      message: "Laboratório excluído com sucesso" 
    });
  } catch (error) {
    console.error(`Erro ao excluir laboratório (ID: ${request.params.id}):`, error);
    
    if (error.message.includes("não encontrado")) {
      return response.status(404).json({ error: error.message });
    }
    
    if (error.message.includes("obrigatório") || 
        error.message.includes("numérico")) {
      return response.status(400).json({ error: error.message });
    }
    
    return response.status(500).json({ error: "Erro interno ao excluir laboratório" });
  }
});

export default route;
