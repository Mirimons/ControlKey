import validationUtils from "../utils/validationUtils.js";

class BaseDTO {
  constructor(data) {
    this.data = data;
    this.errors = [];
    this.validatedData = {};
  }

  validateNumber(field, fieldName) {
    const value = this.data[field];
    if (!value) {
      this.addError(field, `${fieldName} é obrigatório.`);
      return false;
    }
    if (!validationUtils.isNumber(value)) {
      this.addError(field, `${fieldName} é obrigatório e precisa ser numérico`);
      return false;
    }
    this.validatedData[field] = Number(value);
    return true;
  }

  validateString(field, fieldName, minLength = 2) {
    const value = this.data[field];
    if (!value) {
      this.addError(field, `${fieldName} é obrigatório.`);
      return false;
    }
    
    if (
      !validationUtils.isString(value) ||
      !validationUtils.validateMinLength(value, minLength)
    ) {
      this.addError(
        field,
        `${fieldName} deve ter pelo menos ${minLength} caracteres.`
      );
      return false;
    }
    this.validatedData[field] = value.toString().trim();
    return true;
  }

  validateEmail(field, fieldName) {
    const value = this.data[field];
    if (!value) {
      this.addError(field, `${fieldName} é obrigatório`);
      return false;
    }
    if (!validationUtils.isEmail(value)) {
      this.addError(field, `${fieldName} inválido`);
      return false;
    }
    this.validatedData[field] = value.trim();
    return true;
  }

  validateCPF(field, fieldName) {
    const value = this.data[field];
    if (!value) {
      this.addError(field, `${fieldName} é obrigatório`);
      return false;
    }
    if (!validationUtils.isCPF(value)) {
      this.addError(field, `${fieldName} deve ter 11 dígitos numéricos`);
      return false;
    }
    this.validatedData[field] = value.toString().replace(/\D/g, "");
    return true;
  }

  validatePhone(field, fieldName) {
    const value = this.data[field];
    if (!value) {
      this.addError(field, `${fieldName} é obrigatório`);
      return false;
    }
    if (!validationUtils.isPhone(value)) {
      this.addError(field, `${fieldName} inválido`);
      return false;
    }
    this.validatedData[field] = value.toString().replace(/\D/g, "");
    return true;
  }

  validateDate(field, fieldName) {
    const value = this.data[field];
    if (!value) {
      this.addError(field, `${fieldName} é obrigatório`);
      return false;
    }
    const dateValidation = validationUtils.validateDate(value);
    if (!dateValidation.isValid) {
      this.addError(field, dateValidation.error);
      return false;
    }
    this.validatedData[field] = dateValidation.dateFormatted;
    return true;
  }

  validateDateSchedule(field, fieldName) {
    const value = this.data[field];
    if (!value) {
      this.addError(field, `${fieldName} é obrigatório`);
      return false;
    }
    const dateValidation = validationUtils.validateDateSchedule(value);
    if (!dateValidation.isValid) {
      this.addError(field, dateValidation.error);
      return false;
    }
    this.validatedData[field] = dateValidation.dateFormatted;
    return true;
  }

  validateTime(field, fieldName) {
    const value = this.data[field];
    if (!value) {
      this.addError(field, `${fieldName} é obrigatório`);
      return false;
    }
    const timeValidation = validationUtils.validateTime(value);
    if (!timeValidation.isValid) {
      this.addError(field, timeValidation.error);
      return false;
    }
    this.validatedData[field] = value;
    return true;
  }

  addError(field, message) {
    this.errors.push({ field, message });
  }

  isValid() {
    return this.errors.length === 0;
  }

  getValidatedData() {
    return this.validatedData;
  }

  getErrors() {
    return this.errors;
  }

  clearValidatedData() {
    this.validatedData = {};
  }
}

export default BaseDTO;
