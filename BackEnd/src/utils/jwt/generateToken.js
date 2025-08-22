import dotenv from "dotenv";
import jwt from "jsonwebtoken";

dotenv.config();

const secret = process.env.JWT_SECRET;

if (!secret) {
  throw new Error("JWT_SECRET não configurado no arquivo .env");
}

function generateToken(payload) {
  return jwt.sign(payload, secret, { expiresIn: 60 * 60 * 10});
}


export {generateToken};