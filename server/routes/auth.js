const express = require('express');
const { body, validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

// @route   POST /api/auth/register
// @desc    Register a new user
router.post(
    '/register',
    [
        body('name', 'Name is required').notEmpty(),
        body('email', 'Please include a valid email').isEmail(),
        body('password', 'Password must be at least 6 characters').isLength({ min: 6 }),
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        try {
            const { name, email, password } = req.body;

            const existingUser = await User.findOne({ where: { email } });
            if (existingUser) {
                return res.status(400).json({ message: 'User already exists with that email' });
            }

            const user = await User.create({ name, email, password });

            res.status(201).json({
                id: user.id,
                name: user.name,
                email: user.email,
                token: generateToken(user.id),
            });
        } catch (error) {
            console.error('Register error:', error);
            res.status(500).json({ message: 'Server error' });
        }
    }
);

// @route   POST /api/auth/login
// @desc    Authenticate user & get token
router.post(
    '/login',
    [
        body('email', 'Please include a valid email').isEmail(),
        body('password', 'Password is required').exists(),
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        try {
            const { email, password } = req.body;

            const user = await User.findOne({ where: { email } });
            if (!user) {
                return res.status(400).json({ message: 'Invalid credentials' });
            }

            const isMatch = await user.matchPassword(password);
            if (!isMatch) {
                return res.status(400).json({ message: 'Invalid credentials' });
            }

            res.json({
                id: user.id,
                name: user.name,
                email: user.email,
                token: generateToken(user.id),
            });
        } catch (error) {
            console.error('Login error:', error);
            res.status(500).json({ message: 'Server error' });
        }
    }
);

// @route   GET /api/auth/me
// @desc    Get current user
router.get('/me', auth, async (req, res) => {
    res.json(req.user);
});

module.exports = router;
