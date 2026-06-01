const express = require('express');
const router = express.Router();
const orderController = require('../controllers/order.controller');
const { verifyToken } = require('../middlewares/auth.middleware');
const { authorizeRoles } = require('../middlewares/role.middleware');

// Endpoint untuk kasir/admin memproses pesanan
router.post('/', verifyToken, authorizeRoles('admin', 'cashier'), orderController.createOrder);

// Endpoint Melihat Antrean & Histori (Bisa diakses Admin, Barista, dan Kasir)
router.get('/active', verifyToken, authorizeRoles('admin', 'barista', 'cashier'), orderController.getActive);
router.get('/history', verifyToken, authorizeRoles('admin', 'barista', 'cashier'), orderController.getHistory);

// Endpoint update status dan detail
router.get('/:id', verifyToken, authorizeRoles('admin', 'barista', 'cashier'), orderController.getDetail);
router.patch('/:id/status', verifyToken, authorizeRoles('admin', 'barista'), orderController.updateStatus);

module.exports = router;