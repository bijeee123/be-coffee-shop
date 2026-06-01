const db = require('../config/db');

const createMenu = async (menuData) => {
    const { name, price, description, is_available, image } = menuData;
    const [result] = await db.query(
        'INSERT INTO menus (name, price, description, is_available, image) VALUES (?, ?, ?, ?, ?)',
        [name, price, description, is_available, image]
    );
    return result.insertId;
};

const getAllMenus = async () => {
    const [rows] = await db.query('SELECT * FROM menus ORDER BY created_at DESC');
    return rows;
};

module.exports = {
    createMenu,
    getAllMenus
};