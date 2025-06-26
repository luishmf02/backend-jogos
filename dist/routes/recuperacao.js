"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/routes/recuperacao.ts
const express_1 = require("express");
const client_1 = require("@prisma/client");
const zod_1 = require("zod");
const nodemailer_1 = __importDefault(require("nodemailer"));
const crypto_1 = __importDefault(require("crypto"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const prisma = new client_1.PrismaClient();
const router = (0, express_1.Router)();
// Configurando o transporte do e-mail
const transporter = nodemailer_1.default.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});
// Solicitar código de recuperação
router.post('/solicitar', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email } = req.body;
    try {
        const cliente = yield prisma.cliente.findUnique({ where: { email } });
        if (!cliente)
            return res.status(404).json({ error: 'Cliente não encontrado.' });
        const codigo = crypto_1.default.randomBytes(4).toString('hex').toUpperCase();
        yield prisma.cliente.update({
            where: { email },
            data: { codigoRecuperacao: codigo }
        });
        yield transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Código de Recuperação - Loja Gamer XP',
            text: `Seu código de recuperação é: ${codigo}`
        });
        res.status(200).json({ message: 'Código enviado para o e-mail.' });
    }
    catch (error) {
        res.status(500).json({ error });
    }
}));
// Alterar a senha usando o código
const alterarSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    codigo: zod_1.z.string().length(8),
    novaSenha: zod_1.z.string().min(4)
});
router.post('/alterar', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const valida = alterarSchema.safeParse(req.body);
    if (!valida.success)
        return res.status(400).json({ error: valida.error });
    const { email, codigo, novaSenha } = valida.data;
    try {
        const cliente = yield prisma.cliente.findUnique({ where: { email } });
        if (!cliente || cliente.codigoRecuperacao !== codigo) {
            return res.status(400).json({ error: 'Código de recuperação inválido.' });
        }
        const senhaCriptografada = yield bcrypt_1.default.hash(novaSenha, 10);
        yield prisma.cliente.update({
            where: { email },
            data: {
                senha: senhaCriptografada,
                codigoRecuperacao: null
            }
        });
        res.status(200).json({ message: 'Senha alterada com sucesso.' });
    }
    catch (error) {
        res.status(500).json({ error });
    }
}));
exports.default = router;
