import jwt from "jsonwebtoken";

function authorize(requiredTypes = []) {
  return (request, response, next) => {
    if (!request.user) {
      return response.status(401).json({
        message: "Usuário não autenticado",
      });
    }

    if (requiredTypes.length === 0) {
      return next();
    }

    if (requiredTypes.includes(request.user.tipo_id)) {
      return next();
    }

    return response.status(403).json({
      message: "Acesso não autorizado. Permissões insuficientes.",
    });
  };
}

export { authorize };
