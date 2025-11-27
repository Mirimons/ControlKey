import express from "express";
import jwt from "jsonwebtoken";
import {
  generateToken,
  generateRefreshToken,
  verifyToken,
} from "../utils/index.js";
import { AppDataSource } from "../database/data-source.js";
import UsuarioCad from "../entities/usuario_cad.js";
import dotenv from "dotenv";

dotenv.config();
const route = express.Router();

const usuarioCadRepository = AppDataSource.getRepository(UsuarioCad);

export const refreshToken = async (request, response) => {
  try {
    const { refreshToken } = request.body;

    if (!refreshToken) {
      return response
        .status(401)
        .json({ success: false, message: "Refresh token não fornecido" });
    }

    // Verifica o refresh token
    const decoded = await verifyToken(refreshToken, true);

    // Busca o usuário no banco
    const usuario = await usuarioCadRepository.findOne({
      where: {
        id_usuario: decoded.id,
        deletedAt: null,
      },
      relations: ["usuario", "usuario.tipo"],
    });

    if (!usuario) {
      return response
        .status(403)
        .json({ success: false, message: "Usuário não encontrado" });
    }

    // Gera novos tokens
    const newTokenPayload = {
      id: usuario.id_usuario,
      email: usuario.email,
      tipo: usuario.usuario.tipo.desc_tipo,
      id_tipo: usuario.usuario.tipo.id,
    };

    const newAccessToken = generateToken(newTokenPayload);
    // const newRefreshToken = generateRefreshToken(newTokenPayload);

    response.json({
      success: true,
      token: newAccessToken,
      // refreshToken: newRefreshToken,
      usuario: {
        id: usuario.id_usuario,
        email: usuario.email,
        tipo: usuario.usuario.tipo.desc_tipo,
        id_tipo: usuario.usuario.tipo.id,
      },
    });
  } catch (error) {
    console.error("Erro no refresh token:", error);

    if (error.name === "TokenExpiredError") {
      return response
        .status(403)
        .json({ success: false, message: "Refresh token expirado" });
    }

    if (error.name === "JsonWebTokenError") {
      return response
        .status(403)
        .json({ success: false, message: "Refresh token inválido" });
    }

    response
      .status(500)
      .json({ success: false, message: "Erro interno no servidor" });
  }
};

export default route;
