import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

export const registerUser = async (req, res) => {
  try {
    const { Name, Email, Password, CollegeID } = req.body;

    const userExists = await User.findOne({ Email });

    if (userExists) {
      return res.status(400).json({ success: false, message: 'User already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const PasswordHash = await bcrypt.hash(Password, salt);

    const user = await User.create({
      Name,
      Email,
      PasswordHash,
      Role: 'Student',
      CollegeID
    });

    if (user) {
      res.status(201).json({
        success: true,
        data: {
          _id: user._id,
          Name: user.Name,
          Email: user.Email,
          Role: user.Role,
          token: generateToken(user._id),
        }
      });
    } else {
      res.status(400).json({ success: false, message: 'Invalid user data' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { Name, CollegeID } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { ...(Name && { Name }), ...(CollegeID !== undefined && { CollegeID }) },
      { new: true, runValidators: true }
    ).select('-PasswordHash');
    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


export const loginUser = async (req, res) => {
  try {
    const { Email, Password } = req.body;
    const emailTrim = (Email || '').trim();
    const escaped = emailTrim.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const user = await User.findOne({
      Email: { $regex: new RegExp(`^${escaped}$`, 'i') },
    }).select('+PasswordHash');

    if (user && (await bcrypt.compare(Password, user.PasswordHash))) {
      res.json({
        success: true,
        data: {
          _id: user._id,
          Name: user.Name,
          Email: user.Email,
          Role: user.Role,
          token: generateToken(user._id),
        }
      });
    } else {
      res.status(401).json({ success: false, message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
