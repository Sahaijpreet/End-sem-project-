import express from 'express';
import { getComments, addComment, deleteComment } from '../controllers/commentController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/:resourceType/:resourceId', getComments);
router.post('/:resourceType/:resourceId', protect, addComment);
router.delete('/:id', protect, deleteComment);

export default router;
