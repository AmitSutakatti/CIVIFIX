import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../uploads/'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  },
});

// File filter
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'));
  }
};

// Configure multer
export const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
  fileFilter: fileFilter,
});

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

export const uploadCertificate = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: certificateFilter,
});

