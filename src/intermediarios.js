const senha_banco = (req, res, next) => {
    const { senha_banco } = req.query
    if (!senha_banco) {
        return res.status(400).json({ mensagem: "A senha do banco precisa ser informada " })
    }
    if (senha_banco !== 'Cubos123Bank') {
        return res.status(401).json({ mensagem: "A senha do banco informada é inválida!" })
    }
    next()
}

module.exports = { senha_banco }