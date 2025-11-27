import express from "express";
import controlService from "../services/controlService.js";
import { ControlRequestDTO } from "../DTOs/index.js";
import { getErrorMessage } from "../helpers/errorHandler.js";
import {
  validationMiddleware,
  isAdmin,
  authenticateToken,
} from "../middleware/index.js";

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
const validateAdminClose = validationMiddleware(
  ControlRequestDTO,
  "validateAdminClose"
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
});

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

//NOVA ROTA PARA BUSCAR CONTROLES DO USUÁRIO
route.get("/usuario/:identificador", async (request, response) => {
  try {
    const { identificador } = request.params;
    const controles = await controlService.getControlsByUsuario(identificador);

    return response.status(200).json({
      success: true,
      data: controles,
      message: "Controles do usuário recuperados com sucesso",
    });
  } catch (error) {
    console.error("Erro ao buscar controles do usuário: ", error);
    return response.status(500).json({
      success: false,
      data: [],
      message: error.message,
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

//Rota protegida para admin: Rota de teste do job implementado
route.post(
  "/fechamento-automatico",
  authenticateToken,
  isAdmin,
  async (request, response) => {
    if (process.env.NODE_ENV === "production") {
      return response.status(403).json({
        response:
          "Esta rota está disponível apenas em ambiente de desenvolvimento",
      });
    }
    console.log("Ambiente atual: ", process.env.NODE_ENV);

    try {
      const result = await controlService.autoCloseControl();
      return response.status(200).json({
        response: "Fechamento automático executado com sucesso!",
        data: result,
      });
    } catch (error) {
      console.error("Erro no fechamento automático: ", error);
      return response.status(500).json({
        response: "Erro ao executar fechamento automático",
        error: getErrorMessage(error),
      });
    }
  }
);

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

//Rota para admins fecharem qualquer contorle
route.put(
  "/admin/devolucao",
  authenticateToken,
  validateAdminClose,
  async (request, response) => {
    try {
      const { id_control } = request.body;

      if (!id_control) {
        return response.status(400).json({
          success: false,
          message: "ID do controle é obrigatório",
        });
      }

      const result = await controlService.closeControlAsAdmin(id_control);

      return response.status(200).json(result);
    } catch (error) {
      console.error("Erro ao fechar controle como admin: ", error);

      if (
        error.message.includes("não encontrado") ||
        error.message.includes("já está fechado")
      ) {
        return response.status(400).json({
          success: false,
          message: error.message,
        });
      }

      return response.status(500).json({
        success: false,
        message: "Erro interno ao fechar controle.",
      });
    }
  }
);

//Ciente
route.patch("/ciente/:id", validateCiente, async (request, response) => {
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
