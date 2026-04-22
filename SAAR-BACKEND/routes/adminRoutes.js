import express from 'express';
import { getStats, deleteNote, listUsers, listAllNotes, listAllBooks, deleteBook } from '../controllers/adminController.js';
import { protect, adminCheck } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect, adminCheck);

router.get('/stats', getStats);
router.get('/users', listUsers);
router.get('/notes', listAllNotes);
router.delete('/notes/:id', deleteNote);
router.get('/books', listAllBooks);
router.delete('/books/:id', deleteBook);

export default router;
