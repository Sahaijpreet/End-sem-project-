import express from 'express';
import { getTimetable, saveTimetable } from '../controllers/timetableController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();
router.get('/', protect, getTimetable);
router.put('/', protect, saveTimetable);
export default router;
