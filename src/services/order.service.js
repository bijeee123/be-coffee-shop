const db = require('../config/db');
const orderModel = require('../models/order.model');

const processNewOrder = async (userId, items, paymentMethod) => {
    const connection = await db.getConnection(); 
    
    try {
        await connection.beginTransaction(); 

        let totalPrice = 0;
        const processedItems = [];

        // 1. Validasi Menu & Hitung Harga
        for (const item of items) {
            const menu = await orderModel.getMenuPrice(item.menu_id, connection);
            if (!menu) {
                throw new Error(`Menu dengan ID ${item.menu_id} tidak ditemukan atau sedang tidak tersedia.`);
            }
            
            const subtotal = menu.price * item.qty;
            totalPrice += subtotal;

            processedItems.push({
                menu_id: item.menu_id,
                name: menu.name,
                qty: item.qty,
                price: menu.price
            });
        }

        // 2. Buat Order Utama
        const paymentStatus = paymentMethod === 'cash' ? 'paid' : 'unpaid';
        const orderId = await orderModel.createOrder({
            user_id: userId,
            total_price: totalPrice,
            final_price: totalPrice,
            payment_status: paymentStatus,
            payment_method: paymentMethod
        }, connection);

        // 3. Masukkan Order Items & POTONG STOK BAHAN BAKU
        for (const pItem of processedItems) {
            // Masukkan ke tabel order_items
            await orderModel.addOrderItem({
                order_id: orderId,
                menu_id: pItem.menu_id,
                qty: pItem.qty,
                price: pItem.price
            }, connection);

            // Cek resep untuk menu ini
            const recipes = await orderModel.getRecipeByMenuId(pItem.menu_id, connection);
            
            for (const recipe of recipes) {
                // Total bahan yang dibutuhkan = takaran resep x jumlah kopi yang dipesan
                const requiredQty = recipe.qty * pItem.qty;

                // Ambil data stok saat ini (dan kunci datanya sementara)
                const ingredient = await orderModel.getIngredientForUpdate(recipe.ingredient_id, connection);
                
                if (!ingredient) {
                    throw new Error(`Bahan baku dengan ID ${recipe.ingredient_id} tidak ditemukan.`);
                }

                if (ingredient.stock < requiredQty) {
                    throw new Error(`Stok ${ingredient.name} tidak mencukupi! Sisa stok: ${ingredient.stock}, dibutuhkan: ${requiredQty}.`);
                }

                // Kurangi stok dan simpan
                const newStock = ingredient.stock - requiredQty;
                await orderModel.updateIngredientStock(recipe.ingredient_id, newStock, connection);

                // Catat di log bahwa stok keluar karena order ini
                const reason = `Terjual - Order ID #${orderId}`;
                await orderModel.addStockLog(recipe.ingredient_id, requiredQty, reason, connection);
            }
        }

        await connection.commit(); 
        
        return { 
            orderId, 
            totalPrice, 
            paymentStatus,
            items: processedItems
        };

    } catch (error) {
        await connection.rollback(); 
        throw error; // Lempar pesan error ke controller (misal: "Stok tidak mencukupi")
    } finally {
        connection.release(); 
    }
};

module.exports = {
    processNewOrder
};