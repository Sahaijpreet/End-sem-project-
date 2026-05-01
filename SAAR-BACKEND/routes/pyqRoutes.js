import express from 'express';
import { uploadPYQ, getPYQs, togglePYQLike, trackPYQDownload, deletePYQ } from '../controllers/pyqController.js';
import { protect } from '../middleware/authMiddleware.js';
import upload from '../middleware/uploadMiddleware.js';

const router = express.Router();

router.get('/', getPYQs);
router.post('/', protect, upload.single('document'), uploadPYQ);
router.post('/:id/like', protect, togglePYQLike);
router.post('/:id/download', trackPYQDownload);
router.delete('/:id', protect, deletePYQ);

export default router;
