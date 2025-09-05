import { validateAndFormatDate } from "./dateValidator.js";

const validationUtils = {
  isEmail: (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  isCPF: (cpf) => {
    if (!cpf) return false;
    const cleanedCPF = cpf.toString().replace(/\D/g, '');
    return cleanedCPF.length === 11 && !isNaN(cleanedCPF);
  },

  isPhone: (telefone) => {
    if (!telefone) return false;
    const cleanedPhone = telefone.toString().replace(/\D/g, '');
    return cleanedPhone.length >= 10 && cleanedPhone.length <= 11 && !isNaN(cleanedPhone);
  },

  isString: (value) => typeof value === 'string',
  isNumber: (value) => typeof value === 'number' && !isNaN(value),
  isOptional: (value) => value === undefined || value === null,
  
  validateMinLength: (value, min) => {
    if (value === undefined || value === null) return true;
    return value.toString().trim().length >= min;
  },

  validateDate: (date) => {
    return validateAndFormatDate(date);
  }
};

export default validationUtils;