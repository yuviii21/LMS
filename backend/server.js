const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors({
    origin: ['http://localhost:3000', 'http://localhost:5173', 'http://127.0.0.1:5500', 'http://127.0.0.1:3000', 'https://*.vercel.app'],
    credentials: true
}));
app.use(express.json());

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'Backend is running' });
});

// Initialize database endpoint (for Vercel setup)
app.get('/api/init-db', async (req, res) => {
    try {
        const { pool } = require('./db');
        const client = await pool.connect();
        
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
        client.release();
        
        res.json({ status: 'Database initialized successfully!' });
    } catch (error) {
        console.error('Init Error:', error);
        res.status(500).json({ 
            error: error.message,
            hint: 'Check DATABASE_URL in Vercel environment variables'
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
    console.error('Unhandled Error:', err);
    res.status(500).json({ 
        error: 'Internal Server Error',
        message: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// Start server (only if not running in Vercel serverless environment)
if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}`);
    });
}

module.exports = app;
        throw e;
    }

    return cached.conn;
};

// Apply connectDB middleware to all routes
app.use(async (req, res, next) => {
    try {
        await connectDB();
        next();
    } catch (error) {
        res.status(500).json({ error: error.message || 'Database connection failed' });
    }
});

// Routes
const { router: authRouter } = require('./routes/auth');
app.use('/api/auth', authRouter);

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'Backend is running' });
});

// Start server (only if not running in Vercel serverless environment)
if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}`);
    });
}

module.exports = app;
