const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 3308,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Verifikasi koneksi ke MySQL
pool.getConnection()
    .then(connection => {
        console.log('Koneksi ke database MySQL berhasil.');
        connection.release();
    })
    .catch(error => {
        console.error('Gagal terhubung ke database:', error.message);
    });

module.exports = pool;