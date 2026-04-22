import express from 'express';
import { registerUser, loginUser, updateProfile, getMe, toggleBookmark, getBookmarks } from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';
import { handleImageUpload } from '../middleware/imageUploadMiddleware.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/me', protect, getMe);
router.patch('/profile', protect, handleImageUpload('avatar'), updateProfile);
router.get('/bookmarks', protect, getBookmarks);
router.post('/bookmarks/:resourceType/:resourceId', protect, toggleBookmark);

export default router;
