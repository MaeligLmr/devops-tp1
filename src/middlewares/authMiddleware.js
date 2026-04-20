const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'RANDOM_TOKEN_SECRET';

module.exports = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'Token manquant !' });
        }

        const token = authHeader.split(' ')[1];
        const decodedToken = jwt.verify(token, JWT_SECRET);
        req.auth = { userId: decodedToken.userId };
        return next();
    } catch (error) {
        return res.status(401).json({ error: 'Token invalide !' });
    }
};
