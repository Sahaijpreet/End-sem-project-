import express from 'express';
import { getStats, deleteNote, listUsers } from '../controllers/adminController.js';
import { protect, adminCheck } from '../middleware/authMiddleware.js';

const router = express.Router();

// ALL routes in this file are protected and require Admin privileges
router.use(protect, adminCheck);

router.get('/stats', getStats);
router.get('/users', listUsers);
router.delete('/notes/:id', deleteNote);

export default router;
