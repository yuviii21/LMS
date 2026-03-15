const { pool } = require('./db');

const createTables = async () => {
    const client = await pool.connect();
    
    try {
        console.log('Starting database initialization...');
        
        await client.query('BEGIN');
        
        // Ensure the uuid-ossp extension exists for UUID generation
        await client.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp";');

        const createUsersTableText = `
            CREATE TABLE IF NOT EXISTS users (
                id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                name VARCHAR(255) NOT NULL,
                email VARCHAR(255) UNIQUE NOT NULL,
                password VARCHAR(255) NOT NULL,
                bio TEXT DEFAULT 'Passionate learner',
                avatar VARCHAR(255) DEFAULT '👨‍💻',
                enrolled_courses JSONB DEFAULT '[]'::jsonb,
                progress JSONB DEFAULT '{}'::jsonb,
                join_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );
        `;
        
        await client.query(createUsersTableText);
        
        await client.query('COMMIT');
        console.log('Tables created successfully!');
    } catch (e) {
        await client.query('ROLLBACK');
        console.error('Error creating tables:', e);
        throw e;
    } finally {
        client.release();
    }
};

createTables()
    .then(() => process.exit(0))
    .catch((err) => {
        console.error('Initialization failed', err);
        process.exit(1);
    });
