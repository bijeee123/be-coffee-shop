const express = require('express');
const path = require('path');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require("./routes/auth.routes")
const menuRoutes = require("./routes/menu.routes")
const inventoryRoutes = require('./routes/inventory.routes');
const orderRoutes = require('./routes/order.routes');
const reportRoutes = require('./routes/report.routes');

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

app.use('/api/auth',authRoutes);
app.use('/api/menu',menuRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/order',orderRoutes);
app.use('/api/report',reportRoutes);

module.exports = app;