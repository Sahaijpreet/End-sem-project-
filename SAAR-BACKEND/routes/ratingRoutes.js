import express from 'express';
import { rateResource, getResourceRating } from '../controllers/ratingController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/:resourceType/:resourceId', getResourceRating);
router.post('/:resourceType/:resourceId', protect, rateResource);

export default router;
