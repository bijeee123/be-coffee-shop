const express = require('express');
const router = express.Router();
const orderController = require('../controllers/order.controller');
const { verifyToken } = require('../middlewares/auth.middleware');
const { authorizeRoles } = require('../middlewares/role.middleware');

// Endpoint untuk Staff/Admin memproses pesanan
router.post('/', verifyToken, authorizeRoles('admin', 'staff'), orderController.createOrder);

// Endpoint Melihat Antrean & Histori (Bisa diakses Admin dan Staff)
router.get('/active', verifyToken, authorizeRoles('admin',  'staff'), orderController.getActive);
router.get('/history', verifyToken, authorizeRoles('admin',  'staff'), orderController.getHistory);

// Endpoint update status dan detail
router.get('/:id', verifyToken, authorizeRoles('admin',  'staff'), orderController.getDetail);
router.patch('/:id/status', verifyToken, authorizeRoles('admin',  'staff'), orderController.updateStatus);

module.exports = router;