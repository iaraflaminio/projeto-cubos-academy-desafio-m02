const express = require('express')
const rotas = express()

const { senha_banco } = require('./intermediarios')
const {
    listarContas,
    criarConta,
    atualizarUsuario,
    excluirConta,
    depositar,
    sacar,
    transferir,
    consultaSaldo,
    consultaExtrato } = require('./controladores/bancoControladores')

rotas.get('/contas', senha_banco, listarContas)

rotas.post('/contas', criarConta)

rotas.put('/contas/:numeroConta/usuario', atualizarUsuario)

rotas.delete('/contas/:numeroConta', excluirConta)

rotas.post('/transacoes/depositar', depositar)

rotas.post('/transacoes/sacar', sacar)

rotas.post('/transacoes/transferir', transferir)

rotas.get('/contas/saldo', consultaSaldo)

rotas.get('/contas/extrato', consultaExtrato)


module.exports = rotas