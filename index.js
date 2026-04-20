const express = require('express');
const { MongoClient } = require('mongodb');

const app = express();
const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/tp1';
const prefix = '/teams';
const DATABASE_NAME = 'tp1';

app.use(express.json());

const client = new MongoClient(MONGO_URI);
let teamsCollection;

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

app.get(prefix, async (req, res, next) => {
  try {
    const teams = await teamsCollection.find().sort({ id: 1 }).toArray();
    return res.json(teams.map(toPublicTeam));
  } catch (error) {
    return next(error);
  }
});

app.get(`${prefix}/:id`, async (req, res, next) => {
  try {
    const teamId = Number.parseInt(req.params.id, 10);
    const team = await teamsCollection.findOne({ id: teamId });

    if (!team) {
      return res.status(404).json({ message: 'Equipe introuvable' });
    }

    return res.json(toPublicTeam(team));
  } catch (error) {
    return next(error);
  }
});

app.post(prefix, async (req, res, next) => {
  try {
    const { name, country } = normalizeTeamPayload(req.body);

    if (!name || !country) {
      return res.status(400).json({ message: 'Les champs name et country sont obligatoires' });
    }

    const lastTeam = await teamsCollection.find().sort({ id: -1 }).limit(1).toArray();
    const newTeam = {
      id: lastTeam.length > 0 ? lastTeam[0].id + 1 : 1,
      name,
      country,
    };

    await teamsCollection.insertOne(newTeam);

    return res.status(201).json(newTeam);
  } catch (error) {
    return next(error);
  }
});

app.put(`${prefix}/:id`, async (req, res, next) => {
  try {
    const teamId = Number.parseInt(req.params.id, 10);
    const { name, country } = normalizeTeamPayload(req.body);

    if (!name || !country) {
      return res.status(400).json({ message: 'Les champs name et country sont obligatoires' });
    }

    const result = await teamsCollection.findOneAndUpdate(
      { id: teamId },
      { $set: { name, country } },
      { returnDocument: 'after' }
    );

    if (!result.value) {
      return res.status(404).json({ message: 'Equipe introuvable' });
    }

    return res.json(toPublicTeam(result.value));
  } catch (error) {
    return next(error);
  }
});

app.delete(`${prefix}/:id`, async (req, res, next) => {
  try {
    const teamId = Number.parseInt(req.params.id, 10);
    const result = await teamsCollection.deleteOne({ id: teamId });

    if (result.deletedCount === 0) {
      return res.status(404).json({ message: 'Equipe introuvable' });
    }

    return res.status(204).send();
  } catch (error) {
    return next(error);
  }
});

app.use((error, req, res, next) => {
  if (error instanceof SyntaxError && 'body' in error) {
    return res.status(400).json({ message: 'JSON invalide' });
  }

  return res.status(500).json({ message: 'Erreur serveur' });
});

async function startServer() {
  try {
    await client.connect();
    teamsCollection = client.db(DATABASE_NAME).collection('teams');
    await teamsCollection.createIndex({ id: 1 }, { unique: true });

    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Mongo connection failed:', error.message);
    process.exit(1);
  }
}

startServer();