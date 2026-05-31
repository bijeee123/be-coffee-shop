const express = require('express');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require("./routes/auth.routes")
const menuRoutes = require("./routes/menu.routes")
const inventoryRoutes = require('./routes/inventory.routes');

const app = express();

// Middleware Global
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Endpoint uji coba awal
app.get('/', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Smart Coffee Shop API is running'
    });
});

app.use('/api/auth',authRoutes);
app.use('/api/menu',menuRoutes);
app.use('/api/inventory', inventoryRoutes);

module.exports = app;