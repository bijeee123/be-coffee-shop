const orderService = require('../services/order.service');
const orderModel = require('../models/order.model')

const createOrder = async (req, res) => {
    try {
        const { items, paymentMethod } = req.body;
        const userId = req.user.id; // Didapat dari verifyToken middleware

        if (!items || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ message: 'Item pesanan tidak boleh kosong.' });
        }

        if (!paymentMethod) {
            return res.status(400).json({ message: 'Metode pembayaran wajib diisi (cash/qris/edc).' });
        }

        // Jalankan service untuk memproses pesanan
        const orderResult = await orderService.processNewOrder(userId, items, paymentMethod);

        res.status(201).json({
            success: true,
            message: 'Pesanan berhasil dibuat.',
            data: orderResult
        });
    } catch (error) {
        console.error('Error pada createOrder:', error);
        res.status(500).json({ success: false, message: error.message || 'Terjadi kesalahan pada server.' });
    }
};

const updateStatus = async (req, res) => {
    try {
        const orderId = req.params.id; // Mendapatkan ID order dari URL
        const { status } = req.body;

        // Validasi input status berdasarkan ENUM di database
        const validStatuses = ['pending', 'processing', 'ready', 'completed', 'cancelled'];
        if (!status || !validStatuses.includes(status)) {
            return res.status(400).json({ message: 'Status tidak valid atau kosong.' });
        }

        // Jalankan update
        const affectedRows = await orderModel.updateOrderStatus(orderId, status);

        if (affectedRows === 0) {
            return res.status(404).json({ message: 'Pesanan tidak ditemukan.' });
        }

        res.status(200).json({
            success: true,
            message: `Status pesanan #${orderId} berhasil diubah menjadi '${status}'.`
        });
    } catch (error) {
        console.error('Error pada updateStatus:', error);
        res.status(500).json({ success: false, message: 'Terjadi kesalahan pada server.' });
    }
};

module.exports = {
    createOrder,
    updateStatus
};