const db = require('../config/db');

const createMenu = async (menuData) => {
    const { name, price, category, image, is_available } = menuData;
    const [result] = await db.query(
        'INSERT INTO menus (name, price, category, image, is_available) VALUES (?, ?, ?, ?, ?)',
        [name, price, category, image, is_available !== undefined ? is_available : true]
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