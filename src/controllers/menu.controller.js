const menuModel = require('../models/menu.model');

const createMenu = async (req, res) => {
    try {
        const { name, price, description, is_available } = req.body;
        
        // Ambil nama file jika ada gambar yang diupload
        const image = req.file ? req.file.filename : null;

        if (!name || !price) {
            return res.status(400).json({ message: 'Nama dan harga menu wajib diisi.' });
        }

        const menuId = await menuModel.createMenu({
            name,
            price,
            description,
            is_available: is_available || true,
            image: image // Simpan nama filenya ke database
        });

        res.status(201).json({
            success: true,
            message: 'Menu berhasil ditambahkan beserta gambar.',
            data: { id: menuId, name, price, image }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Gagal menambahkan menu.' });
    }
};

const addMenu = async (req, res) => {
    try {
        const { name, price, category, image, is_available } = req.body;

        // Validasi input wajib
        if (!name || !price || !category) {
            return res.status(400).json({ message: 'Nama, harga, dan kategori wajib diisi.' });
        }

        // Validasi kategori berdasarkan ENUM database
        const validCategories = ['coffee', 'non-coffee', 'tea', 'snack', 'dessert'];
        if (!validCategories.includes(category)) {
            return res.status(400).json({ message: 'Kategori tidak valid.' });
        }

        const menuId = await menuModel.createMenu({
            name,
            price,
            category,
            image,
            is_available
        });

        res.status(201).json({
            success: true,
            message: 'Menu berhasil ditambahkan.',
            data: { id: menuId, name, price, category }
        });
    } catch (error) {
        console.error('Error pada addMenu:', error);
        res.status(500).json({ success: false, message: 'Terjadi kesalahan pada server.' });
    }
};

const getMenus = async (req, res) => {
    try {
        const menus = await menuModel.getAllMenus();
        res.status(200).json({
            success: true,
            data: menus
        });
    } catch (error) {
        console.error('Error pada getMenus:', error);
        res.status(500).json({ success: false, message: 'Terjadi kesalahan pada server.' });
    }
};

module.exports = {
    createMenu,
    addMenu,
    getMenus
};