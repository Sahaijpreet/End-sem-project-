import Notification from '../models/Notification.js';

export const createNotification = async (userId, type, message, link = '') => {
  try {
    await Notification.create({ UserID: userId, Type: type, Message: message, Link: link });
  } catch (err) {
    console.error('Notification creation failed:', err.message);
  }
};

export const getMyNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ UserID: req.user._id }).sort('-createdAt').limit(30);
    res.json({ success: true, data: notifications });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const markAllRead = async (req, res) => {
  try {
    await Notification.updateMany({ UserID: req.user._id, Read: false }, { Read: true });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getUnreadCount = async (req, res) => {
  try {
    const count = await Notification.countDocuments({ UserID: req.user._id, Read: false });
    res.json({ success: true, data: { count } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
