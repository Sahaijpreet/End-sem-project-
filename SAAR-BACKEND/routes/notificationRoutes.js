import express from 'express';
import { getMyNotifications, markAsRead, markAllRead, deleteNotification, clearAllNotifications, getUnreadCount } from '../controllers/notificationController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', protect, getMyNotifications);
router.get('/unread-count', protect, getUnreadCount);
router.patch('/:id/read', protect, markAsRead);
router.patch('/mark-all-read', protect, markAllRead);
router.delete('/:id', protect, deleteNotification);
router.delete('/', protect, clearAllNotifications);

export default router;
