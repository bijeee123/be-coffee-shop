const jwt = require('jsonwebtoken');
require('dotenv').config();

const verifyToken = (req, res, next) => {
    let token;

    // Memeriksa apakah token dikirim melalui header Authorization (format: Bearer <token>)
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
        return res.status(401).json({ success: false, message: 'Akses ditolak. Token tidak ditemukan.' });
    }

    try {
        // Verifikasi token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Menyisipkan data user dari token ke dalam request object
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(403).json({ success: false, message: 'Sesi tidak valid atau telah kedaluwarsa.' });
    }
};

module.exports = {
    verifyToken
};