function generateNewPassword() {
    const newPassword = (Math.random() + 1)  //Math.random gera um número aleatório entre 0 e 1. Ex: 0,738695
        .toString(36) //.toString(36) faz com que gere numeros de 0-9 e letras de a-z aleatóriamente
        .substring(2) //substring(2) diz que nossa senha vai ser enviada a partir do segundo caractere, tirando o "1."
        .replace("j", "@") //replace - substitui o primerio que aparecer, os demais continuam como o "j"
        .replace("r", "$")
        .replace("5", "#")
        .replace("y", "*");
    return newPassword;
}

export { generateNewPassword };