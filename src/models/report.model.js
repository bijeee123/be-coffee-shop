const db = require('../config/db');

// 1. Dapatkan Total Pendapatan & Cup Hari Ini
const getTodaySummary = async () => {
    const [rows] = await db.query(`
        SELECT 
            COUNT(DISTINCT o.id) as total_transactions,
            COALESCE(SUM(o.total_price), 0) as total_revenue,
            COALESCE(SUM(oi.qty), 0) as total_cups_sold 
        FROM orders o
        LEFT JOIN order_items oi ON o.id = oi.order_id
        WHERE DATE(o.created_at) = CURDATE() AND o.status = 'completed'
    `);
    return rows[0];
};

// 2. Dapatkan Menu Terlaris (Top 5)
const getTopProducts = async () => {
    const [rows] = await db.query(`
        SELECT 
            m.name, 
            SUM(oi.qty) as total_sold
        FROM order_items oi
        JOIN orders o ON oi.order_id = o.id
        JOIN menus m ON oi.menu_id = m.id
        WHERE o.status = 'completed'
        GROUP BY m.id, m.name
        ORDER BY total_sold DESC
        LIMIT 5
    `);
    return rows;
};

//  Dapatkan Bahan Baku yang Stoknya Menipis 
const getLowStockAlert = async () => {
    const [rows] = await db.query(`
        SELECT id, name, stock, unit 
        FROM ingredients 
        WHERE stock < 50  
        ORDER BY stock ASC
    `);
    return rows;
};

// Dapatkan Data untuk Grafik Penjualan (7 Hari Terakhir)
const getSalesChartData = async () => {
    const [rows] = await db.query(`
        SELECT 
            DATE(created_at) as date,
            SUM(total_price) as revenue
        FROM orders
        WHERE status = 'completed' AND created_at >= DATE(NOW()) - INTERVAL 7 DAY
        GROUP BY DATE(created_at)
        ORDER BY date ASC
    `);
    return rows;
};

module.exports = {
    getTodaySummary,
    getTopProducts,
    getLowStockAlert,
    getSalesChartData
};