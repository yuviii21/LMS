const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors({
    origin: ['http://localhost:3000', 'http://localhost:5173', 'http://127.0.0.1:5500', 'http://127.0.0.1:3000'],
    credentials: true
}));
app.use(express.json());

// Connect to MongoDB
let cached = global.mongoose;

if (!cached) {
    cached = global.mongoose = { conn: null, promise: null };
}

const connectDB = async () => {
    // If on Vercel and MONGODB_URI is missing, throw an error immediately
    if (!process.env.MONGODB_URI) {
        console.error('CRITICAL ERROR: MONGODB_URI environment variable is not defined!');
        throw new Error('MONGODB_URI is not defined. Please add it to your Vercel Environment Variables.');
    }

    if (cached.conn) {
        console.log('Using existing database connection');
        return cached.conn;
    }

    if (!cached.promise) {
        console.log('Creating new database connection');
        const opts = {
            bufferCommands: false,
        };

        cached.promise = mongoose.connect(process.env.MONGODB_URI, opts).then((mongoose) => {
            console.log('Connected to MongoDB successfully');
            return mongoose;
        });
    }

    try {
        cached.conn = await cached.promise;
    } catch (e) {
        cached.promise = null;
        console.log('MongoDB connection error:', e);
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
