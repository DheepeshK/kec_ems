import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { config } from '../config/index.js';

const logosDir = path.join(config.uploadDir, 'logos');
const csvDir = path.join(config.uploadDir, 'csv');

fs.mkdirSync(logosDir, { recursive: true });
fs.mkdirSync(csvDir, { recursive: true });

const logoStorage = multer.diskStorage({
  destination: logosDir,
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `logo-${Date.now()}${ext}`);
  },
});

const csvStorage = multer.diskStorage({
  destination: csvDir,
  filename: (_req, file, cb) => {
    cb(null, `import-${Date.now()}.csv`);
  },
});

export const uploadLogo = multer({
  storage: logoStorage,
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/jpg'];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only JPEG and PNG images are allowed'));
    }
  },
});

export const uploadCsv = multer({
  storage: csvStorage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype === 'text/csv' || file.originalname.endsWith('.csv')) {
      cb(null, true);
    } else {
      cb(new Error('Only CSV files are allowed'));
    }
  },
});
