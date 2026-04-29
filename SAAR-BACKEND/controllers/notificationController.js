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
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    
    const notifications = await Notification.find({ UserID: req.user._id })
      .sort('-createdAt')
      .skip(skip)
      .limit(limit);
      
    const total = await Notification.countDocuments({ UserID: req.user._id });
    const unreadCount = await Notification.countDocuments({ UserID: req.user._id, Read: false });
    
    res.json({ 
      success: true, 
      data: notifications,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      },
      unreadCount
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    await Notification.findOneAndUpdate(
      { _id: id, UserID: req.user._id },
      { Read: true }
    );
    res.json({ success: true });
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

export const deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;
    await Notification.findOneAndDelete({ _id: id, UserID: req.user._id });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const clearAllNotifications = async (req, res) => {
  try {
    await Notification.deleteMany({ UserID: req.user._id });
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
