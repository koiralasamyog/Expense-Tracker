const express = require('express');
const cors = require('cors');
require('dotenv').config();

const sequelize = require('./config/db');

// Import models to ensure associations are set up
require('./models/User');
require('./models/Expense');

const authRoutes = require('./routes/auth');
const expenseRoutes = require('./routes/expenses');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/expenses', expenseRoutes);

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Global error handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Something went wrong!' });
});

const PORT = process.env.PORT || 5000;

const start = async () => {
    try {
        await sequelize.authenticate();
        console.log('✅ MariaDB connected successfully');

        // Sync all models (creates tables if they don't exist)
        await sequelize.sync();
        console.log('✅ Database synced');

        app.listen(PORT, () => {
            console.log(`🚀 Server running on port ${PORT}`);
        });
    } catch (error) {
        console.error('❌ Unable to start server:', error);
        process.exit(1);
    }
};

start();
