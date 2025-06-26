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
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const router = (0, express_1.Router)();
const prisma = new client_1.PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || "segredo_super_secreto";
// Rota para criar novo admin
router.post("/admin", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { nome, email, senha, nivelAcesso } = req.body;
    if (!nome || !email || !senha || !nivelAcesso) {
        return res.status(400).json({ erro: "Campos obrigatórios faltando." });
    }
    const senhaCriptografada = yield bcrypt_1.default.hash(senha, 10);
    try {
        const novoAdmin = yield prisma.admin.create({
            data: {
                nome,
                email,
                senha: senhaCriptografada,
                nivelAcesso
            }
        });
        res.status(201).json(novoAdmin);
    }
    catch (erro) {
        res.status(500).json({ erro: "Erro ao criar admin.", detalhes: erro });
    }
}));
// Rota de login de admin
router.post("/admin/login", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, senha } = req.body;
    const admin = yield prisma.admin.findUnique({ where: { email } });
    if (!admin)
        return res.status(401).json({ erro: "Credenciais inválidas." });
    const senhaCorreta = yield bcrypt_1.default.compare(senha, admin.senha);
    if (!senhaCorreta)
        return res.status(401).json({ erro: "Credenciais inválidas." });
    const token = jsonwebtoken_1.default.sign({ id: admin.id, nivelAcesso: admin.nivelAcesso }, JWT_SECRET, { expiresIn: "4h" });
    res.json({ token });
}));
exports.default = router;
const verificaToken_1 = require("./verificaToken");
// Rota protegida de teste
router.get("/admin/protegido", verificaToken_1.verificaToken, (req, res) => {
    res.json({
        mensagem: "Acesso permitido à rota protegida!",
        admin: req.admin
    });
});
