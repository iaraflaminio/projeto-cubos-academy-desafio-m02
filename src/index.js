const express = require('express')
const app = express()
const rotas = require('./rotas')

app.use(express.json())
app.use(rotas)

app.listen(3333, () => console.log("Servidor rodando na porta 3333!"))