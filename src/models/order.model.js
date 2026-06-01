const db = require('../config/db');

const getMenuPrice = async (menu_id, connection) => {
    const [rows] = await connection.query('SELECT price, name FROM menus WHERE id = ? AND is_available = TRUE', [menu_id]);
    return rows.length ? rows[0] : null;
};

const createOrder = async (orderData, connection) => {
    const { user_id, total_price, final_price, payment_status, payment_method } = orderData;
    const [result] = await connection.query(
        'INSERT INTO orders (user_id, total_price, final_price, payment_status, payment_method) VALUES (?, ?, ?, ?, ?)',
        [user_id, total_price, final_price, payment_status, payment_method]
    );
    return result.insertId;
};

const addOrderItem = async (itemData, connection) => {
    const { order_id, menu_id, qty, price } = itemData;
    await connection.query(
        'INSERT INTO order_items (order_id, menu_id, qty, price) VALUES (?, ?, ?, ?)',
        [order_id, menu_id, qty, price]
    );
};

// --- FUNGSI BARU UNTUK INVENTORY ---

// Mengambil resep dari suatu menu
const getRecipeByMenuId = async (menu_id, connection) => {
    const [rows] = await connection.query('SELECT ingredient_id, qty FROM recipes WHERE menu_id = ?', [menu_id]);
    return rows;
};

// Mengambil bahan baku sekaligus MENGUNCI baris tersebut (FOR UPDATE) selama transaksi
const getIngredientForUpdate = async (ingredient_id, connection) => {
    const [rows] = await connection.query('SELECT name, stock FROM ingredients WHERE id = ? FOR UPDATE', [ingredient_id]);
    return rows.length ? rows[0] : null;
};

// Mengurangi stok bahan baku
const updateIngredientStock = async (ingredient_id, new_stock, connection) => {
    await connection.query('UPDATE ingredients SET stock = ? WHERE id = ?', [new_stock, ingredient_id]);
};

// Mencatat log stok keluar
const addStockLog = async (ingredient_id, qty, reason, connection) => {
    await connection.query(
        'INSERT INTO stock_logs (ingredient_id, type, qty, reason) VALUES (?, "out", ?, ?)',
        [ingredient_id, qty, reason]
    );
};

const updateOrderStatus = async (order_id, status) => {
    const [result] = await db.query('UPDATE orders SET status = ? WHERE id = ?', [status, order_id]);
    return result.affectedRows;
}

// dapat pesanan yang aktif ( barista )
const getActiveOrders = async () => {
    // Mengurutkan dari yang paling lama dibuat (ASC) agar antrean adil
    const [rows] = await db.query(
        'SELECT * FROM orders WHERE status IN ("pending", "processing", "ready") ORDER BY created_at ASC'
    );
    return rows;
};

// dapat histori yang selesai/batal
const getOrderHistory = async () => {
    // Mengurutkan dari yang paling baru selesai (DESC)
    const [rows] = await db.query(
        'SELECT * FROM orders WHERE status IN ("completed", "cancelled") ORDER BY created_at DESC'
    );
    return rows;
};

// dapet detail struk pesanan by id
const getOrderDetails = async (orderId) => {
    // Ambil data utama order
    const [orders] = await db.query('SELECT * FROM orders WHERE id = ?', [orderId]);
    if (orders.length === 0) return null;

    // Ambil detail item dan join dengan tabel menus untuk mendapatkan nama kopi
    const [items] = await db.query(
        `SELECT oi.*, m.name as menu_name 
        FROM order_items oi 
        JOIN menus m ON oi.menu_id = m.id 
        WHERE oi.order_id = ?`,
        [orderId]
    );

    // Gabungkan data utama dengan item-itemnya
    return { ...orders[0], items };
};

module.exports = {
    getMenuPrice,
    createOrder,
    addOrderItem,
    getRecipeByMenuId,
    getIngredientForUpdate,
    updateIngredientStock,
    addStockLog,
    updateOrderStatus,
    getActiveOrders,
    getOrderHistory,
    getOrderDetails
};