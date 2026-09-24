const authService = require('./auth.service');

function normalizeEmail(email) {
    return email.trim().toLowerCase();
}

function isValidEmail(email) {
    return email.length <= 150 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

async function login(req, res) {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: "E-mail e senha são obrigatórios" });
    }

    const normalizedEmail = normalizeEmail(email);
    if (!isValidEmail(normalizedEmail)) {
        return res.status(400).json({ error: "Informe um e-mail válido" });
    }

    try {
        const user = await authService.login({ email: normalizedEmail, password });
        if (!user) {
            return res.status(401).json({ error: "E-mail ou senha inválidos" });
        }
        res.status(200).json(user);
    } catch (error) {
        if (error.code === "P2002") {
            return res.status(409).json({ error: "Usuário já existe" });
        }
        res.status(500).json({ error: "Erro interno do servidor" });
    }
}

async function register(req, res) {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({ error: "Nome, email e senha são obrigatórios" });
    }

    const normalizedEmail = normalizeEmail(email);
    if (!isValidEmail(normalizedEmail)) {
        return res.status(400).json({ error: "Informe um e-mail válido" });
    }

    try {
        const user = await authService.register({ name, email: normalizedEmail, password });
        res.status(201).json(user);
    } catch (error) {
        if (error.code === "P2002") {
            return res.status(409).json({ error: "Usuário já existe" });
        }
        res.status(500).json({ error: "Erro interno do servidor" });
    }
}

module.exports = {
    login,
    register
};