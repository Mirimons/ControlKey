import dotenv from "dotenv";
import { verifyToken } from "./generateToken";

dotenv.config();

async function authenticate(request, response, next) {
  try {
    const { authorization } = request.headers;

    if (!authorization) {
      return response.status(401).send({
        message: "Token não informado.",
      });
    }

    const [bearer, token] = authorization.split(" ");

    if (bearer !== "Bearer" && !token) {
      return response.status(401).send({
        message: "Formato de token inválido. Use: Bearer <token>",
      });
    }

    const usuario = await verifyToken(token, false);

    request.usuario = usuario;
    next();

  } catch (error) {
    console.error("Erro na autenticação: ", error.message);

    if (error.name === "TokenExpiredError") {
      return response.status(401).json({
        message: "Token expirado. Faça login novamente.",
      });
    }

    if(error.name === "JsonWebTokenError") {
      return response.status(401).json({
        message: "Token inválido.",
      });
    }

    return response.status(401).json({
      message: "Acesso não autorizado.",
    });
  }
}

export { authenticate };
