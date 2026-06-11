const express = require('express');
const router = express.Router();
const inventoryController = require('../controllers/inventory.controller');
const { verifyToken } = require('../middlewares/auth.middleware');
const { authorizeRoles } = require('../middlewares/role.middleware');

// Endpoint bahan baku
router.post('/ingredient', verifyToken, authorizeRoles('admin'), inventoryController.addIngredient);
router.get('/ingredient', verifyToken, authorizeRoles('admin', 'staff'), inventoryController.getIngredients);

// Endpoint resep
router.post('/recipe', verifyToken, authorizeRoles('admin'), inventoryController.addRecipe);

module.exports = router;