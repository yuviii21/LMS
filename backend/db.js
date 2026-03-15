const { Pool } = require('pg');
require('dotenv').config();

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
    console.error('DATABASE_URL is not set. Add it to Vercel Environment Variables.');
}

const pool = databaseUrl
    ? new Pool({
        connectionString: databaseUrl,
        ssl: { rejectUnauthorized: false }
    })
    : null;

if (pool) {
    pool.on('error', (err) => {
        console.error('PostgreSQL idle client error:', err.message);
    });
}

async function query(text, params) {
    if (!pool) {
        throw new Error('DATABASE_URL is not configured');
    }
    return pool.query(text, params);
}

module.exports = {
    query,
    pool
};
