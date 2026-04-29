import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { getPublicProfile, toggleFollow, getFollowers, getFollowing } from '../controllers/followController.js';
import { protect } from '../middleware/authMiddleware.js';

// Attach user if token present, but don't block if not
const optionalAuth = async (req, res, next) => {
  try {
    const auth = req.headers.authorization;
    if (auth?.startsWith('Bearer ')) {
      const token = auth.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select('-PasswordHash');
    }
  } catch {}
  next();
};

const router = express.Router();

router.get('/:id', protect, getPublicProfile);
router.post('/:id/follow', protect, toggleFollow);
router.get('/:id/followers', protect, getFollowers);
router.get('/:id/following', protect, getFollowing);

export default router;
