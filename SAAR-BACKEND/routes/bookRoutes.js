import express from 'express';
import { listBook, getAvailableBooks, requestExchange, getMyRequests, respondToRequest } from '../controllers/bookController.js';
import { protect } from '../middleware/authMiddleware.js';
import imageUpload from '../middleware/imageUploadMiddleware.js';

const router = express.Router();

router.get('/', getAvailableBooks);
router.post('/', protect, imageUpload.single('cover'), listBook);
router.post('/request/:id', protect, requestExchange);
router.get('/my-requests', protect, getMyRequests);
router.patch('/respond/:id', protect, respondToRequest);

export default router;
