const { getDb } = require('../config/database');

function collection() {
    return getDb().collection('users');
}

async function findByEmail(email) {
    return collection().findOne({ email });
}

async function create(user) {
    const result = await collection().insertOne(user);
    return result.insertedId;
}

module.exports = {
    findByEmail,
    create,
};
