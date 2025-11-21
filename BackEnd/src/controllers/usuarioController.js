import express, { response } from "express";
import usuarioService from "../services/usuarioService.js";
import { getErrorMessage } from "../helpers/errorHandler.js";
import { handleDatabaseError } from "../helpers/errorHandler.js";
import validationMiddleware from "../middleware/validationMiddleware.js";
import { UsuarioRequestDTO } from "../DTOs/index.js";

const route = express.Router();

const validateGetUsuarios = validationMiddleware(
  UsuarioRequestDTO,
  "validateGetUsuarios"
);
const validateCreate = validationMiddleware(
  UsuarioRequestDTO,
  "validateCreate"
);
const validateUpdate = validationMiddleware(
  UsuarioRequestDTO,
  "validateUpdate"
);
const validateDelete = validationMiddleware(
  UsuarioRequestDTO,
  "validateDelete"
);

// Função auxiliar para tratamento de erros
function handleUsuarioError(response, error) {
  if (error.code?.startsWith("ER_") || error.errno) {
    return response.status(409).json({
      response: handleDatabaseError(error),
      error: "Erro de banco de dados",
    });
  }

  if (error.message.includes("já cadastrado")) {
    return response.status(409).json({
      response: error.message,
      error: "Conflito de dados.",
    });
  }
  if (error.message.includes("não encontrado")) {
    return response.status(404).json({
      response: error.message,
      error: "Usuário não encontrado.",
    });
  }

  return response.status(500).json({
    response: "Erro interno no servidor.",
    error: getErrorMessage(error),
  });
}

route.get("/buscar/:identificacao", async (request, response) => {
  try {
    const { identificacao } = request.params;
    const usuario = await usuarioService.getUsuarioByIdentificacao(
      identificacao
    );

    if (!usuario) {
      return response.status(404).json({ response: "Usuário não encontrado." });
    }

    return response.status(200).json(usuario);
  } catch (error) {
    console.error("Erro ao buscar usuário por RM/CPF:", error);
    return response.status(500).json({
      response: "Erro interno no servidor.",
      error: getErrorMessage(error),
    });
  }
});

route.get("/:id", async (request, response) => {
  try {
    const { id } = request.params;
    const usuario = await usuarioService.getUsuarioById(id);

    if (!usuario) {
      return response.status(404).json({ response: "Usuário não encontrado." });
    }

    return response.status(200).json(usuario);
  } catch (error) {
    console.error("Erro ao buscar usuário: ", error);
    return response.status(500).json({
      response: "Erro interno no servidor.",
      error: getErrorMessage(error),
    });
  }
});

route.get("/", validateGetUsuarios, async (request, response) => {
  try {
    const usuarios = await usuarioService.getUsuarios(request.validatedData);
    return response.status(200).json(usuarios);
  } catch (error) {
    console.error("Erro ao listar usuários: ", error);
    return response.status(500).json({
      response: "Erro interno no servidor.",
      error: getErrorMessage(error),
    });
  }
});

//NOVAS ROTAS PARA USUÁRIOS DESATIVADOS
route.get("/inativos/listar", async (request, response) => {
  try {
    const usuariosInativos = await usuarioService.getInactiveUsuarios();
    return response.status(200).json(usuariosInativos);
  } catch (error) {
    console.error("Erro ao listar usuários inativos: ", error);
    return response.status(500).json({
      response: "Erro interno no servidor.",
      error: getErrorMessage(error),
    });
  }
});

route.get("/:id/inativo", async (request, response) => {
  try {
    const { id } = request.params;
    const usuario = await usuarioService.getUsuarioByIdIncludingInactive(id);

    if (!usuario) {
      return response.status(404).json({ response: "Usuário não encontrado." });
    }

    return response.status(200).json(usuario);
  } catch (error) {
    console.error("Erro ao buscar usuário (incluindo inativo): ", error);
    return response.status(500).json({
      response: "Erro interno no servidor.",
      error: getErrorMessage(error),
    });
  }
});

route.patch("/:id/reativar", async (request, response) => {
  try {
    const { id } = request.params;
    const usuarioReativado = await usuarioService.activateUsuario(id);

    return response.status(200).json({
      response: "Usuário reativado com sucesso!",
      data: usuarioReativado,
    });
  } catch (error) {
    console.error("Erro ao reativar usuário: ", error);
    return handleUsuarioError(response, error);
  }
});

route.post("/", validateCreate, async (request, response) => {
  try {
    const validatedData = request.validatedData;

    const newUsuario = await usuarioService.postUsuario(validatedData);

    return response.status(201).json({
      response: "Usuário cadastrado com sucesso!",
      data: {
        id: newUsuario.id,
        nome: newUsuario.nome,
        cpf: newUsuario.cpf,
        data_nasc: newUsuario.data_nasc,
        telefone: newUsuario.telefone,
        tipo: {
          id: newUsuario.tipo.id,
          desc_tipo: newUsuario.tipo.desc_tipo,
        },
        ...(newUsuario.usuario_cad && {
          cadastro: {
            matricula: newUsuario.usuario_cad.matricula,
            email: newUsuario.usuario_cad.email,
            tem_senha: !!newUsuario.usuario_cad.senha,
          },
        }),
      },
    });
  } catch (error) {
    console.error("Erro ao cadastrar usuário: ", error);
    return handleUsuarioError(response, error);
  }
});

route.put("/:id", validateUpdate, async (request, response) => {
  try {
    const updatedUsuario = await usuarioService.putUsuario(
      request.validatedData.id,
      request.validatedData
    );
    return response.status(200).json({
      response: "Usuário atualizado com sucesso!",
      data: updatedUsuario,
    });
  } catch (error) {
    console.error("Erro ao atualizar usuário:", error);
    return handleUsuarioError(response, error);
  }
});

route.delete("/:id", validateDelete, async (request, response) => {
  try {
    await usuarioService.deleteUsuario(request.validatedData.id);
    return response.status(200).json({
      response: "Usuário desativado com sucesso!",
    });
  } catch (error) {
    console.error("Erro ao desativar usuário:", error);
    return handleUsuarioError(response, error);
  }
});

export default route;
