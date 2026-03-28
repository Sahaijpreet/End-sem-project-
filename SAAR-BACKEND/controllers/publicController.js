import User from '../models/User.js';
import Note from '../models/Note.js';
import Book from '../models/Book.js';

export const getPublicStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({});
    const totalNotes = await Note.countDocuments({});
    const totalBooks = await Book.countDocuments({});

    res.status(200).json({
      success: true,
      data: {
        totalUsers,
        totalNotes,
        totalBooks,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
