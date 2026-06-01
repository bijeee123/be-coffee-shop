const reportModel = require('../models/report.model');

const getDashboardData = async (req, res) => {
    try {
        // jalanin aja semua biar cepet
        const [summary, topProducts, lowStock, chartData] = await Promise.all([
            reportModel.getTodaySummary(),
            reportModel.getTopProducts(),
            reportModel.getLowStockAlert(),
            reportModel.getSalesChartData()
        ]);

        res.status(200).json({
            success: true,
            message: 'Data dashboard berhasil diambil',
            data: {
                summary,
                chartData,
                topProducts,
                lowStock
            }
        });
    } catch (error) {
        console.error('Error getDashboardData:', error);
        res.status(500).json({ success: false, message: 'Gagal mengambil data dashboard.' });
    }
};

module.exports = {
    getDashboardData
};