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
const express_1 = require("express");
const client_1 = require("@prisma/client");
const zod_1 = require("zod");
const bcrypt_1 = __importDefault(require("bcrypt"));
const crypto_1 = require("crypto");
const router = (0, express_1.Router)();
const prisma = new client_1.PrismaClient();
const clienteSchema = zod_1.z.object({
    nome: zod_1.z.string().min(2),
    email: zod_1.z.string().email(),
    senha: zod_1.z.string().min(4)
});
router.post('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const valida = clienteSchema.safeParse(req.body);
    if (!valida.success) {
        return res.status(400).json({ error: valida.error });
    }
    const { nome, email, senha } = valida.data;
    const clienteExistente = yield prisma.cliente.findUnique({ where: { email } });
    if (clienteExistente) {
        return res.status(400).json({ error: 'E-mail já cadastrado.' });
    }
    const senhaCriptografada = yield bcrypt_1.default.hash(senha, 10);
    try {
        const novoCliente = yield prisma.cliente.create({
            data: { nome, email, senha: senhaCriptografada }
        });
        res.status(201).json(novoCliente);
    }
    catch (error) {
        res.status(500).json({ error });
    }
}));
router.post('/login', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, senha } = req.body;
    const cliente = yield prisma.cliente.findUnique({ where: { email } });
    if (!cliente)
        return res.status(401).json({ error: 'Credenciais inválidas' });
    const senhaConfere = yield bcrypt_1.default.compare(senha, cliente.senha);
    if (!senhaConfere)
        return res.status(401).json({ error: 'Credenciais inválidas' });
    res.status(200).json({ id: cliente.id, nome: cliente.nome, email: cliente.email });
}));
router.post('/recuperar', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email } = req.body;
    const cliente = yield prisma.cliente.findUnique({ where: { email } });
    if (!cliente)
        return res.status(404).json({ error: 'Cliente não encontrado' });
    const codigo = (0, crypto_1.randomUUID)().slice(0, 6).toUpperCase();
    yield prisma.cliente.update({
        where: { email },
        data: { codigoRecuperacao: codigo }
    });
    console.log(`Código de recuperação enviado para ${email}: ${codigo}`); // em produção: enviar por e-mail
    res.status(200).json({ mensagem: 'Código enviado para o e-mail do cliente' });
}));
router.post('/alterar-senha', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, codigo, novaSenha, repetirSenha } = req.body;
    if (novaSenha !== repetirSenha) {
        return res.status(400).json({ error: 'As senhas não conferem' });
    }
    const cliente = yield prisma.cliente.findUnique({ where: { email } });
    if (!cliente || cliente.codigoRecuperacao !== codigo) {
        return res.status(400).json({ error: 'Código inválido ou cliente não encontrado' });
    }
    const senhaCriptografada = yield bcrypt_1.default.hash(novaSenha, 10);
    yield prisma.cliente.update({
        where: { email },
        data: { senha: senhaCriptografada, codigoRecuperacao: null }
    });
    res.status(200).json({ mensagem: 'Senha alterada com sucesso' });
}));
exports.default = router;
