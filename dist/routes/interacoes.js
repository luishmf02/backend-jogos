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
const express_1 = require("express");
const client_1 = require("@prisma/client");
const verificaToken_1 = require("./verificaToken");
const router = (0, express_1.Router)();
const prisma = new client_1.PrismaClient();
// Listar todas as interações
router.get("/interacoes", verificaToken_1.verificaToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const interacoes = yield prisma.interacao.findMany({
            include: { jogo: true },
            orderBy: { criadoEm: "desc" },
        });
        res.json(interacoes);
    }
    catch (err) {
        res.status(500).json({ erro: "Erro ao buscar interações" });
    }
}));
// Responder uma interação
router.patch("/interacoes/:id/responder", verificaToken_1.verificaToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const { resposta } = req.body;
    if (!resposta) {
        return res.status(400).json({ erro: "Resposta é obrigatória." });
    }
    try {
        const atualizada = yield prisma.interacao.update({
            where: { id: Number(id) },
            data: { resposta },
        });
        res.json(atualizada);
    }
    catch (err) {
        res.status(500).json({ erro: "Erro ao responder interação." });
    }
}));
// Excluir uma interação
router.delete("/interacoes/:id", verificaToken_1.verificaToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    try {
        yield prisma.interacao.delete({ where: { id: Number(id) } });
        res.json({ msg: "Interação excluída." });
    }
    catch (err) {
        res.status(500).json({ erro: "Erro ao excluir interação." });
    }
}));
exports.default = router;
