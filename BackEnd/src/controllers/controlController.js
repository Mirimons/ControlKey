import express, { response } from "express";
import controlService from "../services/controlService.js";
import { ControlRequestDTO } from "../DTOs/index.js";
import { getErrorMessage } from "../helpers/errorHandler.js";
import validationMiddleware from "../middleware/validationMiddleware.js";

const route = express.Router();

const validateGetControls = validationMiddleware(
  ControlRequestDTO,
  "validateGetControls"
);
const validateOpen = validationMiddleware(ControlRequestDTO, "validateOpen");
const validateClose = validationMiddleware(ControlRequestDTO, "validateClose");
const validateCiente = validationMiddleware(
  ControlRequestDTO,
  "validateCiente"
);
const validateDelete = validationMiddleware(
  ControlRequestDTO,
  "validateDelete"
);

//Função auxiliar para tratamento de erros
function handleControlError(response, error) {
  if (error.message.includes("não encontrado")) {
    return response.status(404).json({
      response: error.message,
      error: "Recurso não encontrado.",
    });
  }

  if (error.message.includes("já tem")) {
    return response.status(409).json({
      response: error.message,
      error: "Conflito de dados.",
    });
  }

  return response.status(500).json({
    response: "Erro interno no servidor.",
    error: getErrorMessage(error),
  });
}

route.get("/:id", async (request, response) => {
    try {
        const { id } = request.params;
        const control = await controlService.getControlById(id);
    
        if (!control) {
          return response.status(404).json({ response: "Control não encontrada." });
        }
    
        return response.status(200).json(control);
      } catch (error) {
        console.error("Erro ao buscar control: ", error);
        return response.status(500).json({
          response: "Erro interno no servidor.",
          error: getErrorMessage(error),
        });
      }
})

route.get("/", validateGetControls, async (request, response) => {
  try {
    const controles = await controlService.getControls(request.validatedData);
    return response.status(200).json(controles);
  } catch (error) {
    console.error("Erro ao buscar controles com filtros: ", error);
    return response.status(500).json({
      response: "Erro interno no servidor.",
      error: getErrorMessage(error),
    });
  }
});

//Retirada
route.post("/retirada", validateOpen, async (request, response) => {
  try {
    const newControl = await controlService.openControl(request.validatedData);
    return response.status(201).json({
      response: "Control registrada com sucesso!",
      data: newControl,
    });
  } catch (error) {
    console.error("Erro ao registrar control: ", error);
    return handleControlError(response, error);
  }
});

//Devolução
route.put("/devolucao", validateClose, async (request, response) => {
  try {
    const updatedControl = await controlService.closeControl(
      request.validatedData
    );
    return response.status(200).json({
      response: "Controle fechado com sucesso!",
      data: updatedControl,
    });
  } catch (error) {
    console.error("Erro ao fechar controle: ", error);
    return handleControlError(response, error);
  }
});

//Ciente
route.put("/ciente/:id", validateCiente, async (request, response) => {
  try {
    const updatedControl = await controlService.confirmAwareness(
      request.validatedData
    );
    return response.status(200).json({
      response: "Controle marcado como ciente!",
      data: updatedControl,
    });
  } catch (error) {
    console.error("Erro ao marcar controle como ciente: ", error);
    return handleControlError(response, error);
  }
});

route.delete("/:id", validateDelete, async (request, response) => {
  try {
    await controlService.deleteControl(request.validatedData.id);
    return response.status(200).json({
      response: "Controle excluído com sucesso!",
    });
  } catch (error) {
    console.error("Erro ao excluir controle: ", error);
    return handleControlError(response, error);
  }
});

export default route;
