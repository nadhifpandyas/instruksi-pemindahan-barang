const multer = require('multer');

// Use Memory Storage for Vercel (Files are kept in memory, not written to disk)
const storage = multer.memoryStorage();

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 } // Limit 5MB
});

module.exports = upload;
