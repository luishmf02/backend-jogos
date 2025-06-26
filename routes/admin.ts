
import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const router = Router();
const prisma = new PrismaClient();

const JWT_SECRET = process.env.JWT_SECRET || "segredo_super_secreto";

// Rota para criar novo admin
router.post("/admin", async (req, res) => {
  const { nome, email, senha, nivelAcesso } = req.body;

  if (!nome || !email || !senha || !nivelAcesso) {
    return res.status(400).json({ erro: "Campos obrigatórios faltando." });
  }

  const senhaCriptografada = await bcrypt.hash(senha, 10);

  try {
    const novoAdmin = await prisma.admin.create({
      data: {
        nome,
        email,
        senha: senhaCriptografada,
        nivelAcesso
      }
    });
    res.status(201).json(novoAdmin);
  } catch (erro) {
    res.status(500).json({ erro: "Erro ao criar admin.", detalhes: erro });
  }
});

// Rota de login de admin
router.post("/admin/login", async (req, res) => {
  const { email, senha } = req.body;

  const admin = await prisma.admin.findUnique({ where: { email } });
  if (!admin) return res.status(401).json({ erro: "Credenciais inválidas." });

  const senhaCorreta = await bcrypt.compare(senha, admin.senha);
  if (!senhaCorreta) return res.status(401).json({ erro: "Credenciais inválidas." });

  const token = jwt.sign(
    { id: admin.id, nivelAcesso: admin.nivelAcesso },
    JWT_SECRET,
    { expiresIn: "4h" }
  );

  res.json({ token });
});

export default router;


import { verificaToken } from "./verificaToken";

// Rota protegida de teste
router.get("/admin/protegido", verificaToken, (req, res) => {
  res.json({
    mensagem: "Acesso permitido à rota protegida!",
    admin: req.admin
  });
});
