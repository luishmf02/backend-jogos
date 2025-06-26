
import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import { verificaToken } from "./verificaToken";

const router = Router();
const prisma = new PrismaClient();

// Listar todas as interações
router.get("/interacoes", verificaToken, async (req, res) => {
  try {
    const interacoes = await prisma.interacao.findMany({
      include: { jogo: true },
      orderBy: { criadoEm: "desc" },
    });
    res.json(interacoes);
  } catch (err) {
    res.status(500).json({ erro: "Erro ao buscar interações" });
  }
});

// Responder uma interação
router.patch("/interacoes/:id/responder", verificaToken, async (req, res) => {
  const { id } = req.params;
  const { resposta } = req.body;

  if (!resposta) {
    return res.status(400).json({ erro: "Resposta é obrigatória." });
  }

  try {
    const atualizada = await prisma.interacao.update({
      where: { id: Number(id) },
      data: { resposta },
    });
    res.json(atualizada);
  } catch (err) {
    res.status(500).json({ erro: "Erro ao responder interação." });
  }
});

// Excluir uma interação
router.delete("/interacoes/:id", verificaToken, async (req, res) => {
  const { id } = req.params;

  try {
    await prisma.interacao.delete({ where: { id: Number(id) } });
    res.json({ msg: "Interação excluída." });
  } catch (err) {
    res.status(500).json({ erro: "Erro ao excluir interação." });
  }
});

export default router;
