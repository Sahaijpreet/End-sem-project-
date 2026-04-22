import express from 'express';
import { getStats, deleteNote, listUsers, listAllNotes, listAllBooks, deleteBook, listAllPYQs, deletePYQ, deleteUser } from '../controllers/adminController.js';
import { protect, adminCheck } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect, adminCheck);

router.get('/stats', getStats);
router.get('/users', listUsers);
router.delete('/users/:id', deleteUser);
router.get('/notes', listAllNotes);
router.delete('/notes/:id', deleteNote);
router.get('/books', listAllBooks);
router.delete('/books/:id', deleteBook);
router.get('/pyqs', listAllPYQs);
router.delete('/pyqs/:id', deletePYQ);

export default router;
