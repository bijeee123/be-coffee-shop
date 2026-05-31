const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const userModel = require('../models/user.model');
require('dotenv').config();

const register = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        // Validasi input
        if (!name || !email || !password || !role) {
            return res.status(400).json({ message: 'Semua field wajib diisi.' });
        }

        // Pastikan role valid
        const validRoles = ['admin', 'cashier', 'barista', 'customer'];
        if (!validRoles.includes(role)) {
            return res.status(400).json({ message: 'Role tidak valid.' });
        }

        // Cek apakah email sudah terdaftar
        const existingUser = await userModel.getUserByEmail(email);
        if (existingUser) {
            return res.status(409).json({ message: 'Email sudah digunakan.' });
        }

        // Enkripsi password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Simpan data ke database
        const userId = await userModel.createUser({
            name,
            email,
            password: hashedPassword,
            role
        });

        res.status(201).json({
            success: true,
            message: 'Registrasi berhasil.',
            userId
        });
    } catch (error) {
        console.error('Error pada register:', error);
        res.status(500).json({ success: false, message: 'Terjadi kesalahan pada server.' });
    }
};

const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validasi input
        if (!email || !password) {
            return res.status(400).json({ message: 'Email dan password wajib diisi.' });
        }

        // Cari pengguna berdasarkan email
        const user = await userModel.getUserByEmail(email);
        if (!user) {
            return res.status(401).json({ message: 'Email atau password salah.' });
        }

        // Validasi password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Email atau password salah.' });
        }

        // Buat payload untuk JWT
        const payload = {
            id: user.id,
            role: user.role
        };

        // Generate Token
        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1d' });

        res.status(200).json({
            success: true,
            message: 'Login berhasil.',
            token,
            data: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        console.error('Error pada login:', error);
        res.status(500).json({ success: false, message: 'Terjadi kesalahan pada server.' });
    }
};

module.exports = {
    register,
    login
};