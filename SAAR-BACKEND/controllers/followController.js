import Follow from '../models/Follow.js';
import User from '../models/User.js';
import Note from '../models/Note.js';
import { createNotification } from './notificationController.js';

export const getPublicProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-PasswordHash -Bookmarks');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    const [notes, followersCount, followingCount] = await Promise.all([
      Note.find({ UploaderID: user._id }).select('Title Subject Semester Downloads CoverImage').sort('-createdAt').limit(20),
      Follow.countDocuments({ FollowingID: user._id }),
      Follow.countDocuments({ FollowerID: user._id }),
    ]);
    let isFollowing = false;
    if (req.user) {
      isFollowing = !!(await Follow.findOne({ FollowerID: req.user._id, FollowingID: user._id }));
    }
    res.json({ success: true, data: { user, notes, followersCount, followingCount, isFollowing } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const toggleFollow = async (req, res) => {
  try {
    if (req.params.id === req.user._id.toString())
      return res.status(400).json({ success: false, message: 'Cannot follow yourself' });
    const existing = await Follow.findOne({ FollowerID: req.user._id, FollowingID: req.params.id });
    if (existing) {
      await existing.deleteOne();
      return res.json({ success: true, data: { following: false } });
    }
    await Follow.create({ FollowerID: req.user._id, FollowingID: req.params.id });
    await createNotification(req.params.id, 'new_follower', `${req.user.Name} started following you`, `/user/${req.user._id}`);
    res.json({ success: true, data: { following: true } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getFollowers = async (req, res) => {
  try {
    const follows = await Follow.find({ FollowingID: req.params.id }).populate('FollowerID', 'Name Avatar Branch Year');
    res.json({ success: true, data: follows.map((f) => f.FollowerID) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getFollowing = async (req, res) => {
  try {
    const follows = await Follow.find({ FollowerID: req.params.id }).populate('FollowingID', 'Name Avatar Branch Year');
    res.json({ success: true, data: follows.map((f) => f.FollowingID) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
