import jwt from "jsonwebtoken";

export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader?.split(" ")[1];

  if (!token) {
    return res
      .status(401)
      .json({ success: false, response: "Token não fornecido" });
  }

  try {
    const secret = process.env.JWT_SECRET;
    const decoded = jwt.verify(token, secret);

    req.user = decoded;
    next();
  } catch (error) {
    return res
      .status(403)
      .json({ success: false, response: "Token inválido ou expirado" });
  }
};

export const isAdmin = (req, res, next) => {
  const user = req.user;
  if (user && user.tipo === "Administrador") {
    next();
  } else {
    return res.status(403).json({
      success: false,
      response: "Acesso permitido apenas para administradores",
    });
  }
};
