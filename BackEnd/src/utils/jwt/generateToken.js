import dotenv from "dotenv";
import jwt from "jsonwebtoken";

dotenv.config();

const secret = process.env.JWT_SECRET;
const refresh = process.env.JWT_REFRESH;
const expiresSecret = process.env.JWT_SECRET_EXPIRES_IN;
const expiresRefresh = process.env.JWT_REFRESH_EXPIRES_IN;

if (!secret) {
  throw new Error("JWT_SECRET não configurado no arquivo .env");
}

if (!refresh) {
  throw new Error("JWT_REFRESH_SECRET não configurado no arquivo .env");
}

function generateToken(payload) {
  return jwt.sign(payload, secret, { expiresIn: expiresSecret || 60 * 15 });
}

function generateRefreshToken(payload) {
  return jwt.sign(payload, refresh, {
    expiresIn: expiresRefresh || 60 * 60 * 168,
  });
}

function verifyToken(token, isRefresh = false) {
  const isSecret = isRefresh ? refresh : secret;
  return new Promise((resolve, reject) => {
    jwt.verify(token, isSecret, (error, decoded) => {
      if(error) {
        reject(error);
      } else{
        resolve(decoded);
      }
    });
  });
}

export { generateToken, generateRefreshToken, verifyToken };