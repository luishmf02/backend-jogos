import { PrismaClient } from "@prisma/client"
import { Router } from "express"
import { z } from "zod"

const prisma = new PrismaClient()
const router = Router()

// Validação com Zod
const estudioSchema = z.object({
  nome: z.string().min(2, { message: "O nome do estúdio deve ter no mínimo 2 caracteres." })
})

// GET /estudios - lista todos os estúdios
router.get("/", async (_req, res) => {
  try {
    const estudios = await prisma.estudio.findMany()
    res.status(200).json(estudios)
  } catch (error) {
    res.status(500).json({ error })
  }
})

// POST /estudios - adiciona novo estúdio
router.post("/", async (req, res) => {
  const valida = estudioSchema.safeParse(req.body)

  if (!valida.success) {
    return res.status(400).json({ error: valida.error })
  }

  try {
    const estudio = await prisma.estudio.create({
      data: valida.data
    })
    res.status(201).json(estudio)
  } catch (error) {
    res.status(400).json({ error })
  }
})

export default router
