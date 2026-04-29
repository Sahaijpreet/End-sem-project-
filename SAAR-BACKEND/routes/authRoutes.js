import express from 'express';
import { registerUser, loginUser, forgotPassword, verifyOTP, resetPassword, verifyEmail, resendVerificationEmail, updateProfile, getMe, toggleBookmark, getBookmarks } from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';
import { handleImageUpload } from '../middleware/imageUploadMiddleware.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/verify-email', verifyEmail);
router.post('/resend-verification', resendVerificationEmail);
router.post('/forgot-password', forgotPassword);
router.post('/verify-otp', verifyOTP);
router.post('/reset-password', resetPassword);
router.get('/me', protect, getMe);
router.patch('/profile', protect, handleImageUpload('avatar'), updateProfile);
router.get('/bookmarks', protect, getBookmarks);
router.post('/bookmarks/:resourceType/:resourceId', protect, toggleBookmark);

export default router;
