const { DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');
const sequelize = require('../config/db');

const User = sequelize.define(
    'User',
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        name: {
            type: DataTypes.STRING(100),
            allowNull: false,
        },
        email: {
            type: DataTypes.STRING(255),
            allowNull: false,
            unique: true,
            validate: { isEmail: true },
        },
        password: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
    },
    {
        timestamps: true,
        hooks: {
            beforeCreate: async (user) => {
                const salt = await bcrypt.genSalt(10);
                user.password = await bcrypt.hash(user.password, salt);
            },
        },
    }
);

User.prototype.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = User;
