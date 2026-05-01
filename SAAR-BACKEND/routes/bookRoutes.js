import express from 'express';
import { listBook, getAvailableBooks, requestExchange, getMyRequests, getMyOutgoingRequests, cancelRequest, respondToRequest, deleteBook } from '../controllers/bookController.js';
import { protect } from '../middleware/authMiddleware.js';
import { handleImageUpload } from '../middleware/imageUploadMiddleware.js';

const router = express.Router();

router.get('/', getAvailableBooks);
router.post('/', protect, handleImageUpload('cover'), listBook);
router.post('/request/:id', protect, requestExchange);
router.get('/my-requests', protect, getMyRequests);
router.get('/my-outgoing-requests', protect, getMyOutgoingRequests);
router.delete('/cancel-request/:id', protect, cancelRequest);
router.patch('/respond/:id', protect, respondToRequest);
router.delete('/:id', protect, deleteBook);

export default router;
