import { Router } from 'express'
import { PrismaClient } from '@prisma/client'
import { z } from 'zod'
import bcrypt from 'bcrypt'
import { randomUUID } from 'crypto'

const router = Router()
const prisma = new PrismaClient()

const clienteSchema = z.object({
  nome: z.string().min(2),
  email: z.string().email(),
  senha: z.string().min(4)
})

router.post('/', async (req, res) => {
  const valida = clienteSchema.safeParse(req.body)

  if (!valida.success) {
    return res.status(400).json({ error: valida.error })
  }

  const { nome, email, senha } = valida.data

  const clienteExistente = await prisma.cliente.findUnique({ where: { email } })
  if (clienteExistente) {
    return res.status(400).json({ error: 'E-mail já cadastrado.' })
  }

  const senhaCriptografada = await bcrypt.hash(senha, 10)

  try {
    const novoCliente = await prisma.cliente.create({
      data: { nome, email, senha: senhaCriptografada }
    })
    res.status(201).json(novoCliente)
  } catch (error) {
    res.status(500).json({ error })
  }
})

router.post('/login', async (req, res) => {
  const { email, senha } = req.body

  const cliente = await prisma.cliente.findUnique({ where: { email } })
  if (!cliente) return res.status(401).json({ error: 'Credenciais inválidas' })

  const senhaConfere = await bcrypt.compare(senha, cliente.senha)
  if (!senhaConfere) return res.status(401).json({ error: 'Credenciais inválidas' })

  res.status(200).json({ id: cliente.id, nome: cliente.nome, email: cliente.email })
})

router.post('/recuperar', async (req, res) => {
  const { email } = req.body

  const cliente = await prisma.cliente.findUnique({ where: { email } })
  if (!cliente) return res.status(404).json({ error: 'Cliente não encontrado' })

  const codigo = randomUUID().slice(0, 6).toUpperCase()

  await prisma.cliente.update({
    where: { email },
    data: { codigoRecuperacao: codigo }
  })

  console.log(`Código de recuperação enviado para ${email}: ${codigo}`) // em produção: enviar por e-mail
  res.status(200).json({ mensagem: 'Código enviado para o e-mail do cliente' })
})

router.post('/alterar-senha', async (req, res) => {
  const { email, codigo, novaSenha, repetirSenha } = req.body

  if (novaSenha !== repetirSenha) {
    return res.status(400).json({ error: 'As senhas não conferem' })
  }

  const cliente = await prisma.cliente.findUnique({ where: { email } })
  if (!cliente || cliente.codigoRecuperacao !== codigo) {
    return res.status(400).json({ error: 'Código inválido ou cliente não encontrado' })
  }

  const senhaCriptografada = await bcrypt.hash(novaSenha, 10)

  await prisma.cliente.update({
    where: { email },
    data: { senha: senhaCriptografada, codigoRecuperacao: null }
  })

  res.status(200).json({ mensagem: 'Senha alterada com sucesso' })
})

export default router
