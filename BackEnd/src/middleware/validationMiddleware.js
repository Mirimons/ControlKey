function validationMiddleware(DTOClass, validationMethod) {
  return async (request, response, next) => {
    try {
      const data = { ...request.body, ...request.params, ...request.query };
      
      const dtoInstance = new DTOClass(data);
      const isValid = await dtoInstance[validationMethod]();

      if (!isValid) {
        return response.status(400).json({
          success: false,
          message: 'Erro de validação',
          errors: dtoInstance.getErrors()
        });
      }

      request.validatedData = dtoInstance.getValidatedData();
      next();
    } catch (error) {
      console.error('Erro no middleware de validação:', error);
      return response.status(500).json({
        success: false,
        message: 'Erro interno no servidor de validação'
      });
    }
  };
}

export default validationMiddleware;