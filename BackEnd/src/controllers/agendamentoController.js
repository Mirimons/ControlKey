import express from "express";
import agendamentoService from "../services/agendamentoServices.js";
import validationMiddleware from "../middleware/validationMiddleware.js";
import {AgendamentoRequestDTO} from "../DTOs/index.js";

const route = express.Router();

const validateCreate = validationMiddleware(
  AgendamentoRequestDTO,
  "validateCreate"
);
const validateUpdate = validationMiddleware(
  AgendamentoRequestDTO,
  "validateUpdate"
);
const validateDelete = validationMiddleware(
  AgendamentoRequestDTO,
  "validateDelete"
);
const validateGetAgendamentos = validationMiddleware(
  AgendamentoRequestDTO,
  "validateGetAgendamentos"
);

//GET com os filtros
route.get("/", validateGetAgendamentos, async (request, response) => {
  try {
    const resultado = await agendamentoService.getAgendamentos(
      request.validatedData
    );
    return response.status(200).json(resultado);
  } catch (error) {
    console.error("Erro ao buscar agendamentos:", error);
    return response.status(500).json({ response: error.message });
  }
});

route.get("/:id", async (request, response) => {
  try {
    const {id} = request.params

     if (!id && isNaN(Number(id))) {
      return response.status(400).json({ 
        response: "ID do agendamento é obrigatório e deve ser numérico" 
      });
    }
    const agendamento = await agendamentoService.getAgendamentoById(Number(id));
    return response.status(200).json(agendamento);
  } catch (error) {
    console.error("Erro ao buscar agendamento:", error);
    if (error.message.includes("não encontrado")) {
      return response.status(404).json({ response: error.message });
    }
    return response.status(400).json({ response: error.message });
  }
});

route.post("/", validateCreate, async (request, response) => {
  try {
    const novoAgendamento = await agendamentoService.postAgendamento(
      request.validatedData
    );
    return response.status(201).json({
      response: "Agendamento criado com sucesso!",
      agendamento: novoAgendamento,
    });
  } catch (error) {
    console.error("Erro ao criar agendamento:", error);
    if (
      error.message.includes("Conflito") ||
      error.message.includes("não encontrado")
    ) {
      return response.status(409).json({ response: error.message });
    }
    return response.status(400).json({ response: error.message });
  }
});

route.put("/:id", validateUpdate, async (request, response) => {
  try {
    const agendamentoAtualizado = await agendamentoService.putAgendamento(
      request.validatedData.id,
      request.validatedData
    );
    return response.status(200).json({
      response: "Agendamento atualizado com sucesso!",
      agendamento: agendamentoAtualizado,
    });
  } catch (error) {
    console.error("Erro ao atualizar agendamento:", error);
    if (error.message.includes("não encontrado")) {
      return response.status(404).json({ response: error.message });
    }
    return response.status(400).json({ response: error.message });
  }
});

route.delete("/:id",validateDelete, async (request, response) => {
  try {
    await agendamentoService.deleteAgendamento(request.validatedData.id);
    return response.status(200).json({
      response: "Agendamento excluído com sucesso!",
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
