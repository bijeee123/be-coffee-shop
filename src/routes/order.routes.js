const express = require('express');
const router = express.Router();
const orderController = require('../controllers/order.controller');
const { verifyToken } = require('../middlewares/auth.middleware');
const { authorizeRoles } = require('../middlewares/role.middleware');

// Endpoint untuk kasir/admin memproses pesanan
router.post('/', verifyToken, authorizeRoles('admin', 'cashier'), orderController.createOrder);

// Endpoint membuat pesanan
router.post('/', verifyToken, authorizeRoles('admin', 'cashier'), orderController.createOrder);

// Endpoint update status (Misal diakses oleh Barista)
router.patch('/:id/status', verifyToken, authorizeRoles('admin', 'barista'), orderController.updateStatus);

module.exports = router;