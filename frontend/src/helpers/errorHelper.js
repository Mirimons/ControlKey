import { toast } from "react-toastify";

export const handleApiError = (error, genericMessage = "Ocorreu um erro inesperado.") => {
  console.error("Erro na API:", error);

  if (error.request && !error.response) {
    toast.error("Não foi possível conectar ao servidor. Verifique sua rede.");
    return null;
  }

  if (error.response) {
    const { data, status } = error.response;

    // CASO A: Erro de Validação (400)
    // Se o backend retornou Status 400 E uma lista de erros (validation errors)
    if (status === 400 && data.errors && Array.isArray(data.errors)) {
      
      // 🚨 MUDANÇA CRUCIAL AQUI: Converter o Array de erros em um Objeto simples
      const validationErrors = data.errors.reduce((acc, currentError) => {
        // Usa o 'field' como chave (ex: 'cpf') e o 'message' como valor
        if (currentError.field && currentError.message) {
          acc[currentError.field] = currentError.message;
        }
        return acc;
      }, {}); // Começa com um objeto vazio {}

      // Exibe um toast genérico para avisar sobre a validação
      toast.error(data.message || "Por favor, corrija os erros no formulário.");
      
      return validationErrors; // Retorna o objeto { chave: valor } para setErros
    }

    // CASO B: Erros de Negócio (404, 409, 500)
    // (Ainda usa a chave 'response' ou 'message' para exibir o erro)
    if (data.response || data.message) {
      toast.error(data.response || data.message);
      return null;
    }
  }
  
  // Erro Genérico
  toast.error(genericMessage);
  return null;
};