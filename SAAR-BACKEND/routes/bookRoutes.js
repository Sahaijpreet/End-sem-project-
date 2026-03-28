import express from 'express';
import { listBook, getAvailableBooks, requestExchange } from '../controllers/bookController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public route
router.get('/', getAvailableBooks);

// Protected routes (requires login)
router.post('/', protect, listBook);
router.post('/request/:id', protect, requestExchange);

export default router;
