const db = require('../config/db');

const createUser = async (userData) => {
    const { name, email, password, role } = userData;
    const [result] = await db.query(
        'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
        [name, email, password, role]
    );
    return result.insertId;
};

const getUserByEmail = async (email) => {
    const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    return rows[0];
};

module.exports = {
    createUser,
    getUserByEmail
};