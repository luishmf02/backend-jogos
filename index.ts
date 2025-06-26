import express from 'express'
import cors from 'cors'
import routesJogos from './routes/jogos'
import routesImagens from './routes/fotos'
import routesEstudios from './routes/estudios'
import routesClientes from './routes/clientes'
import routesInteracoes from './routes/interacoes'
import recuperacaoRoutes from './routes/recuperacao'

const app = express()
const port = 3001

app.use(express.json())
app.use(cors())

app.use("/jogos", routesJogos)
app.use("/imagens", routesImagens)
app.use("/estudios", routesEstudios)
app.use("/clientes", routesClientes)
app.use('/interacoes', routesInteracoes)
app.use('/recuperacao', recuperacaoRoutes)

app.get('/', (req, res) => {
  res.send('API: Loja de Jogos')
})

app.listen(port, () => {
  console.log(`Servidor rodando na porta: ${port}`)
})