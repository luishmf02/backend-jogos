import { PrismaClient, Genero } from '@prisma/client'
import { Router } from 'express'
import { z } from 'zod'

const prisma = new PrismaClient()
const router = Router()

const jogoSchema = z.object({
  titulo: z.string().min(2),
  preco: z.number(),
  anoLancamento: z.number(),
  descricao: z.string().optional(),
  genero: z.nativeEnum(Genero),
  destaque: z.boolean().optional(),
  capa: z.string(),
  estudioId: z.number()
})

router.get('/', async (_req, res) => {
  try {
    const jogos = await prisma.jogo.findMany({
      include: { estudio: true }
    })
    res.status(200).json(jogos)
  } catch (error) {
    res.status(500).json({ error })
  }
})

router.post('/', async (req, res) => {
  const valida = jogoSchema.safeParse(req.body)

  if (!valida.success) {
    return res.status(400).json({ error: valida.error })
  }

  const { titulo, preco, anoLancamento, descricao, genero, destaque = true, capa, estudioId } = valida.data

  try {
    const jogo = await prisma.jogo.create({
      data: { titulo, preco, anoLancamento, descricao, genero, destaque, capa, estudioId }
    })
    res.status(201).json(jogo)
  } catch (error) {
    res.status(400).json({ error })
  }
})

router.post('/filtro', async (req, res) => {
  const { generos, precoMax, estudioId } = req.body

  try {
    const jogos = await prisma.jogo.findMany({
      include: { estudio: true },
      where: {
        AND: [
          generos && generos.length > 0 ? { genero: { in: generos } } : {},
          precoMax ? { preco: { lte: precoMax } } : {},
          estudioId ? { estudioId: estudioId } : {}
        ]
      }
    })
    res.status(200).json(jogos)
  } catch (error) {
    res.status(400).json({ error })
  }
})

router.put('/:id', async (req, res) => {
  const { id } = req.params
  const valida = jogoSchema.safeParse(req.body)

  if (!valida.success) {
    return res.status(400).json({ error: valida.error })
  }

  const { titulo, preco, anoLancamento, descricao, genero, destaque = true, capa, estudioId } = valida.data

  try {
    const jogo = await prisma.jogo.update({
      where: { id: Number(id) },
      data: { titulo, preco, anoLancamento, descricao, genero, destaque, capa, estudioId }
    })
    res.status(200).json(jogo)
  } catch (error) {
    res.status(400).json({ error })
  }
})

router.delete('/:id', async (req, res) => {
  const { id } = req.params

  try {
    const jogo = await prisma.jogo.delete({
      where: { id: Number(id) }
    })
    res.status(200).json(jogo)
  } catch (error) {
    res.status(400).json({ error })
  }
})

router.get('/pesquisa/:termo', async (req, res) => {
  const { termo } = req.params
  const termoNumero = Number(termo)
  const termoUpper = termo.toUpperCase()

  if (isNaN(termoNumero)) {
    try {
      const jogos = await prisma.jogo.findMany({
        include: { estudio: true },
        where: {
          OR: [
            { titulo: { contains: termo, mode: 'insensitive' } },
            Object.values(Genero).includes(termoUpper as Genero)
              ? { genero: { equals: termoUpper as Genero } }
              : undefined,
            { estudio: { nome: { contains: termo, mode: 'insensitive' } } }
          ].filter(Boolean) as any
        }
      })
      return res.status(200).json(jogos)
    } catch (error) {
      console.error(error)
      return res.status(200).json([])
    }
  } else {
    try {
      const jogos = await prisma.jogo.findMany({
        include: { estudio: true },
        where: termoNumero <= 3000
          ? { anoLancamento: termoNumero }
          : { preco: { lte: termoNumero } }
      })
      return res.status(200).json(jogos)
    } catch (error) {
      console.error(error)
      return res.status(200).json([])
    }
  }
})

router.get('/:id', async (req, res) => {
  const { id } = req.params

  try {
    const jogo = await prisma.jogo.findUnique({
      where: { id: Number(id) },
      include: { estudio: true, imagens: true }
    })

    if (!jogo) {
      return res.status(404).json({ error: "Jogo não encontrado" })
    }

    res.status(200).json(jogo)
  } catch (error) {
    res.status(500).json({ error: "Erro ao buscar jogo" })
  }
})


export default router
