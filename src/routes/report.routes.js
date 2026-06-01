const express = require('express');
const router = express.Router();
const reportController = require('../controllers/report.controller');
const { verifyToken } = require('../middlewares/auth.middleware');
const { authorizeRoles } = require('../middlewares/role.middleware');

// Endpoint Dashboard Laporan (Hanya Admin)
router.get('/dashboard', verifyToken, authorizeRoles('admin'), reportController.getDashboardData);

module.exports = router;