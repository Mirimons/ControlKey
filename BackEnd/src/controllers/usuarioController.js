import express from "express";
import usuarioService from "../services/usuarioService.js";
import { getErrorMessage } from "../helpers/errorHandler.js";
import { handleDatabaseError } from "../helpers/errorHandler.js";
import validationMiddleware from "../middleware/validationMiddleware.js";
import UsuarioRequestDTO from "../DTOs/usuarioRequestDTO.js";

const route = express.Router();

const validateCreate = validationMiddleware(UsuarioRequestDTO, 'validateCreate');
const validateUpdate = validationMiddleware(UsuarioRequestDTO, 'validateUpdate');
const validateDelete = validationMiddleware(UsuarioRequestDTO, 'validateDelete');

route.get("/", async (request, response) => {
  try {
    const usuarios = await usuarioService.getUsuarios();
    return response.status(200).json({ response: usuarios });
  } catch (error) {
    console.error("Erro ao listar usuários: ", error);
    return response.status(500).json({
      response: "Erro interno no servidor.",
      error: getErrorMessage(error),
    });
  }
});

route.get("/search/:nome", async (request, response) => {
  try {
    const { nome } = request.params;
    const usuarios = await usuarioService.getByNome(nome);
    return response.status(200).json({ response: usuarios });
  } catch (error) {
    console.error("Erro ao buscar usuários por nome: ", error);
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

    return response.status(200).json({ response: usuario });
  } catch (error) {
    console.error("Erro ao buscar usuário: ", error);
    return response.status(500).json({
      response: "Erro interno no servidor.",
      error: getErrorMessage(error),
    });
  }
});

route.post("/", validateCreate, async (request, response) => {
  try {
    const newUsuario = await usuarioService.postUsuario(request.validatedData);
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
      response: "Usuário excluído com sucesso!",
    });
  } catch (error) {
    console.error("Erro ao excluir usuário:", error);
    return handleUsuarioError(response, error);
  }
});

// Função auxiliar para tratamento de erros
function handleUsuarioError(response, error) {
  if (error.code?.startsWith('ER_') || error.errno) {
    return response.status(409).json({
      response: handleDatabaseError(error),
      error: "Erro de banco de dados"
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

export default route;




// import express from "express";
// import usuarioService from "../services/usuarioService.js";
// import { getErrorMessage } from "../helpers/errorHandler.js";
// import { handleDatabaseError } from "../helpers/errorHandler.js";

// const route = express.Router();

// route.get("/", async (request, response) => {
//   try {
//     const usuarios = await usuarioService.getUsuarios();
//     return response.status(200).json({ response: usuarios });
//   } catch (error) {
//     console.error("Erro ao listar usuários: ", error);
//     return response.status(500).json({
//       response: "Erro interno no servidor.",
//       error: getErrorMessage(error),
//     });
//   }
// });

// route.get("/search/:nome", async (request, response) => {
//   try {
//     const { nome } = request.params;
//     const usuarios = await usuarioService.getByNome(nome);
//     return response.status(200).json({ response: usuarios });
//   } catch (error) {
//     console.error("Erro ao buscar usuários por nome: ", error);
//     return response.status(500).json({
//       response: "Erro interno no servidor.",
//       error: getErrorMessage(error),
//     });
//   }
// });

// route.get("/:id", async (request, response) => {
//   try {
//     const { id } = request.params;
//     const usuario = await usuarioService.getUsuarioById(id);

//     if (!usuario) {
//       return response.status(404).json({ response: "Usuário não encontrado." });
//     }

//     return response.status(200).json({ response: usuario });
//   } catch (error) {
//     console.error("Erro ao buscar usuário: ", error);
//     return response.status(500).json({
//       response: "Erro interno no servidor.",
//       error: getErrorMessage(error),
//     });
//   }
// });

// route.post("/", async (request, response) => {
//   try {
//     const newUsuario = await usuarioService.postUsuario(request.body);
//     return response.status(201).json({
//       response: "Usuário cadastrado com sucesso!",
//       data: {
//         id: newUsuario.id,
//         nome: newUsuario.nome,
//         cpf: newUsuario.cpf,
//         data_nasc: newUsuario.data_nasc,
//         telefone: newUsuario.telefone,
//         tipo: {
//           id: newUsuario.tipo.id,
//           desc_tipo: newUsuario.tipo.desc_tipo,
//         },
//         ...(newUsuario.usuario_cad && {
//           cadastro: {
//             matricula: newUsuario.usuario_cad.matricula,
//             email: newUsuario.usuario_cad.email,
//             tem_senha: !!newUsuario.usuario_cad.senha,
//           },
//         }),
//       },
//     });
//   } catch (error) {
//     console.error("Erro ao cadastrar usuário: ", error);

//     if (error.code?.startsWith('ER_') || error.errno) {
//       return response.status(409).json({
//         response: handleDatabaseError(error),
//         error: "Erro de banco de dados"
//       });
//     }

//     if (error.message.includes("já cadastrado")) {
//       return response.status(409).json({
//         response: error.message,
//         error: "Conflito de dados.",
//       });
//     }
//     if (error.message.includes("não encontrado")) {
//       return response.status(404).json({
//         response: error.message,
//         error: "Usuário não encontrado.",
//       });
//     }
//     if (
//       error.message.includes("obrigatório") ||
//       error.message.includes("inválido") ||
//       error.message.includes("deve ter") ||
//       error.message.includes("precisa")
//     ) {
//       return response.status(400).json({
//         response: error.message,
//         error: "Dados inválidos.",
//       });
//     }

//     return response.status(500).json({
//       response: "Erro interno no servidor.",
//       error: getErrorMessage(error),
//     });
//   }
// });

// route.put("/:id", async (request, response) => {
//   try {
//     const { id } = request.params;
//     const updatedUsuario = await usuarioService.putUsuario(
//       Number(id),
//       request.body
//     );
//     return response.status(200).json({
//       response: "Usuário atualizado com sucesso!",
//       data: updatedUsuario,
//     });
//   } catch (error) {
//     console.error("Erro ao atualizar usuário:", error);

//     if (error.code?.startsWith('ER_') || error.errno) {
//       return response.status(409).json({
//         response: handleDatabaseError(error),
//         error: "Erro de banco de dados"
//       });
//     }

//     if (error.message.includes("já cadastrado")) {
//       return response.status(409).json({
//         response: error.message,
//         error: "Conflito de dados.",
//       });
//     }
//     if (error.message.includes("não encontrado")) {
//       return response.status(404).json({
//         response: error.message,
//         error: "Usuário não encontrado.",
//       });
//     }
//     if (
//       error.message.includes("obrigatório") ||
//       error.message.includes("inválido") ||
//       error.message.includes("deve ter") ||
//       error.message.includes("precisa")
//     ) {
//       return response.status(400).json({
//         response: error.message,
//         error: "Dados inválidos.",
//       });
//     }
//     return response.status(500).json({
//       response: "Erro interno no servidor.",
//       error: getErrorMessage(error),
//     });
//   }
// });

// route.delete("/:id", async (request, response) => {
//   try {
//     const { id } = request.params;
//     await usuarioService.deleteUsuario(Number(id));

//     return response.status(200).json({
//       response: "Usuário excluído com sucesso!",
//     });
//   } catch (error) {
//     console.error("Erro ao excluir usuário:", error);

//     if (error.message.includes("não encontrado")) {
//       return response
//         .status(404)
//         .json({ response: error.message, error: "Usuário não encontrado." });
//     }

//     return response.status(500).json({
//       response: "Erro interno no servidor.",
//       error: getErrorMessage(error),
//     });
//   }
// });

// export default route;
