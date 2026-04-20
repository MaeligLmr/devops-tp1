const { MongoClient } = require('mongodb');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017';
const DATABASE_NAME = process.env.DB_NAME || 'tp1';

const client = new MongoClient(MONGO_URI);
let db;

async function connectDatabase() {
    await client.connect();
    db = client.db(DATABASE_NAME);

    await db.collection('teams').createIndex({ id: 1 }, { unique: true });
    await db.collection('users').createIndex({ email: 1 }, { unique: true });

    return db;
}

function getDb() {
    if (!db) {
        throw new Error('Database not initialized. Call connectDatabase() first.');
    }

    return db;
}

module.exports = {
    connectDatabase,
    getDb,
};
