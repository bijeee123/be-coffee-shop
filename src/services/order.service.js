const db = require('../config/db');
const orderModel = require('../models/order.model');
const voucherModel = require('../models/voucher.model');


const processNewOrder = async (userId, items, paymentMethod, customerId = null, voucherCode = null) => {
    const connection = await db.getConnection();

    try {
        await connection.beginTransaction();

        let totalPrice = 0;
        const processedItems = [];

        // 1. Validasi Menu & Hitung Harga
        for (const item of items) {
            // Pengaman: support baik menu_id maupun id biasa
            const menuId = item.menu_id || item.id;

            // Pengaman: support 'quantity' maupun 'qty'
            const itemQty = parseInt(item.quantity || item.qty || 0);

            if (itemQty <= 0) {
                throw new Error(`Jumlah pesanan (quantity) untuk menu ID ${menuId} tidak valid.`);
            }

            const menu = await orderModel.getMenuPrice(menuId, connection);
            if (!menu) {
                throw new Error(`Menu dengan ID ${menuId} tidak ditemukan atau sedang tidak tersedia.`);
            }

            // Memastikan menu.price diconvert ke angka agar tidak memicu NaN
            const menuPrice = parseFloat(menu.price);
            if (isNaN(menuPrice)) {
                throw new Error(`Harga untuk menu ${menu.name} di database tidak valid.`);
            }

            const subtotal = menuPrice * itemQty;
            totalPrice += subtotal;

            processedItems.push({
                menu_id: menuId,
                name: menu.name,
                qty: itemQty,
                price: menuPrice
            });
        }

        let finalPrice = totalPrice;
        let voucherId = null;

        if (voucherCode) {
            // Ambil data voucher yang valid & belum expired dari DB
            const voucher = await voucherModel.findValidVoucher(voucherCode);
            if (!voucher) {
                throw new Error('Voucher tidak valid, sudah kedaluwarsa, atau tidak aktif.');
            }

            voucherId = voucher.id;
            const discountValue = parseFloat(voucher.discount);

            // Hitung potongan berdasarkan tipe ('percentage' atau 'fixed')
            if (voucher.type === 'percentage') {
                const discountAmount = (totalPrice * discountValue) / 100;
                finalPrice = totalPrice - discountAmount;
            } else if (voucher.type === 'fixed') {
                finalPrice = totalPrice - discountValue;
            }

            // Pengaman: Biar total pembayaran akhir tidak minus/negatif
            if (finalPrice < 0) finalPrice = 0;
        }

        // 2. Buat Order Utama
        const paymentStatus = paymentMethod === 'cash' ? 'paid' : 'unpaid';
        const orderId = await orderModel.createOrder({
            user_id: userId,
            customer_id: customerId,
            voucher_id: voucherId,
            total_price: totalPrice,
            final_price: finalPrice, 
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
                const requiredQty = parseFloat(recipe.qty) * pItem.qty;

                // Ambil data stok saat ini (dan kunci datanya sementara)
                const ingredient = await orderModel.getIngredientForUpdate(recipe.ingredient_id, connection);

                if (!ingredient) {
                    throw new Error(`Bahan baku dengan ID ${recipe.ingredient_id} tidak ditemukan.`);
                }

                const currentStock = parseFloat(ingredient.stock);

                if (currentStock < requiredQty) {
                    throw new Error(`Stok ${ingredient.name} tidak mencukupi! Sisa stok: ${currentStock}, dibutuhkan: ${requiredQty}.`);
                }

                // Kurangi stok dan simpan
                const newStock = currentStock - requiredQty;
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
            finalPrice,
            paymentStatus,
            items: processedItems
        };

    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
};

module.exports = {
    processNewOrder
};