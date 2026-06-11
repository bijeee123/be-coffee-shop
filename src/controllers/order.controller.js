const orderService = require('../services/order.service');
const orderModel = require('../models/order.model');

const createOrder = async (req, res) => {
    try {
        const { items, payment_method, customer_id, voucher_code } = req.body;
        const userId = req.user.id; // Didapat dari verifyToken middleware

        if (!items || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ message: 'Item pesanan tidak boleh kosong.' });
        }

        if (!payment_method) {
            return res.status(400).json({ message: 'Metode pembayaran wajib diisi (cash/qris/edc).' });
        }

        // Oper voucher_code ke service di parameter ke-5
        const orderResult = await orderService.processNewOrder(userId, items, payment_method, customer_id, voucher_code);

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

        // Ambil data detail order SEBELUM di-update untuk cek customer_id dan total_price
        const currentOrder = await orderModel.getOrderById(orderId);
        if (!currentOrder) {
            return res.status(404).json({ message: 'Pesanan tidak ditemukan.' });
        }

        // Jalankan update status
        const affectedRows = await orderModel.updateOrderStatus(orderId, status);

        if (status === 'completed') {
            console.log(`[LOYALTY DEBUG] Order ID: ${orderId}, Customer ID: ${currentOrder.customer_id}, Total Price: ${currentOrder.total_price}`);

            if (currentOrder.customer_id) {
                // Pakai Number() untuk memastikan total_price dihitung sebagai angka murni
                const totalPriceNumeric = Number(currentOrder.total_price);
                const pointsEarned = Math.floor(totalPriceNumeric / 10000) * 5;

                console.log(`[LOYALTY DEBUG] Poin yang dihitung: ${pointsEarned}`);

                if (pointsEarned > 0) {
                    await orderModel.addCustomerPoints(currentOrder.customer_id, pointsEarned);
                    console.log(`[LOYALTY] Berhasil menambahkan ${pointsEarned} poin ke Customer ID #${currentOrder.customer_id}`);
                } else {
                    console.log(`[LOYALTY] Total belanja ${totalPriceNumeric} di bawah kelipatan 10.000, tidak dapat poin.`);
                }
            } else {
                console.log(`[LOYALTY] Transaksi ini bukan milik member/customer, skip tambah poin.`);
            }
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

// Menampilkan pesanan aktif
const getActive = async (req, res) => {
    try {
        const orders = await orderModel.getActiveOrders();
        res.status(200).json({ success: true, data: orders });
    } catch (error) {
        console.error('Error getActive:', error);
        res.status(500).json({ success: false, message: 'Gagal mengambil data pesanan aktif.' });
    }
};

// Menampilkan histori pesanan
const getHistory = async (req, res) => {
    try {
        const orders = await orderModel.getOrderHistory();
        res.status(200).json({ success: true, data: orders });
    } catch (error) {
        console.error('Error getHistory:', error);
        res.status(500).json({ success: false, message: 'Gagal mengambil histori pesanan.' });
    }
};

// Menampilkan detail pesanan beserta item
const getDetail = async (req, res) => {
    try {
        const { id } = req.params;
        const orderDetail = await orderModel.getOrderDetails(id);

        if (!orderDetail) {
            return res.status(404).json({ success: false, message: 'Pesanan tidak ditemukan.' });
        }

        res.status(200).json({ success: true, data: orderDetail });
    } catch (error) {
        console.error('Error getDetail:', error);
        res.status(500).json({ success: false, message: 'Gagal mengambil detail pesanan.' });
    }
};

module.exports = {
    createOrder,
    updateStatus,
    getActive,
    getHistory,
    getDetail
};