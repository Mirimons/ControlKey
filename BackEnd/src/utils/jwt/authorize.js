import {
  getPermittedTypesMessage,
  PERMISSIONS,
  TIPO_USUARIO_DESC,
} from "../constants.js";

function authorize(requiredTypes = []) {
  return (request, response, next) => {
    if (!request.usuario) {
      return response.status(401).json({
        message: "Usuário não autenticado",
      });
    }

    if (requiredTypes.length === 0) {
      return next();
    }

    if (requiredTypes.includes(request.usuario.id_tipo)) {
      return next();
    }

    return response.status(403).json({
      message: "Acesso não autorizado. Permissões insuficientes.",
      detail: getPermittedTypesMessage(requiredTypes),
      userType: TIPO_USUARIO_DESC[request.usuario.id_tipo] || "Desconhecido",
      requiredTypes: requiredTypes.map((type) => ({
        id: type,
        desc_tipo: TIPO_USUARIO_DESC[type] || "Desconhecido",
      })),
    });
  };
}

export { authorize, PERMISSIONS };
