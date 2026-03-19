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

// Root route for local backend checks
app.get('/', (req, res) => {
    res.json({
        status: 'LMS backend is running',
        health: '/api/health',
        docsHint: 'Use /api/* endpoints for backend APIs'
    });
});

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'Backend is running' });
});

// Initialize database endpoint (for first-time Vercel setup)
app.get('/api/init-db', async (req, res) => {
    try {
        const { initializeDatabase } = require('./db-init');

        if (!process.env.DATABASE_URL) {
            return res.status(500).json({
                error: 'DATABASE_URL is not configured',
                hint: 'Add DATABASE_URL in Vercel project environment variables'
            });
        }

        const result = await initializeDatabase();
        res.json({
            status: 'Database initialized successfully!',
            seededCourses: result.seededCourses,
            seededLessons: result.seededLessons
        });
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
const { router: lmsRouter } = require('./routes/lms');
const { router: aiRouter } = require('./routes/ai');

app.use('/api/auth', authRouter);
app.use('/api', lmsRouter);
app.use('/api/ai', aiRouter);

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
