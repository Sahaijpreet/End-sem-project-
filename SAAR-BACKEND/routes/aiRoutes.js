import express from 'express';
import { summarizeNote, summarizeUpload } from '../controllers/aiController.js';
import { protect } from '../middleware/authMiddleware.js';
import upload from '../middleware/uploadMiddleware.js';

const router = express.Router();

router.post('/summarize/:noteId', protect, summarizeNote);
router.post('/summarize-upload', protect, upload.single('document'), summarizeUpload);

export default router;
