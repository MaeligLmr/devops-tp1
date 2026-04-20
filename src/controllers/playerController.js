const playerModel = require('../models/playerModel');
const teamModel = require('../models/teamModel');

function normalizePlayerPayload(payload) {
    const name = typeof payload.name === 'string' ? payload.name.trim() : '';
    const post = typeof payload.post === 'string' ? payload.post.trim() : '';
    const idTeam = Number.parseInt(payload.idTeam, 10);
    const number = Number.parseInt(payload.number, 10);

    return { name, post, idTeam, number };
}

function toPublicPlayer(player) {
    return {
        id: player.id,
        idTeam: player.idTeam,
        name: player.name,
        number: player.number,
        post: player.post,
    };
}

exports.getAllPlayers = async (req, res, next) => {
    try {
        const players = await playerModel.findAll();
        return res.json(players.map(toPublicPlayer));
    } catch (error) {
        return next(error);
    }
};

exports.getPlayerById = async (req, res, next) => {
    try {
        const playerId = Number.parseInt(req.params.id, 10);
        const player = await playerModel.findById(playerId);

        if (!player) {
            return res.status(404).json({ message: 'Joueur introuvable' });
        }

        return res.json(toPublicPlayer(player));
    } catch (error) {
        return next(error);
    }
};

exports.createPlayer = async (req, res, next) => {
    try {
        const { name, post, idTeam, number } = normalizePlayerPayload(req.body);

        if (!name || !post || Number.isNaN(idTeam) || Number.isNaN(number)) {
            return res.status(400).json({ message: 'Les champs name, post, idTeam et number sont obligatoires' });
        }

        const team = await teamModel.findById(idTeam);
        if (!team) {
            return res.status(404).json({ message: 'Equipe introuvable' });
        }

        const newPlayer = {
            id: await playerModel.getNextId(),
            idTeam,
            name,
            number,
            post,
        };

        await playerModel.create(newPlayer);
        return res.status(201).json(newPlayer);
    } catch (error) {
        return next(error);
    }
};

exports.updatePlayer = async (req, res, next) => {
    try {
        const playerId = Number.parseInt(req.params.id, 10);
        const { name, post, idTeam, number } = normalizePlayerPayload(req.body);

        if (!name || !post || Number.isNaN(idTeam) || Number.isNaN(number)) {
            return res.status(400).json({ message: 'Les champs name, post, idTeam et number sont obligatoires' });
        }

        const team = await teamModel.findById(idTeam);
        if (!team) {
            return res.status(404).json({ message: 'Equipe introuvable' });
        }

        const updated = await playerModel.updateById(playerId, { name, post, idTeam, number });

        if (!updated) {
            return res.status(404).json({ message: 'Joueur introuvable' });
        }

        return res.json(toPublicPlayer(updated));
    } catch (error) {
        return next(error);
    }
};

exports.deletePlayer = async (req, res, next) => {
    try {
        const playerId = Number.parseInt(req.params.id, 10);
        const result = await playerModel.deleteById(playerId);

        if (result.deletedCount === 0) {
            return res.status(404).json({ message: 'Joueur introuvable' });
        }

        return res.status(204).send();
    } catch (error) {
        return next(error);
    }
};

exports.getPlayersByTeam = async (req, res, next) => {
    try {
        const idTeam = Number.parseInt(req.params.idTeam, 10);

        const team = await teamModel.findById(idTeam);
        if (!team) {
            return res.status(404).json({ message: 'Equipe introuvable' });
        }

        const players = await playerModel.findByTeamId(idTeam);
        return res.json(players.map(toPublicPlayer));
    } catch (error) {
        return next(error);
    }
};

exports.getTeamByPlayer = async (req, res, next) => {
    try {
        const playerId = Number.parseInt(req.params.id, 10);
        const player = await playerModel.findById(playerId);

        if (!player) {
            return res.status(404).json({ message: 'Joueur introuvable' });
        }

        const team = await teamModel.findById(player.idTeam);
        if (!team) {
            return res.status(404).json({ message: 'Equipe introuvable' });
        }

        return res.json({ id: team.id, name: team.name, country: team.country });
    } catch (error) {
        return next(error);
    }
};

exports.searchPlayersByNom = async (req, res, next) => {
    try {
        const { name } = req.query;

        if (!name || !name.trim()) {
            return res.status(400).json({ message: 'Le paramètre name est obligatoire' });
        }

        const players = await playerModel.findByNom(name.trim());
        return res.json(players.map(toPublicPlayer));
    } catch (error) {
        return next(error);
    }
};
