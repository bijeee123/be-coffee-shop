const voucherModel = require('../models/voucher.model');

const addVoucher = async (req, res) => {
    try {
        const { code, discount, type, expired_at } = req.body;

        // Validasi input wajib
        if (!code || !discount || !type || !expired_at) {
            return res.status(400).json({
                success: false,
                message: 'Semua data (code, discount, type, expired_at) wajib diisi!'
            });
        }

        // Validasi tipe voucher
        const validTypes = ['percentage', 'fixed'];
        if (!validTypes.includes(type)) {
            return res.status(400).json({
                success: false,
                message: "Tipe voucher tidak valid. Harus 'percentage' atau 'fixed'."
            });
        }

        // Jalankan perintah simpan data ke model
        const voucherId = await voucherModel.createVoucher({ code, discount, type, expired_at });

        res.status(201).json({
            success: true,
            message: `Voucher '${code}' berhasil dibuat!`,
            data: {
                id: voucherId,
                code,
                discount,
                type,
                expired_at
            }
        });
    } catch (error) {
        console.error('Error pada addVoucher:', error);

        // Handle error jika kode voucher kembar (Duplicate Entry karena kolom UNIQUE)
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ success: false, message: `Kode voucher '${req.body.code}' sudah digunakan.` });
        }

        res.status(500).json({ success: false, message: 'Terjadi kesalahan pada server saat menambahkan voucher.' });
    }
};

module.exports = {
    addVoucher
};