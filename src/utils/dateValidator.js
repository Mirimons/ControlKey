//Validar data na usuarioController

function validateAndFormatDate(dateString) {
    //Verificar se o parâmetro existe:
    if(dateString === undefined && dateString === null){
        return {isValid: false, error: "Data não fornecida."};
    }

    //Verifica se é string:
    if(typeof dateString !== 'string') {
        return {isValid: false, error: "Formato de data inválido."}
    }

    //Verifica formato
    const isDDMMYYYY = dateString.includes("/");
    const isYYYYMMDD = dateString.includes("-");

    if (!isDDMMYYYY && !isYYYYMMDD) {
        return { isValid: false, error: "Formato inválido para data. Use 'DD/MM/AAAA' ou 'AAAA/MM/DD'." };
    }

    let parts;
    try{
        parts = isDDMMYYYY
        ? dateString.split("/")
        : dateString.split("-");
    } catch (error) {
        return {isValid: false, error: "Falha ao processar a data."};
    }

    if(parts.length !== 3) {
        return {isValid: false, error: "Formato de data incompleto."};
    }


    let day, month, year;
    if (isDDMMYYYY) {
        [day, month, year] = dateString.split("/").map(Number);
    } else {
        [year, month, day] = dateString.split("-").map(Number);
    }

    const date = new Date(year, month - 1, day);

    const isValidDate = (
        date.getFullYear() === year &&
        date.getMonth() === month - 1 &&
        date.getDate() === day
    );

    if (!isValidDate) {
        return { isValid: false, error: "Data inválida." };
    }

    const today = new Date();
    if (date > today) {
        return { isValid: false, error: "A data de nascimento não pode ser no futuro." };
    }

    const formattedDate = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

    return { isValid: true, dateFormatted: formattedDate };
}

export { validateAndFormatDate };