import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const protect = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Not authorized, no token' });
  }
  try {
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select('-PasswordHash');
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'User not found' });
    }
    next();
  } catch {
    return res.status(401).json({ success: false, message: 'Not authorized, token failed' });
  }
};

export const adminCheck = (req, res, next) => {
  if (req.user && req.user.Role === 'Admin') {
    next();
  } else {
    res.status(403).json({ success: false, message: 'Not authorized as an admin' });
  }
};
