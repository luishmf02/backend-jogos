import jwt, { JwtPayload } from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";

export const verificaToken = (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ mensagem: "Token não fornecido." });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;

    // ✅ Garante que decoded é um objeto (JwtPayload)
    if (typeof decoded === "object" && decoded !== null) {
      req.admin = decoded as any; // se quiser, pode criar um tipo AdminTokenPayload mais tarde
      return next();
    }

    return res.status(401).json({ mensagem: "Token inválido." });
  } catch (err) {
    return res.status(401).json({ mensagem: "Token inválido." });
  }
};
