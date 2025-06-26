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
// Validação com Zod
const estudioSchema = zod_1.z.object({
    nome: zod_1.z.string().min(2, { message: "O nome do estúdio deve ter no mínimo 2 caracteres." })
});
// GET /estudios - lista todos os estúdios
router.get("/", (_req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const estudios = yield prisma.estudio.findMany();
        res.status(200).json(estudios);
    }
    catch (error) {
        res.status(500).json({ error });
    }
}));
// POST /estudios - adiciona novo estúdio
router.post("/", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const valida = estudioSchema.safeParse(req.body);
    if (!valida.success) {
        return res.status(400).json({ error: valida.error });
    }
    try {
        const estudio = yield prisma.estudio.create({
            data: valida.data
        });
        res.status(201).json(estudio);
    }
    catch (error) {
        res.status(400).json({ error });
    }
}));
exports.default = router;
