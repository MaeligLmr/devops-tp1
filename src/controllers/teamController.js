const teamModel = require('../models/teamModel');

function normalizeTeamPayload(payload) {
    const name = typeof payload.name === 'string' ? payload.name.trim() : '';
    const country = typeof payload.country === 'string' ? payload.country.trim() : '';

    return { name, country };
}

function toPublicTeam(team) {
    return {
        id: team.id,
        name: team.name,
        country: team.country,
    };
}

exports.getAllTeams = async (req, res, next) => {
    try {
        const teams = await teamModel.findAll();
        return res.json(teams.map(toPublicTeam));
    } catch (error) {
        return next(error);
    }
};

exports.getTeamById = async (req, res, next) => {
    try {
        const team = await teamModel.findById(req.params.id);
        if (!team) {
            return res.status(404).json({ message: 'Equipe introuvable' });
        }

        return res.json(toPublicTeam(team));
    } catch (error) {
        return next(error);
    }
};

exports.createTeam = async (req, res, next) => {
    try {
        const { name, country } = normalizeTeamPayload(req.body);

        if (!name || !country) {
            return res.status(400).json({ message: 'Les champs name et country sont obligatoires' });
        }

        const newTeam = {
            id: await teamModel.getNextId(),
            name,
            country,
        };

        await teamModel.create(newTeam);

        return res.status(201).json(newTeam);
    } catch (error) {
        return next(error);
    }
};

exports.updateTeam = async (req, res, next) => {
    try {
        const teamId = Number.parseInt(req.params.id, 10);
        const { name, country } = normalizeTeamPayload(req.body);

        if (!name || !country) {
            return res.status(400).json({ message: 'Les champs name et country sont obligatoires' });
        }

        const updatedTeam = await teamModel.updateById(teamId, { name, country });

        return res.json(toPublicTeam(updatedTeam));
    } catch (error) {
        return next(error);
    }
};

exports.deleteTeam = async (req, res, next) => {
    try {
        const teamId = Number.parseInt(req.params.id, 10);
        const result = await teamModel.deleteById(teamId);

        if (result.deletedCount === 0) {
            return res.status(404).json({ message: 'Equipe introuvable' });
        }

        return res.status(204).send();
    } catch (error) {
        return next(error);
    }
};
