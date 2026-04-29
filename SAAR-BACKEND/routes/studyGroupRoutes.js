import express from 'express';
import { createGroup, getGroups, joinGroup, leaveGroup, getGroupMessages, sendGroupMessage, getMyGroups } from '../controllers/studyGroupController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', protect, getGroups);
router.get('/mine', protect, getMyGroups);
router.post('/', protect, createGroup);
router.post('/:id/join', protect, joinGroup);
router.post('/:id/leave', protect, leaveGroup);
router.get('/:id/messages', protect, getGroupMessages);
router.post('/:id/messages', protect, sendGroupMessage);

export default router;
