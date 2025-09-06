import express from "express";
import jwt from "jsonwebtoken";
import { generateToken, generateRefreshToken } from "../utils/index.js";
import { AppDataSource } from "../database/data-source.js";
import UsuarioCad from "../entities/usuario_cad.js";
import dotenv from "dotenv";

dotenv.config();
const route = express.Router();

const route = express.Router();

const usuarioCadRepository = AppDataSource.getRepository(UsuarioCad);

export const refreshToken = async (request, response) => {
  try {
    const { refreshToken } = request.body;

    if (!refreshToken) {
      return response.status(401).json({ message: "Refresh token não fornecido" });
    }

    // Verifica o refresh token
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

    // Busca o usuário no banco
    const usuario = await usuarioCadRepository.findOne({
      where: {
        id_usuario: decoded.userId,
        deletedAt: null,
      },
    });

    if (!usuario) {
      return response.status(403).json({ message: "Usuário não encontrado" });
    }

    // Gera novos tokens
    const newAccessToken = generateToken({
      userId: usuario.id_usuario,
      email: usuario.email,
      tipo_id: usuario.tipo_id,
    });

    const newRefreshToken = generateRefreshToken({
      userId: usuario.id_usuario,
    });

    response.json({
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
      usuario: {
        id: usuario.id,
        usuarioId: usuario.id_usuario,
        email: usuario.email,
        tipo_id: usuario.tipo_id,
      },
    });
  } catch (error) {
    console.error("Erro no refresh token:", error);

    if (error.name === "TokenExpiredError") {
      return response.status(403).json({ message: "Refresh token expirado" });
    }

    if (error.name === "JsonWebTokenError") {
      return response.status(403).json({ message: "Refresh token inválido" });
    }

    response.status(500).json({ message: "Erro interno no servidor" });
  }
};

export default route;