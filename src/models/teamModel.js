const { getDb } = require('../config/database');

function collection() {
    return getDb().collection('teams');
}

async function findAll() {
    return collection().find().sort({ id: 1 }).toArray();
}

async function findById(id) {
    return collection().findOne({ id });
}

async function create(team) {
    await collection().insertOne(team);
    return team;
}

async function getNextId() {
    const lastTeam = await collection().find().sort({ id: -1 }).limit(1).toArray();
    return lastTeam.length > 0 ? lastTeam[0].id + 1 : 1;
}

async function updateById(id, values) {
    const result = await collection().findOneAndUpdate(
        { id },
        { $set: values },
        { returnDocument: 'after' }
    );
    return result;

}

async function deleteById(id) {
    return collection().deleteOne({ id });
}

module.exports = {
    findAll,
    findById,
    create,
    getNextId,
    updateById,
    deleteById,
};
