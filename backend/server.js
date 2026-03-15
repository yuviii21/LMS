const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors({
    origin: true,
    credentials: true
}));
app.use(express.json());

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'Backend is running' });
});

// Initialize database endpoint (for first-time Vercel setup)
app.get('/api/init-db', async (req, res) => {
    try {
        const { pool } = require('./db');
        if (!pool) {
            return res.status(500).json({
                error: 'DATABASE_URL is not configured',
                hint: 'Add DATABASE_URL in Vercel project environment variables'
            });
        }

        const client = await pool.connect();
        try {
            await client.query('BEGIN');
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
            res.json({ status: 'Database initialized successfully!' });
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    } catch (error) {
        console.error('Init Error:', error.message);
        res.status(500).json({
            error: 'Failed to initialize database',
            details: error.message
        });
    }
});

// Routes
const { router: authRouter } = require('./routes/auth');
app.use('/api/auth', authRouter);

// 404 handler
app.use('/api/*', (req, res) => {
    res.status(404).json({ error: 'Route not found' });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Unhandled Error:', err.message);
    res.status(500).json({ error: 'Internal Server Error' });
});

// Start server locally (do not call app.listen in Vercel serverless runtime)
if (!process.env.VERCEL) {
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}`);
    });
}

module.exports = app;
