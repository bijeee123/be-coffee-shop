const inventoryModel = require('../models/inventory.model');

const addIngredient = async (req, res) => {
    try {
        const { name, stock, unit, min_stock } = req.body;

        if (!name || stock === undefined || !unit || min_stock === undefined) {
            return res.status(400).json({ message: 'Semua field wajib diisi (name, stock, unit, min_stock).' });
        }

        // Simpan bahan baku
        const ingredientId = await inventoryModel.createIngredient({ name, stock, unit, min_stock });

        // Catat sebagai log stok awal jika stok lebih dari 0
        if (stock > 0) {
            await inventoryModel.createStockLog(ingredientId, 'in', stock, 'Stok Awal');
        }

        res.status(201).json({
            success: true,
            message: 'Bahan baku berhasil ditambahkan.',
            data: { id: ingredientId, name, stock, unit }
        });
    } catch (error) {
        console.error('Error pada addIngredient:', error);
        res.status(500).json({ success: false, message: 'Terjadi kesalahan pada server.' });
    }
};

const getIngredients = async (req, res) => {
    try {
        const ingredients = await inventoryModel.getAllIngredients();
        res.status(200).json({
            success: true,
            data: ingredients
        });
    } catch (error) {
        console.error('Error pada getIngredients:', error);
        res.status(500).json({ success: false, message: 'Terjadi kesalahan pada server.' });
    }
};

const addRecipe = async (req, res) => {
    try {
        const { menu_id, ingredient_id, qty } = req.body;

        if (!menu_id || !ingredient_id || !qty) {
            return res.status(400).json({ message: 'menu_id, ingredient_id, dan qty wajib diisi.' });
        }

        const recipeId = await inventoryModel.addRecipeItem({ menu_id, ingredient_id, qty });

        res.status(201).json({
            success: true,
            message: 'Resep berhasil ditambahkan ke menu.',
            data: { id: recipeId, menu_id, ingredient_id, qty }
        });
    } catch (error) {
        console.error('Error pada addRecipe:', error);
        res.status(500).json({ success: false, message: 'Terjadi kesalahan pada server (Mungkin ID menu/bahan tidak ditemukan).' });
    }
};

module.exports = {
    addIngredient,
    getIngredients,
    addRecipe
};