import nodemailer from "nodemailer";
import fs from "fs"; //File System: fazer manipulação dos arquivos dentro do sistema
import { generateNewPassword } from "../utils/login.js";

function sendEmail(newPassword, userEmail) {
    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: "controlkeyltda@gmail.com",
            pass: "nfro eomv yzzu bfba"
        } 
    });

    let mailOptions = {
        from: 'controlkeyltda@gmail.com',
        to: userEmail,
        subject: 'Recuperação de senha',
        html: getEmailTemplate(generateNewPassword)
    };

    transporter.sendEmail(mailOptions, (error, info) => {
        if(error) {
            console.log('Erro ao enviar e-mail: ', error);
        } else {
            console.log('E-mail enviado: ' + info.response);
        }
    });
}

const getEmailTemplate = (newPassword) => {
    const htmlTemplate = fs.readFileSync("./src/templates/changePassword.html", 'utf-8');
    return htmlTemplate.replace('{{newPassword}}', newPassword);
};

export {sendEmail};