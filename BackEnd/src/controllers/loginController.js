import express from "express";
import loginService from "../services/loginService.js";

const route = express.Router();

//Para que os dados do usuário, como o login e senha, não sejam expostos com o get,é usado o post
route.post("/", async (request, response) => {
  try {
    const { email, senha } = request.body;
    const loginResult = await loginService.login(email, senha);

    return response.status(200).json(loginResult);
  } catch (error) {
    console.error("Erro no login: ", error);

    if (
      error.message.includes("inválido") ||
      error.message.includes("Credenciais")
    ) {
      return response.status(401).json({ error: error.message });
    }

    if (
      error.message.includes("obrigatório") ||
      error.message.includes("mínimo")
    ) {
      return response.status(400).json({ error: error.message });
    }

    return response.status(500).json({ error: "Erro interno no servidor." });
  }
});

route.put("/reset", async (request, response) => {
  try {
    const { email } = request.body;
    const result = await loginService.resetPassword(email);
    return response.status(200).json(result);
  } catch (error) {
    if(error.message.includes("Aguarde")) {
      return response.status(429).json({error: error.message});
    }
    if (
      error.message.includes("inválido") ||
      error.message.includes("não encontrado")
    ) {
      return response.status(400).json({ error: error.message });
    }

    return response.status(500).json({ error: "Erro interno no servidor." });
  }
});

export default route;