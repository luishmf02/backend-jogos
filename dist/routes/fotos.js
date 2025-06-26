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
const client_1 = require("@prisma/client");
const express_1 = require("express");
const zod_1 = require("zod");
const multer_1 = __importDefault(require("multer"));
const multer_storage_cloudinary_1 = require("multer-storage-cloudinary");
const cloudinary_1 = require("cloudinary");
const prisma = new client_1.PrismaClient();
const router = (0, express_1.Router)();
const imagemSchema = zod_1.z.object({
    legenda: zod_1.z.string().min(3, { message: "Legenda deve ter no mínimo 3 caracteres" }),
    jogoId: zod_1.z.coerce.number(),
});
cloudinary_1.v2.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'dvfcxadyh',
    api_key: process.env.CLOUDINARY_API_KEY || '626956919255949',
    api_secret: process.env.CLOUDINARY_API_SECRET || '_7K5oKKtDfTGhTixH8IMVB1LPoI',
});
const storage = new multer_storage_cloudinary_1.CloudinaryStorage({
    cloudinary: cloudinary_1.v2,
    params: (req, file) => {
        return {
            public_id: `${Date.now()}-${file.originalname.split('.')[0]}`,
            folder: 'loja_jogos',
            allowed_formats: ['jpg', 'png', 'jpeg'],
            transformation: [{ width: 800, height: 800, crop: 'limit' }],
        };
    },
});
const upload = (0, multer_1.default)({ storage: storage });
router.get('/', (_req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const imagens = yield prisma.imagem.findMany({ include: { jogo: true } });
        return res.status(200).json(imagens);
    }
    catch (error) {
        return res.status(500).json({ error });
    }
}));
router.post('/', upload.single('image'), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const valida = imagemSchema.safeParse(req.body);
    if (!valida.success) {
        return res.status(400).json({ error: valida.error });
    }
    if (!req.file || !req.file.path) {
        return res.status(400).json({ error: 'Imagem não enviada' });
    }
    const { legenda, jogoId } = valida.data;
    const url = req.file.path;
    try {
        const imagem = yield prisma.imagem.create({ data: { legenda, jogoId, url } });
        return res.status(201).json(imagem);
    }
    catch (error) {
        return res.status(400).json({ error });
    }
}));
exports.default = router;
