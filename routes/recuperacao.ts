// src/routes/recuperacao.ts
import { Router } from 'express'
import { PrismaClient } from '@prisma/client'
import { z } from 'zod'
import nodemailer from 'nodemailer'
import crypto from 'crypto'
import bcrypt from 'bcrypt'

const prisma = new PrismaClient()
const router = Router()

// Configurando o transporte do e-mail
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
})

// Solicitar código de recuperação
router.post('/solicitar', async (req, res) => {
  const { email } = req.body

  try {
    const cliente = await prisma.cliente.findUnique({ where: { email } })
    if (!cliente) return res.status(404).json({ error: 'Cliente não encontrado.' })

    const codigo = crypto.randomBytes(4).toString('hex').toUpperCase()

    await prisma.cliente.update({
      where: { email },
      data: { codigoRecuperacao: codigo }
    })

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Código de Recuperação - Loja Gamer XP',
      text: `Seu código de recuperação é: ${codigo}`
    })

    res.status(200).json({ message: 'Código enviado para o e-mail.' })
  } catch (error) {
    res.status(500).json({ error })
  }
})

// Alterar a senha usando o código
const alterarSchema = z.object({
  email: z.string().email(),
  codigo: z.string().length(8),
  novaSenha: z.string().min(4)
})

router.post('/alterar', async (req, res) => {
  const valida = alterarSchema.safeParse(req.body)
  if (!valida.success) return res.status(400).json({ error: valida.error })

  const { email, codigo, novaSenha } = valida.data

  try {
    const cliente = await prisma.cliente.findUnique({ where: { email } })
    if (!cliente || cliente.codigoRecuperacao !== codigo) {
      return res.status(400).json({ error: 'Código de recuperação inválido.' })
    }

    const senhaCriptografada = await bcrypt.hash(novaSenha, 10)

    await prisma.cliente.update({
      where: { email },
      data: {
        senha: senhaCriptografada,
        codigoRecuperacao: null
      }
    })

    res.status(200).json({ message: 'Senha alterada com sucesso.' })
  } catch (error) {
    res.status(500).json({ error })
  }
})

export default router
