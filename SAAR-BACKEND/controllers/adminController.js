import User from '../models/User.js';
import Note from '../models/Note.js';
import Book from '../models/Book.js';
import ExchangeRequest from '../models/ExchangeRequest.js';

// Get high-level platform stats
export const getStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({});
    const totalNotes = await Note.countDocuments({});
    const totalBooks = await Book.countDocuments({});

    const latestNotes = await Note.find()
      .populate('UploaderID', 'Name')
      .sort('-UploadDate')
      .limit(5);

    res.status(200).json({
      success: true,
      data: {
        totalUsers,
        totalNotes,
        totalBooks,
        latestNotes
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Admin Moderation: Delete a Note
export const deleteNote = async (req, res) => {
  try {
    const note = await Note.findByIdAndDelete(req.params.id);
    
    if (!note) {
      return res.status(404).json({ success: false, message: 'Note not found' });
    }
    
    // In a production app, we would also delete the file from the /uploads folder here using fs.unlinkSync
    
    res.status(200).json({ success: true, message: 'Note deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const listUsers = async (req, res) => {
  try {
    const users = await User.find()
      .select('-PasswordHash')
      .sort('-createdAt')
      .limit(200);
    res.status(200).json({ success: true, count: users.length, data: users });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const listAllNotes = async (req, res) => {
  try {
    const notes = await Note.find()
      .populate('UploaderID', 'Name')
      .sort('-createdAt');
    res.status(200).json({ success: true, data: notes });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const listAllBooks = async (req, res) => {
  try {
    const books = await Book.find()
      .populate('OwnerID', 'Name')
      .sort('-createdAt');
    res.status(200).json({ success: true, data: books });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteBook = async (req, res) => {
  try {
    const book = await Book.findByIdAndDelete(req.params.id);
    if (!book) return res.status(404).json({ success: false, message: 'Book not found' });
    res.status(200).json({ success: true, message: 'Book deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
