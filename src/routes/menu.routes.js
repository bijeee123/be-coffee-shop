const express = require('express');
const router = express.Router();
const menuController = require('../controllers/menu.controller');
const { verifyToken } = require('../middlewares/auth.middleware');
const { authorizeRoles } = require('../middlewares/role.middleware');

// Endpoint untuk melihat menu (Semua user yang sudah login bisa akses)
router.get('/', verifyToken, menuController.getMenus);

// Endpoint untuk tambah menu (Hanya Admin yang bisa akses)
router.post('/', verifyToken, authorizeRoles('admin'), menuController.addMenu);

module.exports = router;