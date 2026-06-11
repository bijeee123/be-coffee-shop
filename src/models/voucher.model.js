const db = require('../config/db');

// 1. Cari voucher berdasarkan kode yang masih aktif dan belum expired
const findValidVoucher = async (code) => {
    const [rows] = await db.query(
        `SELECT * FROM vouchers 
            WHERE code = ? AND is_active = 1 AND expired_at >= NOW()`,
        [code]
    );
    return rows[0];
};

// 2. Tambahkan voucher baru
const createVoucher = async (voucherData) => {
    const { code, discount, type, expired_at } = voucherData;
    const [result] = await db.query(
        `INSERT INTO vouchers (code, discount, type, is_active, expired_at) 
            VALUES (?, ?, ?, 1, ?)`,
        [code, discount, type, expired_at]
    );
    return result.insertId;
};

module.exports = {
    findValidVoucher,
    createVoucher
};