import express from 'express';
import { uploadNote, getNotes, getNoteById, toggleLike } from '../controllers/noteController.js';
import { protect } from '../middleware/authMiddleware.js';
import upload from '../middleware/uploadMiddleware.js';

const router = express.Router();

router.get('/', getNotes);
router.get('/:id', getNoteById);
router.post('/', protect, upload.single('document'), uploadNote);
router.post('/:id/like', protect, toggleLike);

export default router;
