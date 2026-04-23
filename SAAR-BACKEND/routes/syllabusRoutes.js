import express from 'express';
import { getSyllabi, upsertSyllabus, toggleTopic, deleteSyllabus } from '../controllers/syllabusController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();
router.get('/', protect, getSyllabi);
router.post('/', protect, upsertSyllabus);
router.patch('/:id/topics/:topicId', protect, toggleTopic);
router.delete('/:id', protect, deleteSyllabus);
export default router;
