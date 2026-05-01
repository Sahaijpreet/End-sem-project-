import express from 'express';
import { uploadNote, getNotes, getNoteById, toggleLike, trackDownload, deleteNote } from '../controllers/noteController.js';
import { protect } from '../middleware/authMiddleware.js';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, '../uploads/')),
  filename: (req, file, cb) => cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`),
});
const mixedUpload = multer({
  storage,
  limits: { fileSize: 25 * 1024 * 1024 },
}).fields([{ name: 'document', maxCount: 1 }, { name: 'cover', maxCount: 1 }]);

const router = express.Router();

router.get('/', getNotes);
router.get('/:id', getNoteById);
router.post('/', protect, mixedUpload, uploadNote);
router.post('/:id/like', protect, toggleLike);
router.post('/:id/download', trackDownload);
router.delete('/:id', protect, deleteNote);

export default router;
