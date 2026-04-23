import express from 'express';
import { getPublicProfile, toggleFollow, getFollowers, getFollowing } from '../controllers/followController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/:id', (req, res, next) => {
  // optionally attach user if token present
  const auth = req.headers.authorization;
  if (auth?.startsWith('Bearer ')) {
    import('../middleware/authMiddleware.js').then(({ protect: p }) => p(req, res, next)).catch(() => next());
  } else next();
}, getPublicProfile);

router.post('/:id/follow', protect, toggleFollow);
router.get('/:id/followers', getFollowers);
router.get('/:id/following', getFollowing);

export default router;
