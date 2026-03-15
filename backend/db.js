const { Pool } = require('pg');
require('dotenv').config();

// If on Vercel and DATABASE_URL is missing, throw an error
if (!process.env.DATABASE_URL) {
    console.error('CRITICAL ERROR: DATABASE_URL environment variable is not defined!');
    throw new Error('DATABASE_URL is not defined. Please add it to your environment variables.');
}

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

pool.on('error', (err, client) => {
    console.error('Unexpected error on idle client', err);
    process.exit(-1);
});

module.exports = {
    query: (text, params) => pool.query(text, params),
    pool
};
