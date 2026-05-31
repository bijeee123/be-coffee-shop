const http = require('http');
const app = require('./app');
const { Server } = require('socket.io');
require('dotenv').config();

const PORT = process.env.PORT || 5000;

// Inisialisasi HTTP server menggunakan Express
const server = http.createServer(app);

// Inisialisasi Socket.io
const io = new Server(server, {
    cors: {
        origin: '*', 
        methods: ['GET', 'POST']
    }
});

// Event listener koneksi Socket.io
io.on('connection', (socket) => {
    console.log(`Client terhubung: ${socket.id}`);

    socket.on('disconnect', () => {
        console.log(`Client terputus: ${socket.id}`);
    });
});

// Menyimpan instance io ke Express agar bisa diakses di folder controller/service
app.set('io', io);

// Menjalankan server
server.listen(PORT, () => {
    console.log(`Server berjalan di port ${PORT}`);
});