export function validateAndFormatTime(horaString) {
  if (!horaString) {
    return {
      isValid: false,
      horaFormatada: null,
      error: "A hora é obrigatória",
    };
  }

  const hora = horaString.toString().trim();

  //Regex para validar formatos: HH:MM ou HH:MM:SS
  const horaRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/;

  if (!horaRegex.test(hora)) {
    return {
      isValid: false,
      horaFormatada: null,
      error: "Formato de hora inválido. use HH:MM ou HH:MM:SS",
    };
  }

  const parts = hora.split(":");
  let horas = parseInt(parts[0], 10);
  let minutos = parseInt(parts[1], 10);
  let segundos = parts[2] ? parseInt(parts[2], 10) : 0;

  if (horas < 0 || horas > 23) {
    return {
      isValid: false,
      horaFormatada: null,
      error: "A hora deve estar entre 00 e 23",
    };
  }

  if (minutos < 0 || minutos > 59) {
    return {
      isValid: false,
      horaFormatada: null,
      error: "Os minutos devem estar entre 00 e 59",
    };
  }

  if (segundos < 0 || segundos > 59) {
    return {
      isValid: false,
      horaFormatada: null,
      error: "Os segundos devem estar entre 00 e 59",
    };
  }

  const horaFormatada = `${horas.toString().padStart(2, "0")}:${minutos
    .toString()
    .padStart(2, "0")}:${segundos.toString().padStart(2, "0")}`;

  return {
    isValid: true,
    horaFormatada: horaFormatada,
    error: null,
  };
}

//Verifica se o formato de hora é valido
export function isTime(hora) {
  if (!hora) return false;
  const validation = validateAndFormatTime(hora);
  return validation.isValid;
}

//Comparação entre duas horas
export function compareTimes(hora1, hora2) {
  const [h1, m1, s1] = hora1.split(":").map(Number);
  const [h2, m2, s2] = hora2.split(":").map(Number);

  const totalSegundos1 = h1 * 3600 + m1 * 60 + s1;
  const totalSegundos2 = h2 * 3600 + m2 * 60 + s2;

  if (totalSegundos1 < totalSegundos2) return -1;
  if (totalSegundos1 > totalSegundos2) return 1;
  return 0;
}

//Calcula a diferença entre duas horas em minutos
export function getTimeDifferenceInMinutes(horaInicio, horaFim) {
  const [h1, m1, s1] = horaInicio.split(":").map(Number);
  const [h2, m2, s2] = horaFim.split(":").map(Number);

  const totalMinutos1 = h1 * 60 + m1 + s1 / 60;
  const totalMinutos2 = h2 * 60 + m2 + s2 / 60;

  return Math.abs(totalMinutos2 - totalMinutos1);
}
