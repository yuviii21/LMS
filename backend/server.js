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
let isConnected;

const connectDB = async () => {
    if (isConnected) {
        console.log('Using existing database connection');
        return;
    }
    
    // If on Vercel and MONGODB_URI is missing, throw an error immediately instead of hanging on localhost
    if (!process.env.MONGODB_URI) {
        console.error('CRITICAL ERROR: MONGODB_URI environment variable is not defined!');
        throw new Error('MONGODB_URI is not defined. Please add it to your Vercel Environment Variables.');
    }

    try {
        const db = await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            bufferCommands: false, // Disable mongoose buffering to fail fast instead of timing out at 10000ms
        });
        isConnected = db.connections[0].readyState;
        console.log('Connected to MongoDB successfully');
    } catch (error) {
        console.log('MongoDB connection error:', error);
        throw error;
    }
};

// Apply connectDB middleware to all routes
app.use(async (req, res, next) => {
    await connectDB();
    next();
});

// Routes
const { router: authRouter } = require('./routes/auth');
app.use('/api/auth', authRouter);

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'Backend is running' });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

module.exports = app;
