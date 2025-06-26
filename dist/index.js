"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const jogos_1 = __importDefault(require("./routes/jogos"));
const fotos_1 = __importDefault(require("./routes/fotos"));
const estudios_1 = __importDefault(require("./routes/estudios"));
const clientes_1 = __importDefault(require("./routes/clientes"));
const interacoes_1 = __importDefault(require("./routes/interacoes"));
const recuperacao_1 = __importDefault(require("./routes/recuperacao"));
const app = (0, express_1.default)();
const port = 3001;
app.use(express_1.default.json());
app.use((0, cors_1.default)());
app.use("/jogos", jogos_1.default);
app.use("/imagens", fotos_1.default);
app.use("/estudios", estudios_1.default);
app.use("/clientes", clientes_1.default);
app.use('/interacoes', interacoes_1.default);
app.use('/recuperacao', recuperacao_1.default);
app.get('/', (req, res) => {
    res.send('API: Loja de Jogos');
});
app.listen(port, () => {
    console.log(`Servidor rodando na porta: ${port}`);
});
