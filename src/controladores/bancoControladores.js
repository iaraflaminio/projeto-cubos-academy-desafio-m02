const banco = require('../dados/bancodedados')
const { formatInTimeZone } = require('date-fns-tz')


let numero = 1

const listarContas = (req, res) => res.json(banco)

const criarConta = (req, res) => {
    const { nome, cpf, data_nascimento, telefone, email, senha } = req.body

    const verificaCPF = banco.contas.find(conta => conta.usuario.cpf === cpf)

    const verificaEmail = banco.contas.find(conta => conta.usuario.email === email)

    if (verificaCPF || verificaEmail) {
        return res.status(400).json({ mensagem: "Já existe uma conta com o cpf ou e-mail informado!" })
    }

    if (!nome) {
        return res.status(400).json({ mensagem: "Por favor, informe o seu nome" })
    }
    if (!cpf) {
        return res.status(400).json({ mensagem: "Por favor, informe o seu CPF" })
    }
    if (!data_nascimento) {
        return res.status(400).json({ mensagem: "Por favor, informe a sua data de nascimento" })
    }
    if (!telefone) {
        return res.status(400).json({ mensagem: "Por favor, informe o seu telefone" })
    }
    if (!email) {
        return res.status(400).json({ mensagem: "Por favor, informe o seu e-mail" })
    }
    if (!senha) {
        return res.status(400).json({ mensagem: "Por favor, crie uma senha" })
    }

    const conta = {
        numero: numero,
        saldo: 0,
        usuario: {
            nome,
            cpf,
            data_nascimento,
            telefone,
            email,
            senha
        }
    }

    banco.contas.push(conta)

    numero++

    return res.status(201).send()
}

const atualizarUsuario = (req, res) => {
    const { numeroConta } = req.params
    const { nome, cpf, data_nascimento, telefone, email, senha } = req.body

    if (isNaN(numeroConta)) {
        return res.status(400).json({ mensagem: "O número da conta informado não é um número válido" })
    }

    const indexConta = banco.contas.findIndex(conta => conta.numero === Number(numeroConta))

    if (indexConta < 0) {
        return res.status(404).json({ mensagem: "Conta não encontrada" })
    }

    const contaAtual = banco.contas[indexConta].usuario

    if (cpf !== contaAtual.cpf) {
        const verificaCPF = banco.contas.find(conta => conta.numero !== indexConta && conta.usuario.cpf === cpf)

        if (verificaCPF || verificaEmail) {
            return res.status(400).json({ mensagem: "O CPF informado já existe cadastrado!" })
        }
    }
    if (email !== contaAtual.email) {
        const verificaEmail = banco.contas.find(conta => conta.numero !== indexConta && conta.usuario.email === email)
        if (verificaEmail) {
            return res.status(400).json({ mensagem: "O e-mail informado já existe cadastrado!" })
        }
    }

    if (!nome) {
        return res.status(400).json({ mensagem: "Por favor, informe o seu nome" })
    }
    if (!cpf) {
        return res.status(400).json({ mensagem: "Por favor, informe o seu CPF" })
    }
    if (!data_nascimento) {
        return res.status(400).json({ mensagem: "Por favor, informe a sua data de nascimento" })
    }
    if (!telefone) {
        return res.status(400).json({ mensagem: "Por favor, informe o seu telefone" })
    }
    if (!email) {
        return res.status(400).json({ mensagem: "Por favor, informe o seu e-mail" })
    }
    if (!senha) {
        return res.status(400).json({ mensagem: "Por favor, coloque sua senha" })
    }

    const usuario = banco.contas[indexConta].usuario
    usuario.nome = nome
    usuario.cpf = cpf
    usuario.data_nascimento = data_nascimento
    usuario.telefone = telefone
    usuario.email = email
    usuario.senha = senha

    return res.status(204).send()
}

const excluirConta = (req, res) => {
    const { numeroConta } = req.params

    if (isNaN(numeroConta)) {
        return res.status(400).json({ mensagem: "O número da conta informado não é um número válido" })
    }

    const indexConta = banco.contas.findIndex(conta => conta.numero === Number(numeroConta))

    if (indexConta < 0) {
        return res.status(404).json({ mensagem: "Conta não encontrada" })
    }

    const contaAtual = banco.contas[indexConta]

    if (contaAtual.saldo > 0) {
        return res.status(403).json({ mensagem: "A conta só pode ser removida se o saldo for zero!" })
    }

    const contaExcluida = banco.contas.splice(indexConta, 1)
    return res.status(204).json(contaExcluida)
}

const depositar = (req, res) => {
    const { numero_conta, valor } = req.body

    if (!numero_conta || !valor) {
        return res.status(400).json({ mensagem: "O número da conta e o valor são obrigatórios!" })
    }

    const indexConta = banco.contas.findIndex(conta => conta.numero === Number(numero_conta))
    if (indexConta < 0) {
        return res.status(404).json({ mensagem: "Conta não encontrada" })
    }

    const valorDeposito = Number(valor)
    if (isNaN(valorDeposito) || valorDeposito <= 0) {
        return res.status(400).json({ mensagem: "Valor inválido para depósito" })
    }

    banco.contas[indexConta].saldo += valorDeposito

    const dataUTC = new Date()
    const timeZone = 'America/Sao_Paulo'
    const format = 'dd/MM/yyyy HH:mm:ss'

    const dataFormatada = formatInTimeZone(dataUTC, timeZone, format)

    const deposito = {
        data: dataFormatada,
        numero_conta: numero_conta,
        valor: valor
    }

    banco.depositos.push(deposito)

    return res.status(201).send()
}

const sacar = (req, res) => {
    const { numero_conta, valor, senha } = req.body

    if (!numero_conta || !valor || !senha) {
        return res.status(400).json({ mensagem: "Por favor, preencha todos os campos" })
    }

    const indexConta = banco.contas.findIndex(conta => conta.numero === Number(numero_conta))
    if (indexConta < 0) {
        return res.status(404).json({ mensagem: "Conta não encontrada" })
    }

    const contaAtual = banco.contas[indexConta]

    if (senha !== contaAtual.usuario.senha) {
        return res.status(403).json({ mensagem: "Senha inválida" })
    }

    const valorSaque = Number(valor)
    if (isNaN(valorSaque) || valorSaque <= 0) {
        return res.status(400).json({ mensagem: "Informe um valor válido para o saque" })
    }
    if (contaAtual.saldo < valorSaque) {
        return res.status(400).json({ mensagem: "Saldo insuficiente para saque neste valor" })
    }


    contaAtual.saldo -= valorSaque

    const dataUTC = new Date()
    const timeZone = 'America/Sao_Paulo'
    const format = 'dd/MM/yyyy HH:mm:ss'

    const dataFormatada = formatInTimeZone(dataUTC, timeZone, format)

    const saque = {
        data: dataFormatada,
        numero_conta: numero_conta,
        valor: valorSaque
    }

    banco.saques.push(saque)

    return res.status(201).send()
}

const transferir = (req, res) => {
    const { numero_conta_origem, numero_conta_destino, valor, senha } = req.body

    if (!numero_conta_origem || !numero_conta_destino || !valor || !senha) {
        return res.status(400).json({ mensagem: "Por favor, preencha todos os campos" })
    }

    const indexContaOrigem = banco.contas.findIndex(conta => conta.numero === Number(numero_conta_origem))
    const indexContaDestino = banco.contas.findIndex(conta => conta.numero === Number(numero_conta_destino))

    if (indexContaOrigem < 0 || indexContaDestino < 0) {
        return res.status(404).json({ mensagem: "Conta não encontrada" })
    }

    const senhaOrigem = banco.contas[indexContaOrigem].usuario.senha
    if (senha !== senhaOrigem) {
        return res.status(401).json({ mensagem: "Senha inválida" })
    }

    const valorTransferencia = Number(valor)

    if (isNaN(valorTransferencia) || valorTransferencia <= 0) {
        return res.status(400).json({ mensagem: "Informe um valor válido para transferir" })
    }

    const contaOrigem = banco.contas[indexContaOrigem]
    if (contaOrigem.saldo < valorTransferencia) {
        return res.status(400).json({ mensagem: "Saldo insuficiente para transferência neste valor" })
    }

    if (indexContaOrigem === indexContaDestino) {
        return res.status(400).json({ mensagem: "Não é possível fazer uma transferência para a sua conta" })
    }

    const contaDestino = banco.contas[indexContaDestino]
    contaOrigem.saldo -= valorTransferencia
    contaDestino.saldo += valorTransferencia

    const dataUTC = new Date()
    const timeZone = 'America/Sao_Paulo'
    const format = 'dd/MM/yyyy HH:mm:ss'

    const dataFormatada = formatInTimeZone(dataUTC, timeZone, format)

    const transferencia = {
        data: dataFormatada,
        numero_conta_origem: numero_conta_origem,
        numero_conta_destino: numero_conta_destino,
        valor: valorTransferencia
    }

    banco.transferencias.push(transferencia)

    return res.status(201).send()


}

const consultaSaldo = (req, res) => {
    const { numero_conta, senha } = req.query
    if (!numero_conta || !senha) {
        return res.status(400).json({ mensagem: "O número da conta e a senha precisam ser informados" })
    }

    const indexConta = banco.contas.findIndex(conta => conta.numero === Number(numero_conta))
    if (isNaN(indexConta) || indexConta < 0) {
        return res.status(404).json({ mensagem: "Conta não encontrada" })
    }

    const contaAtual = banco.contas[indexConta].usuario

    if (senha !== contaAtual.senha) {
        return res.status(401).json({ mensagem: "Senha inválida" })
    }
    return res.status(200).json({ saldo: banco.contas[indexConta].saldo })

}

const consultaExtrato = (req, res) => {
    const { numero_conta, senha } = req.query
    if (!numero_conta || !senha) {
        return res.status(400).json({ mensagem: "O número da conta e a senha precisam ser informados" })
    }
    const indexConta = banco.contas.findIndex(conta => conta.numero === Number(numero_conta))
    if (isNaN(indexConta) || indexConta < 0) {
        return res.status(404).json({ mensagem: "Conta não encontrada" })
    }

    const contaAtual = banco.contas[indexConta].usuario

    if (senha !== contaAtual.senha) {
        return res.status(401).json({ mensagem: "Senha inválida" })
    }

    const extrato = {
        depositos: banco.depositos.filter(deposito => deposito.numero_conta === numero_conta),
        saques: banco.saques.filter(saque => saque.numero_conta === numero_conta),
        transferenciasEnviadas: banco.transferencias.filter(transferencia => transferencia.numero_conta_origem === numero_conta),
        transferenciasRecebidas: banco.transferencias.filter(transferencia => transferencia.numero_conta_destino === numero_conta)
    }
    return res.status(200).json(extrato)
}






module.exports = {
    listarContas,
    criarConta,
    atualizarUsuario,
    excluirConta, depositar,
    sacar,
    transferir,
    consultaSaldo,
    consultaExtrato
}