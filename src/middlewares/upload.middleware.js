const multer = require('multer');
const path = require('path');

// Pengaturan tempat simpan dan nama file
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); // Simpan di folder uploads
    },
    filename: (req, file, cb) => {
        // Mengubah nama file menjadi: menu-timestamp.jpg
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

// Filter format file (Hanya boleh JPG, JPEG, PNG)
const fileFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (extname && mimetype) {
        return cb(null, true);
    } else {
        cb(new Error('Hanya diperbolehkan mengupload file gambar (JPG/JPEG/PNG)!'));
    }
};

const upload = multer({
    storage: storage,
    limits: { fileSize: 2 * 1024 * 1024 }, // Batasi ukuran maksimal 2MB 
    fileFilter: fileFilter
});

module.exports = upload;