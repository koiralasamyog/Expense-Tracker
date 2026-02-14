const express = require('express');
const { body, validationResult } = require('express-validator');
const { Op } = require('sequelize');
const Expense = require('../models/Expense');
const auth = require('../middleware/auth');

const router = express.Router();

// All routes are protected
router.use(auth);

// @route   GET /api/expenses
// @desc    Get all expenses for the logged-in user
router.get('/', async (req, res) => {
    try {
        const where = { userId: req.user.id };

        // Category filter
        if (req.query.category && req.query.category !== 'All') {
            where.category = req.query.category;
        }

        // Month filter (format: YYYY-MM)
        if (req.query.month) {
            const [year, month] = req.query.month.split('-');
            const startDate = new Date(year, month - 1, 1);
            const endDate = new Date(year, month, 0);
            where.date = { [Op.between]: [startDate, endDate] };
        }

        const expenses = await Expense.findAll({
            where,
            order: [['date', 'DESC'], ['createdAt', 'DESC']],
        });

        res.json(expenses);
    } catch (error) {
        console.error('Get expenses error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   POST /api/expenses
// @desc    Create a new expense
router.post(
    '/',
    [
        body('title', 'Title is required').notEmpty(),
        body('amount', 'Amount must be a positive number').isFloat({ gt: 0 }),
        body('category', 'Category is required').notEmpty(),
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        try {
            const { title, amount, category, date, notes } = req.body;

            const expense = await Expense.create({
                title,
                amount,
                category,
                date: date || new Date(),
                notes: notes || null,
                userId: req.user.id,
            });

            res.status(201).json(expense);
        } catch (error) {
            console.error('Create expense error:', error);
            res.status(500).json({ message: 'Server error' });
        }
    }
);

// @route   PUT /api/expenses/:id
// @desc    Update an expense
router.put('/:id', async (req, res) => {
    try {
        const expense = await Expense.findByPk(req.params.id);

        if (!expense) {
            return res.status(404).json({ message: 'Expense not found' });
        }

        if (expense.userId !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        const { title, amount, category, date, notes } = req.body;

        await expense.update({
            title: title ?? expense.title,
            amount: amount ?? expense.amount,
            category: category ?? expense.category,
            date: date ?? expense.date,
            notes: notes !== undefined ? notes : expense.notes,
        });

        res.json(expense);
    } catch (error) {
        console.error('Update expense error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   DELETE /api/expenses/:id
// @desc    Delete an expense
router.delete('/:id', async (req, res) => {
    try {
        const expense = await Expense.findByPk(req.params.id);

        if (!expense) {
            return res.status(404).json({ message: 'Expense not found' });
        }

        if (expense.userId !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        await expense.destroy();
        res.json({ message: 'Expense deleted' });
    } catch (error) {
        console.error('Delete expense error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
