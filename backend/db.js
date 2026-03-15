const { Pool } = require('pg');
require('dotenv').config();

// Check for required environment variable
if (!process.env.DATABASE_URL) {
    console.error('❌ CRITICAL ERROR: DATABASE_URL environment variable is not defined!');
    console.error('Please add DATABASE_URL to your Vercel Environment Variables.');
    process.exit(1);
}

console.log('✅ DATABASE_URL found, connecting to PostgreSQL...');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

pool.on('error', (err, client) => {
    console.error('❌ Unexpected error on idle client:', err);
    process.exit(-1);
});

pool.on('connect', () => {
    console.log('✅ Successfully connected to PostgreSQL');
});

module.exports = {
    query: (text, params) => pool.query(text, params),
    pool
};
