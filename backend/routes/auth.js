const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const db = require('../db');
const router = express.Router();

function getApiErrorDetails(error, fallbackMessage) {
    if (!error) {
        return { status: 500, payload: { error: fallbackMessage } };
    }

    if (error.message === 'DATABASE_URL is not configured') {
        return {
            status: 500,
            payload: {
                error: 'DATABASE_URL is not configured on server',
                hint: 'Add DATABASE_URL in Vercel Environment Variables'
            }
        };
    }

    if (error.code === '42P01') {
        return {
            status: 500,
            payload: {
                error: 'Database table is missing',
                hint: 'Open /api/init-db once to create required tables'
            }
        };
    }

    if (error.code === '23505') {
        return {
            status: 400,
            payload: { error: 'Email already registered' }
        };
    }

    if (error.code === '28P01' || error.code === '28000') {
        return {
            status: 500,
            payload: {
                error: 'Database authentication failed',
                hint: 'Check DATABASE_URL username/password in Vercel'
            }
        };
    }

    if (error.code === '3D000') {
        return {
            status: 500,
            payload: {
                error: 'Database does not exist',
                hint: 'Check DATABASE_URL database name'
            }
        };
    }

    if (String(error.message || '').includes('secretOrPrivateKey')) {
        return {
            status: 500,
            payload: {
                error: 'JWT_SECRET is not configured on server',
                hint: 'Add JWT_SECRET in Vercel Environment Variables'
            }
        };
    }

    return {
        status: 500,
        payload: {
            error: fallbackMessage,
            details: error.message
        }
    };
}

// Register
router.post('/register', async (req, res) => {
    try {
        if (!process.env.JWT_SECRET) {
            return res.status(500).json({
                error: 'JWT_SECRET is not configured on server',
                hint: 'Add JWT_SECRET in Vercel Environment Variables'
            });
        }

        const { name, email, password, confirmPassword } = req.body;

        // Validation
        if (!name || !email || !password || !confirmPassword) {
            return res.status(400).json({ error: 'Please fill in all fields' });
        }

        if (password !== confirmPassword) {
            return res.status(400).json({ error: 'Passwords do not match' });
        }

        if (password.length < 6) {
            return res.status(400).json({ error: 'Password must be at least 6 characters' });
        }

        // Check if user exists
        const userExists = await db.query('SELECT id FROM users WHERE email = $1', [email.toLowerCase()]);
        if (userExists.rows.length > 0) {
            return res.status(400).json({ error: 'Email already registered' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        
        // Random avatar
        const avatar = ['👨‍💻', '👩‍💻', '🧑‍💻'][Math.floor(Math.random() * 3)];

        // Create user
        const result = await db.query(
            'INSERT INTO users (name, email, password, avatar) VALUES ($1, $2, $3, $4) RETURNING *',
            [name, email.toLowerCase(), hashedPassword, avatar]
        );
        
        const user = result.rows[0];

        // Generate JWT token
        const token = jwt.sign(
            { userId: user.id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        // Return user data (without password)
        const userData = {
            id: user.id,
            name: user.name,
            email: user.email,
            bio: user.bio,
            avatar: user.avatar,
            enrolledCourses: user.enrolled_courses,
            joinDate: user.join_date
        };

        res.status(201).json({ token, user: userData });
    } catch (error) {
        console.error('Registration Error:', error.message);
        const mapped = getApiErrorDetails(error, 'Internal Server Error during registration');
        res.status(mapped.status).json(mapped.payload);
    }
});

// Login
router.post('/login', async (req, res) => {
    try {
        if (!process.env.JWT_SECRET) {
            return res.status(500).json({
                error: 'JWT_SECRET is not configured on server',
                hint: 'Add JWT_SECRET in Vercel Environment Variables'
            });
        }

        const { email, password } = req.body;

        // Validation
        if (!email || !password) {
            return res.status(400).json({ error: 'Please fill in all fields' });
        }

        // Find user
        const result = await db.query('SELECT * FROM users WHERE email = $1', [email.toLowerCase()]);
        if (result.rows.length === 0) {
            return res.status(401).json({ error: 'No account found with this email' });
        }

        const user = result.rows[0];

        // Compare password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid password' });
        }

        // Generate JWT token
        const token = jwt.sign(
            { userId: user.id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        // Return user data (without password)
        const userData = {
            id: user.id,
            name: user.name,
            email: user.email,
            bio: user.bio,
            avatar: user.avatar,
            enrolledCourses: user.enrolled_courses,
            joinDate: user.join_date
        };

        res.json({ token, user: userData });
    } catch (error) {
        console.error('Login Error:', error.message);
        const mapped = getApiErrorDetails(error, 'Internal Server Error during login');
        res.status(mapped.status).json(mapped.payload);
    }
});

// Verify token and get user
router.get('/me', authenticateToken, async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM users WHERE id = $1', [req.userId]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        const user = result.rows[0];

        const userData = {
            id: user.id,
            name: user.name,
            email: user.email,
            bio: user.bio,
            avatar: user.avatar,
            enrolledCourses: user.enrolled_courses,
            joinDate: user.join_date
        };

        res.json({ user: userData });
    } catch (error) {
        console.error('Me Error:', error.message);
        const mapped = getApiErrorDetails(error, 'Internal Server Error during user fetch');
        res.status(mapped.status).json(mapped.payload);
    }
});

// Middleware to verify token
function authenticateToken(req, res, next) {
    if (!process.env.JWT_SECRET) {
        return res.status(500).json({
            error: 'JWT_SECRET is not configured on server',
            hint: 'Add JWT_SECRET in Vercel Environment Variables'
        });
    }

    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'No token provided' });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decodedUser) => {
        if (err) {
            return res.status(403).json({ error: 'Invalid token' });
        }
        req.userId = decodedUser.userId;
        next();
    });
}

module.exports = { router, authenticateToken };
