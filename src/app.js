const express = require('express');
const path = require('path');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require("./routes/auth.routes");
const menuRoutes = require("./routes/menu.routes");
const inventoryRoutes = require('./routes/inventory.routes');
const orderRoutes = require('./routes/order.routes');
const reportRoutes = require('./routes/report.routes');

const loyaltyController = require('./controllers/loyalty.controller');
const voucherController = require('./controllers/voucher.controller'); // <-- 1. Import voucher controller baru

const { verifyToken } = require('./middlewares/auth.middleware');
const { authorizeRoles } = require('./middlewares/role.middleware');

const app = express();

// Middleware Global
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
app.use(express.urlencoded({ extended: true }));

// Endpoint uji coba awal
app.get('/', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Smart Coffee Shop API is running'
    });
});

app.use('/api/auth', authRoutes);
app.use('/api/menu', menuRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/order', orderRoutes);
app.use('/api/report', reportRoutes);
app.post('/api/loyalty/redeem', loyaltyController.redeemPoints);

// 2. ENDPOINT BARU: Tambah Voucher (Hanya bisa diakses Admin dan Owner)
app.post('/api/vouchers', verifyToken, authorizeRoles('admin', 'owner'), voucherController.addVoucher);

module.exports = app;