import express from 'express';
import { summarizeNote } from '../controllers/aiController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Protected route (requires login to use AI features)
router.post('/summarize/:noteId', protect, summarizeNote);

export default router;
