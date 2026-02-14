const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const User = require('./User');

const Expense = sequelize.define(
    'Expense',
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        title: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        amount: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
        },
        category: {
            type: DataTypes.STRING(100),
            allowNull: false,
            defaultValue: 'Other',
        },
        date: {
            type: DataTypes.DATEONLY,
            allowNull: false,
            defaultValue: DataTypes.NOW,
        },
        notes: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
    },
    {
        timestamps: true,
    }
);

// Associations
Expense.belongsTo(User, { foreignKey: 'userId', onDelete: 'CASCADE' });
User.hasMany(Expense, { foreignKey: 'userId' });

module.exports = Expense;
