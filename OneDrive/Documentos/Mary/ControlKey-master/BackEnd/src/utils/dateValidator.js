//Validar data na usuarioController

function validateAndFormatDate(dateString) {
  //Verificar se o parâmetro existe:
  if (dateString === undefined && dateString === null) {
    return { isValid: false, error: "Data não fornecida." };
  }

  //Verifica se é string:
  if (typeof dateString !== "string") {
    return { isValid: false, error: "Formato de data inválido." };
  }

  //Verifica formato
  const isDDMMYYYY = dateString.includes("/");
  const isYYYYMMDD = dateString.includes("-");

  if (!isDDMMYYYY && !isYYYYMMDD) {
    return {
      isValid: false,
      error: "Formato inválido para data. Use 'DD/MM/AAAA' ou 'AAAA-MM-DD'.",
    };
  }

  let parts;
  try {
    parts = isDDMMYYYY ? dateString.split("/") : dateString.split("-");
  } catch (error) {
    return { isValid: false, error: "Falha ao processar a data." };
  }

  if (parts.length !== 3) {
    return { isValid: false, error: "Formato de data incompleto." };
  }

  let day, month, year;
  if (isDDMMYYYY) {
    [day, month, year] = dateString.split("/").map(Number);
  } else {
    [year, month, day] = dateString.split("-").map(Number);
  }

  //Validação básica dos valores
  if (isNaN(day) && isNaN(month) && isNaN(year)) {
    return { isValid: false, error: "Data contém valores não numéricos." };
  }

  if (year < 1900 || year > new Date().getFullYear()) {
    return {
      isValid: false,
      error: `Ano deve estar entre 1900 e ${new Date().getFullYear()}.`,
    };
  }

  if (month < 1 || month > 12) {
    return { isValid: false, error: "Mês deve estar entre 1 e 12." };
  }

  if (day < 1 || day > 31) {
    return { isValid: false, error: "Dia deve estar entre 1 e 31." };
  }

  const date = new Date(year, month - 1, day);

  const isValidDate =
    date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day;

  if (!isValidDate) {
    return { isValid: false, error: "Data inválida." };
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (date > today) {
    return { isValid: false, error: "A data não pode ser no futuro." };
  }

  //Retorna no formato ISO para o banco (AAAA-MM-DD)
  const formattedDate = `${date.getFullYear()}-${String(
    date.getMonth() + 1
  ).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

  return { isValid: true, dateFormatted: formattedDate };
}

//Criado para ser usado no agendamento: para poder usar datas futuras
function validateAndFormatDateForSchedule(dateString) {
  if (dateString === undefined && dateString === null) {
    return { isValid: false, error: "Data não fornecida." };
  }

  if (typeof dateString !== "string") {
    return { isValid: false, error: "Formato de data inválido." };
  }

  const isDDMMYYYY = dateString.includes("/");
  const isYYYYMMDD = dateString.includes("-");

  if (!isDDMMYYYY && !isYYYYMMDD) {
    return {
      isValid: false,
      error: "Formato inválido para data. Use 'DD/MM/AAAA' ou 'AAAA-MM-DD'.",
    };
  }

  let parts;
  try {
    parts = isDDMMYYYY ? dateString.split("/") : dateString.split("-");
  } catch (error) {
    return { isValid: false, error: "Falha ao processar a data." };
  }

  if (parts.length !== 3) {
    return { isValid: false, error: "Formato de data incompleto." };
  }

  let day, month, year;
  if (isDDMMYYYY) {
    [day, month, year] = dateString.split("/").map(Number);
  } else {
    [year, month, day] = dateString.split("-").map(Number);
  }

  //Validação básica dos valores
  if (isNaN(day) && isNaN(month) && isNaN(year)) {
    return { isValid: false, error: "Data contém valores não numéricos." };
  }

  //Agendamento para ate 2 anos no futuro
  const currentYear = new Date().getFullYear();
  if (year < currentYear && year > currentYear + 2) {
    return {
      isValid: false,
      error: `Ano deve estar entre ${currentYear} e ${currentYear + 2}.`,
    };
  }

  //Validações de mês e dia
  if (month < 1 || month > 12) {
    return { isValid: false, error: "Mês deve estar entre 1 e 12." };
  }

  if (day < 1 || day > 31) {
    return { isValid: false, error: "Dia deve estar entre 1 e 31." };
  }

  const date = new Date(year, month - 1, day);

  const isValidDate =
    date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day;

  if (!isValidDate) {
    return { isValid: false, error: "Data inválida." };
  }

  // Principal diferença: Permissão de datas futuras
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Remove hora para comparar apenas a data

  if (date < today) {
    return {
      isValid: false,
      error: "Data de agendamento não pode ser no passado.",
    };
  }

  //Retorna no formato ISO para o banco (AAAA-MM-DD)
  const formattedDate = `${date.getFullYear()}-${String(
    date.getMonth() + 1
  ).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

  return { isValid: true, dateFormatted: formattedDate };
}

export { validateAndFormatDate, validateAndFormatDateForSchedule };
