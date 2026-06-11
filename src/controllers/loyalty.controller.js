const db = require('../config/db');

const redeemPoints = async (req, res) => {
    const { customer_id, menu_id } = req.body;

    try {
        // 1. Cek Data Customer & Poinnya
        const [customers] = await db.query('SELECT * FROM customers WHERE id = ?', [customer_id]);
        if (customers.length === 0) return res.status(404).json({ message: 'Customer tidak ditemukan.' });
        const customer = customers[0];

        // 2. Cek Data Menu & Syarat Poinnya
        const [menus] = await db.query('SELECT * FROM menus WHERE id = ?', [menu_id]);
        if (menus.length === 0) return res.status(404).json({ message: 'Menu tidak ditemukan.' });
        const menu = menus[0];

        if (menu.points_required <= 0) {
            return res.status(400).json({ message: 'Menu ini tidak bisa ditukar dengan poin.' });
        }

        // 3. Validasi Poin Cukup atau Tidak
        if (customer.points < menu.points_required) {
            return res.status(400).json({ 
                message: `Poin tidak cukup! Poin saat ini: ${customer.points}, butuh: ${menu.points_required}` 
            });
        }

        // 4. Potong Poin Customer
        const newPoints = customer.points - menu.points_required;
        await db.query('UPDATE customers SET points = ? WHERE id = ?', [newPoints, customer_id]);

        // (Opsional: Di sini lu bisa panggil fungsi potong stok inventory seperti di order service)

        res.status(200).json({
            success: true,
            message: `Redeem berhasil! ${menu.name} gratis untuk ${customer.name}.`,
            sisa_poin: newPoints
        });

    } catch (error) {
        console.error('Error redeem:', error);
        res.status(500).json({ message: 'Terjadi kesalahan pada server.' });
    }
};

module.exports = { redeemPoints };