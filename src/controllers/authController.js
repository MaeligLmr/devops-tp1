const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const userModel = require('../models/userModel');

const JWT_SECRET = process.env.JWT_SECRET || 'RANDOM_TOKEN_SECRET';

function normalizeCredentials(payload) {
    const email = typeof payload.email === 'string' ? payload.email.trim().toLowerCase() : '';
    const password = typeof payload.password === 'string' ? payload.password : '';

    return { email, password };
}

exports.signup = async (req, res, next) => {
    try {
        const { email, password } = normalizeCredentials(req.body);

        if (!email || !password) {
            return res.status(400).json({ error: 'Email et mot de passe obligatoires !' });
        }

        const existingUser = await userModel.findByEmail(email);

        if (existingUser) {
            return res.status(409).json({ error: 'Utilisateur déjà existant !' });
        }

        const hash = await bcrypt.hash(password, 10);
        const userId = await userModel.create({ email, password: hash });

        return res.status(201).json({
            message: 'Utilisateur créé !',
            userId,
        });
    } catch (error) {
        return next(error);
    }
};

exports.login = async (req, res, next) => {
    try {
        const { email, password } = normalizeCredentials(req.body);

        if (!email || !password) {
            return res.status(400).json({ error: 'Email et mot de passe obligatoires !' });
        }

        const user = await userModel.findByEmail(email);

        if (!user) {
            return res.status(401).json({ error: 'Utilisateur non trouvé !' });
        }

        const valid = await bcrypt.compare(password, user.password);

        if (!valid) {
            return res.status(401).json({ error: 'Mot de passe incorrect !' });
        }

        return res.status(200).json({
            userId: user._id,
            token: jwt.sign(
                { userId: user._id },
                JWT_SECRET,
                { expiresIn: '24h' }
            ),
        });
    } catch (error) {
        return next(error);
    }
};
