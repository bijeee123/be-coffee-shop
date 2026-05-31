const db = require('../config/db');

// Menambahkan bahan baku baru
const createIngredient = async (data) => {
    const { name, stock, unit, min_stock } = data;
    const [result] = await db.query(
        'INSERT INTO ingredients (name, stock, unit, min_stock) VALUES (?, ?, ?, ?)',
        [name, stock, unit, min_stock]
    );
    return result.insertId;
};

// Mengambil semua bahan baku
const getAllIngredients = async () => {
    const [rows] = await db.query('SELECT * FROM ingredients ORDER BY name ASC');
    return rows;
};

// Mencatat log mutasi stok
const createStockLog = async (ingredient_id, type, qty, reason) => {
    await db.query(
        'INSERT INTO stock_logs (ingredient_id, type, qty, reason) VALUES (?, ?, ?, ?)',
        [ingredient_id, type, qty, reason]
    );
};

// Menambahkan resep (relasi menu ke bahan baku)
const addRecipeItem = async (data) => {
    const { menu_id, ingredient_id, qty } = data;
    const [result] = await db.query(
        'INSERT INTO recipes (menu_id, ingredient_id, qty) VALUES (?, ?, ?)',
        [menu_id, ingredient_id, qty]
    );
    return result.insertId;
};

module.exports = {
    createIngredient,
    getAllIngredients,
    createStockLog,
    addRecipeItem
};