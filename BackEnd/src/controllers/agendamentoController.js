import express from "express";
import agendamentoService from "../services/agendamentoServices.js";

const route = express.Router();

// GET /agendamentos?nomeProfessor=&laboratorio=&dataUtilizacao=&status=&page=&limit=
route.get("/", async (request, response) => {
  try {
    const filtros = request.query;
    const resultado = await agendamentoService.getAgendamentos(filtros);
    return response.status(200).json({ response: resultado });
  } catch (error) {
    console.error("Erro ao buscar agendamentos:", error);
    return response.status(500).json({ response: error.message });
  }
});

// GET /agendamentos/:id
route.get("/:id", async (request, response) => {
  try {
    const { id } = request.params;
    const agendamento = await agendamentoService.getAgendamentoById(id);
    return response.status(200).json({ response: agendamento });
  } catch (error) {
    console.error("Erro ao buscar agendamento:", error);
    if (error.message.includes("não encontrado")) {
      return response.status(404).json({ response: error.message });
    }
    return response.status(400).json({ response: error.message });
  }
});

// POST /agendamentos
route.post("/", async (request, response) => {
  try {
    const novoAgendamento = await agendamentoService.postAgendamento(request.body);
    return response.status(201).json({
      response: "Agendamento criado com sucesso!",
      agendamento: novoAgendamento
    });
  } catch (error) {
    console.error("Erro ao criar agendamento:", error);
    if (error.message.includes("Conflito") || error.message.includes("não encontrado")) {
      return response.status(409).json({ response: error.message });
    }
    return response.status(400).json({ response: error.message });
  }
});

// PUT /agendamentos/:id
route.put("/:id", async (request, response) => {
  try {
    const { id } = request.params;
    const agendamentoAtualizado = await agendamentoService.putAgendamento(id, request.body);
    return response.status(200).json({
      response: "Agendamento atualizado com sucesso!",
      agendamento: agendamentoAtualizado
    });
  } catch (error) {
    console.error("Erro ao atualizar agendamento:", error);
    if (error.message.includes("não encontrado")) {
      return response.status(404).json({ response: error.message });
    }
    return response.status(400).json({ response: error.message });
  }
});

// DELETE /agendamentos/:id
route.delete("/:id", async (request, response) => {
  try {
    const { id } = request.params;
    await agendamentoService.deleteAgendamento(id);
    return response.status(200).json({ 
      response: "Agendamento excluído com sucesso!" 
    });
  } catch (error) {
    console.error("Erro ao excluir agendamento:", error);
    if (error.message.includes("não encontrado")) {
      return response.status(404).json({ response: error.message });
    }
    return response.status(400).json({ response: error.message });
  }
});

export default route;