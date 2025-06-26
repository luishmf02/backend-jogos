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
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const express_1 = require("express");
const zod_1 = require("zod");
const prisma = new client_1.PrismaClient();
const router = (0, express_1.Router)();
const jogoSchema = zod_1.z.object({
    titulo: zod_1.z.string().min(2),
    preco: zod_1.z.number(),
    anoLancamento: zod_1.z.number(),
    descricao: zod_1.z.string().optional(),
    genero: zod_1.z.nativeEnum(client_1.Genero),
    destaque: zod_1.z.boolean().optional(),
    capa: zod_1.z.string(),
    estudioId: zod_1.z.number()
});
router.get('/', (_req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const jogos = yield prisma.jogo.findMany({
            include: { estudio: true }
        });
        res.status(200).json(jogos);
    }
    catch (error) {
        res.status(500).json({ error });
    }
}));
router.post('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const valida = jogoSchema.safeParse(req.body);
    if (!valida.success) {
        return res.status(400).json({ error: valida.error });
    }
    const { titulo, preco, anoLancamento, descricao, genero, destaque = true, capa, estudioId } = valida.data;
    try {
        const jogo = yield prisma.jogo.create({
            data: { titulo, preco, anoLancamento, descricao, genero, destaque, capa, estudioId }
        });
        res.status(201).json(jogo);
    }
    catch (error) {
        res.status(400).json({ error });
    }
}));
router.post('/filtro', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { generos, precoMax, estudioId } = req.body;
    try {
        const jogos = yield prisma.jogo.findMany({
            include: { estudio: true },
            where: {
                AND: [
                    generos && generos.length > 0 ? { genero: { in: generos } } : {},
                    precoMax ? { preco: { lte: precoMax } } : {},
                    estudioId ? { estudioId: estudioId } : {}
                ]
            }
        });
        res.status(200).json(jogos);
    }
    catch (error) {
        res.status(400).json({ error });
    }
}));
router.put('/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const valida = jogoSchema.safeParse(req.body);
    if (!valida.success) {
        return res.status(400).json({ error: valida.error });
    }
    const { titulo, preco, anoLancamento, descricao, genero, destaque = true, capa, estudioId } = valida.data;
    try {
        const jogo = yield prisma.jogo.update({
            where: { id: Number(id) },
            data: { titulo, preco, anoLancamento, descricao, genero, destaque, capa, estudioId }
        });
        res.status(200).json(jogo);
    }
    catch (error) {
        res.status(400).json({ error });
    }
}));
router.delete('/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    try {
        const jogo = yield prisma.jogo.delete({
            where: { id: Number(id) }
        });
        res.status(200).json(jogo);
    }
    catch (error) {
        res.status(400).json({ error });
    }
}));
router.get('/pesquisa/:termo', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { termo } = req.params;
    const termoNumero = Number(termo);
    const termoUpper = termo.toUpperCase();
    if (isNaN(termoNumero)) {
        try {
            const jogos = yield prisma.jogo.findMany({
                include: { estudio: true },
                where: {
                    OR: [
                        { titulo: { contains: termo, mode: 'insensitive' } },
                        Object.values(client_1.Genero).includes(termoUpper)
                            ? { genero: { equals: termoUpper } }
                            : undefined,
                        { estudio: { nome: { contains: termo, mode: 'insensitive' } } }
                    ].filter(Boolean)
                }
            });
            return res.status(200).json(jogos);
        }
        catch (error) {
            console.error(error);
            return res.status(200).json([]);
        }
    }
    else {
        try {
            const jogos = yield prisma.jogo.findMany({
                include: { estudio: true },
                where: termoNumero <= 3000
                    ? { anoLancamento: termoNumero }
                    : { preco: { lte: termoNumero } }
            });
            return res.status(200).json(jogos);
        }
        catch (error) {
            console.error(error);
            return res.status(200).json([]);
        }
    }
}));
router.get('/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    try {
        const jogo = yield prisma.jogo.findUnique({
            where: { id: Number(id) },
            include: { estudio: true, imagens: true }
        });
        if (!jogo) {
            return res.status(404).json({ error: "Jogo não encontrado" });
        }
        res.status(200).json(jogo);
    }
    catch (error) {
        res.status(500).json({ error: "Erro ao buscar jogo" });
    }
}));
exports.default = router;
