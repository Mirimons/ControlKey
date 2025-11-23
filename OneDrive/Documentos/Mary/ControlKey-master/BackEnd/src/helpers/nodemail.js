import nodemailer from "nodemailer";
import fs from "fs"; //File System: fazer manipulação dos arquivos dentro do sistema
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function sendEmail(newPassword, userEmail) {
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: userEmail,
    subject: "Recuperação de senha - ControlKey",
    html: getEmailTemplate(newPassword),
  };

  return new Promise((resolve, reject) => {
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log("Erro ao enviar e-mail: ", error);
        reject(new Error("Falha ao enviar e-mail."));
      } else {
        console.log("E-mail enviado: " + info.response);
        resolve(info);
      }
    });
  });
}

const getEmailTemplate = (newPassword) => {
  const templatePath = path.join(__dirname, "../templates/changePassword.html");
  const htmlTemplate = fs.readFileSync(templatePath, "utf-8");
  return htmlTemplate.replace("{{newPassword}}", newPassword);
};

export { sendEmail };
