const { Pool } = require('pg');
require('dotenv').config();

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
    console.error('DATABASE_URL is not set. Add it to Vercel Environment Variables.');
}

function buildPoolConfig(url) {
    const parsedUrl = new URL(url);

    // Prevent connection-string SSL params from overriding the ssl object below.
    parsedUrl.searchParams.delete('sslmode');
    parsedUrl.searchParams.delete('sslcert');
    parsedUrl.searchParams.delete('sslkey');
    parsedUrl.searchParams.delete('sslrootcert');

    return {
        connectionString: parsedUrl.toString(),
        ssl: {
            rejectUnauthorized: false
        },
        keepAlive: true
    };
}

const pool = databaseUrl
    ? new Pool(buildPoolConfig(databaseUrl))
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
