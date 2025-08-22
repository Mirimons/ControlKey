import dotenv from "dotenv";
import jwt from 'jsonwebtoken';

dotenv.config();

const secret = process.env.JWT_SECRET;

function authenticate(request, response, next) {
  const { authorization } = request.headers;

  if (!authorization) {
    return response.status(401).send({
      message: "Token não informado."
    });
  }

  const bearer = authorization.split(" ")[0];
  const token = authorization.split(" ")[1];

  if (bearer != "Bearer" && !token) {
    return response.status(401).send({
      message: "Formato de token inválido. Use: Bearer <token>",
    });
  }

  jwt.verify(token, secret, (erro, user) => {
    if (erro)
      return response.status(401).send({
        message: "Acesso não autorizado. Token inválido",
      });
    request.user = user;
    next();
  });
}

export {authenticate};