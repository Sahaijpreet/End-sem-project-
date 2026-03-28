import express from 'express';
import { uploadNote, getNotes, getNoteById } from '../controllers/noteController.js';
import { protect } from '../middleware/authMiddleware.js';
import upload from '../middleware/uploadMiddleware.js';

const router = express.Router();

// Public routes
router.get('/', getNotes);
router.get('/:id', getNoteById);

// Protected routes (requires login)
router.post('/', protect, upload.single('document'), uploadNote);

export default router;
