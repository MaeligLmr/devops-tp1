const { getDb } = require('../config/database');

function collection() {
    return getDb().collection('players');
}

async function findAll() {
    return collection().find().sort({ id: 1 }).toArray();
}

async function findById(id) {
    return collection().findOne({ id });
}

async function findByTeamId(idTeam) {
    return collection().find({ idTeam }).sort({ id: 1 }).toArray();
}

async function findByNom(name) {
    return collection().find({ name: { $regex: name, $options: 'i' } }).sort({ id: 1 }).toArray();
}

async function create(player) {
    await collection().insertOne(player);
    return player;
}

async function getNextId() {
    const last = await collection().find().sort({ id: -1 }).limit(1).toArray();
    return last.length > 0 ? last[0].id + 1 : 1;
}

async function updateById(id, values) {
    const result = await collection().updateOne({ id }, { $set: values });
    if (result.matchedCount === 0) return null;
    return collection().findOne({ id });
}

async function deleteById(id) {
    return collection().deleteOne({ id });
}

module.exports = {
    findAll,
    findById,
    findByTeamId,
    findByNom,
    create,
    getNextId,
    updateById,
    deleteById,
};
