import { PrismaClient } from '@prisma/client'
import { Router, Request, Response } from 'express'
import { z } from 'zod'
import multer from 'multer'
import { CloudinaryStorage } from 'multer-storage-cloudinary'
import { v2 as cloudinary } from 'cloudinary'

const prisma = new PrismaClient()
const router = Router()

const imagemSchema = z.object({
  legenda: z.string().min(3, { message: "Legenda deve ter no mínimo 3 caracteres" }),
  jogoId: z.coerce.number(),
})

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'dvfcxadyh',
  api_key: process.env.CLOUDINARY_API_KEY || '626956919255949',
  api_secret: process.env.CLOUDINARY_API_SECRET || '_7K5oKKtDfTGhTixH8IMVB1LPoI',
})

const storage = new CloudinaryStorage({
  cloudinary,
  params: (req, file) => {
    return {
      public_id: `${Date.now()}-${file.originalname.split('.')[0]}`,
      folder: 'loja_jogos',
      allowed_formats: ['jpg', 'png', 'jpeg'],
      transformation: [{ width: 800, height: 800, crop: 'limit' }],
    }
  },
})

const upload = multer({ storage: storage as any })

router.get('/', async (_req: Request, res: Response) => {
  try {
    const imagens = await prisma.imagem.findMany({ include: { jogo: true } })
    return res.status(200).json(imagens)
  } catch (error) {
    return res.status(500).json({ error })
  }
})

router.post('/', upload.single('image') as any, async (req: Request, res: Response) => {
  const valida = imagemSchema.safeParse(req.body)
  if (!valida.success) {
    return res.status(400).json({ error: valida.error })
  }
  if (!req.file || !req.file.path) {
    return res.status(400).json({ error: 'Imagem não enviada' })
  }
  const { legenda, jogoId } = valida.data
  const url = req.file.path
  try {
    const imagem = await prisma.imagem.create({ data: { legenda, jogoId, url } })
    return res.status(201).json(imagem)
  } catch (error) {
    return res.status(400).json({ error })
  }
})

export default router