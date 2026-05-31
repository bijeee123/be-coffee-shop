const authorizeRoles = (...allowedRoles) => {
    return (req, res, next) => {
        // req.user didapatkan dari auth.middleware.js
        if (!req.user || !allowedRoles.includes(req.user.role)) {
            return res.status(403).json({ 
                success: false, 
                message: `Akses ditolak. Role '${req.user ? req.user.role : 'Unknown'}' tidak memiliki izin.` 
            });
        }
        next();
    };
};

module.exports = {
    authorizeRoles
};