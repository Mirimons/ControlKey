import { toast } from "react-toastify";

export const handleApiError = (error, genericMessage = "Ocorreu um erro inesperado.") => {
  console.error("Erro na API:", error);

  if (error.request && !error.response) {
    toast.error("Não foi possível conectar ao servidor. Verifique sua rede.");
    return null;
  }

  if (error.response) {
    const { data, status } = error.response;

    // 🚨 CASO A: Erro de Validação (400) com ARRAY de erros (SEU CASO)
    if (status === 400 && data.errors && Array.isArray(data.errors)) {

      // Converte o array de erros em um objeto { campo: mensagem }
      const validationErrors = data.errors.reduce((acc, currentError) => {
        if (currentError.field && currentError.message) {
          acc[currentError.field] = currentError.message;
        }
        return acc;
      }, {});

      // 🛑 REMOVEMOS A CHAMADA toast.error AQUI
      // Isto garante que para ERROS DE VALIDAÇÃO 400, APENAS 
      // a mensagem vermelha abaixo do campo apareça.

      return validationErrors; // Retorna o objeto para o Front-end
    }

    // CASO B: Outros Erros (401, 404, 500, etc., ou 400 com mensagem simples)
    if (data.response || data.message) {
      // Mantém o toast para erros não relacionados à validação de campos
      toast.error(data.response || data.message);
      return null;
    }
  }

  // Erro Genérico (Ex: erro de rede)
  toast.error(genericMessage);
  return null;
};