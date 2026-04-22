import express from 'express';
import { getOrCreateConversation, getMyConversations, getMessages, sendMessage, confirmExchange, getCompletedExchanges } from '../controllers/chatController.js';
import { protect, adminCheck } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/conversations', protect, getMyConversations);
router.get('/conversations/request/:requestId', protect, getOrCreateConversation);
router.get('/conversations/:id/messages', protect, getMessages);
router.post('/conversations/:id/messages', protect, sendMessage);
router.post('/conversations/:id/confirm', protect, confirmExchange);
router.get('/completed-exchanges', protect, adminCheck, getCompletedExchanges);

export default router;
