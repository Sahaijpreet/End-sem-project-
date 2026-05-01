import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Storage Engine Configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Save files to the local /uploads directory we created during init
    cb(null, path.join(__dirname, '../uploads/'));
  },
  filename: function (req, file, cb) {
    // Create unique filename with original extension
    cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`);
  }
});

// Allow any file type for documents
const fileFilter = (req, file, cb) => cb(null, true);

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 25 * 1024 * 1024 // 25MB
  }
});

export default upload;
