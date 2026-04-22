import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';

const generateToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });

export const registerUser = async (req, res) => {
  try {
    const { Name, Email, Password, CollegeID } = req.body;
    if (await User.findOne({ Email })) {
      return res.status(400).json({ success: false, message: 'User already exists' });
    }
    const salt = await bcrypt.genSalt(10);
    const PasswordHash = await bcrypt.hash(Password, salt);
    const user = await User.create({ Name, Email, PasswordHash, Role: 'Student', CollegeID });
    if (user) {
      res.status(201).json({
        success: true,
        data: { _id: user._id, Name: user.Name, Email: user.Email, Role: user.Role, token: generateToken(user._id) },
      });
    } else {
      res.status(400).json({ success: false, message: 'Invalid user data' });
    }
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
        data: { _id: user._id, Name: user.Name, Email: user.Email, Role: user.Role, token: generateToken(user._id) },
      });
    } else {
      res.status(401).json({ success: false, message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { Name, CollegeID, Bio, Branch, Year } = req.body;
    const updates = {};
    if (Name) updates.Name = Name;
    if (CollegeID !== undefined) updates.CollegeID = CollegeID;
    if (Bio !== undefined) updates.Bio = Bio;
    if (Branch !== undefined) updates.Branch = Branch;
    if (Year !== undefined) updates.Year = Year || null;
    if (req.file) updates.Avatar = `/uploads/${req.file.filename}`;
    const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true, runValidators: true }).select('-PasswordHash');
    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-PasswordHash');
    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const toggleBookmark = async (req, res) => {
  try {
    const { resourceType, resourceId } = req.params;
    const user = await User.findById(req.user._id);
    const idx = user.Bookmarks.findIndex(
      (b) => b.ResourceType === resourceType && b.ResourceID.toString() === resourceId
    );
    if (idx === -1) {
      user.Bookmarks.push({ ResourceType: resourceType, ResourceID: resourceId });
    } else {
      user.Bookmarks.splice(idx, 1);
    }
    await user.save();
    res.json({ success: true, data: { bookmarked: idx === -1, count: user.Bookmarks.length } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getBookmarks = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('Bookmarks');
    const noteIds = user.Bookmarks.filter((b) => b.ResourceType === 'Note').map((b) => b.ResourceID);
    const pyqIds = user.Bookmarks.filter((b) => b.ResourceType === 'PYQ').map((b) => b.ResourceID);
    const [{ default: Note }, { default: PYQ }] = await Promise.all([
      import('../models/Note.js'),
      import('../models/PYQ.js'),
    ]);
    const [notes, pyqs] = await Promise.all([
      Note.find({ _id: { $in: noteIds } }).populate('UploaderID', 'Name').select('Title Subject Semester CoverImage Likes Downloads'),
      PYQ.find({ _id: { $in: pyqIds } }).populate('UploaderID', 'Name').select('Title Subject Semester Year ExamType Likes Downloads'),
    ]);
    res.json({ success: true, data: { notes, pyqs } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
