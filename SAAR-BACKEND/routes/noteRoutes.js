import express from 'express';
import { uploadNote, getNotes, getNoteById, toggleLike } from '../controllers/noteController.js';
import { protect } from '../middleware/authMiddleware.js';
import upload from '../middleware/uploadMiddleware.js';
import imageUpload from '../middleware/imageUploadMiddleware.js';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Mixed upload: document (PDF) + cover (image)
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, '../uploads/')),
  filename: (req, file, cb) => cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`),
});
const mixedUpload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
}).fields([{ name: 'document', maxCount: 1 }, { name: 'cover', maxCount: 1 }]);

const router = express.Router();

router.get('/', getNotes);
router.get('/:id', getNoteById);
router.post('/', protect, mixedUpload, uploadNote);
router.post('/:id/like', protect, toggleLike);

export default router;
