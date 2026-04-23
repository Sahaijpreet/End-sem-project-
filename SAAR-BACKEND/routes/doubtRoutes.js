import express from 'express';
import { createDoubt, getDoubts, getDoubtById, addAnswer, upvoteAnswer, acceptAnswer, deleteDoubt } from '../controllers/doubtController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', getDoubts);
router.post('/', protect, createDoubt);
router.get('/:id', getDoubtById);
router.delete('/:id', protect, deleteDoubt);
router.post('/:id/answers', protect, addAnswer);
router.post('/:id/answers/:answerId/upvote', protect, upvoteAnswer);
router.post('/:id/answers/:answerId/accept', protect, acceptAnswer);

export default router;
