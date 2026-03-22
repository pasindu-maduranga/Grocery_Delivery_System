const multer = require('multer');
const path = require('path');

// Use memory storage — we upload buffer directly to Cloudinary
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowed = /jpeg|jpg|png|pdf/;
  const ext = allowed.test(path.extname(file.originalname).toLowerCase());
  const mime = /jpeg|jpg|png|pdf|application\/pdf/.test(file.mimetype);
  if (ext && mime) cb(null, true);
  else cb(new Error(`File type not allowed: ${file.originalname}`));
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

module.exports = upload;
