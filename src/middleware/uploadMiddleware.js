const multer = require('multer');
module.exports = multer({ storage: multer.memoryStorage(), limits: { fileSize: 2 * 1024 * 1024, files: 1, fields: 8, fieldSize: 1000 }, fileFilter: (_req, file, cb) => cb(null, ['image/png','image/jpeg','image/webp'].includes(file.mimetype)) });
