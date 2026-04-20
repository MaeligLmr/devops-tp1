const express = require('express');
const authRoutes = require('./routes/authRoutes');
const teamRoutes = require('./routes/teamRoutes');
const playerRoutes = require('./routes/playerRoutes');
const authMiddleware = require('./middlewares/authMiddleware');

const app = express();

app.use(express.json());

app.use('/auth', authRoutes);
app.use('/teams', authMiddleware, teamRoutes);
app.use('/players', authMiddleware, playerRoutes);

app.use((error, req, res, next) => {
    if (error instanceof SyntaxError && 'body' in error) {
        return res.status(400).json({ message: 'JSON invalide' });
    }

    return res.status(500).json({ message: 'Erreur serveur' });
});

module.exports = app;
