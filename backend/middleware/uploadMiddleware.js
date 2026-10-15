import multer from 'multer';
import path from 'path';

const storage = multer.memoryStorage();

const imageFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  }
  cb(new Error('Only image files are allowed!'));
};

const certificateFilter = (req, file, cb) => {
  const allowed = /\.(jpeg|jpg|png|gif|webp|pdf)$/i;
  if (!allowed.test(file.originalname)) {
    return cb(new Error('Certificate must be a PDF or image (JPEG, PNG, GIF, WebP).'));
  }
  const mimeOk =
    /^(image\/(jpeg|png|gif|webp)|application\/pdf)/.test(file.mimetype) ||
    file.mimetype === 'application/octet-stream';
  if (mimeOk) {
    return cb(null, true);
  }
  cb(new Error('Certificate must be a PDF or image (JPEG, PNG, GIF, WebP).'));
};

const chatFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp|pdf|doc|docx/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype) || file.mimetype === 'application/octet-stream';
  if (extname && mimetype) {
    return cb(null, true);
  }
  cb(new Error('Invalid file type. Only images, PDF, and documents are allowed.'));
};

export const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: imageFilter,
});

export const uploadCertificate = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: certificateFilter,
});

export const uploadChat = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: chatFilter,
});
