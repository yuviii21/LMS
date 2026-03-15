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
    
    try {
        const db = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/oneeight-lms', {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        isConnected = db.connections[0].readyState;
        console.log('Connected to MongoDB');
    } catch (error) {
        console.log('MongoDB connection error:', error);
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
