"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verificaToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const verificaToken = (req, res, next) => {
    var _a;
    const token = (_a = req.headers.authorization) === null || _a === void 0 ? void 0 : _a.split(" ")[1];
    if (!token) {
        return res.status(401).json({ mensagem: "Token não fornecido." });
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        // ✅ Garante que decoded é um objeto (JwtPayload)
        if (typeof decoded === "object" && decoded !== null) {
            req.admin = decoded; // se quiser, pode criar um tipo AdminTokenPayload mais tarde
            return next();
        }
        return res.status(401).json({ mensagem: "Token inválido." });
    }
    catch (err) {
        return res.status(401).json({ mensagem: "Token inválido." });
    }
};
exports.verificaToken = verificaToken;
