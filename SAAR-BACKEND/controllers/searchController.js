import Note from '../models/Note.js';
import PYQ from '../models/PYQ.js';
import Book from '../models/Book.js';

export const globalSearch = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q?.trim()) return res.json({ success: true, data: { notes: [], pyqs: [], books: [] } });
    const regex = new RegExp(q.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
    const [notes, pyqs, books] = await Promise.all([
      Note.find({ $or: [{ Title: regex }, { Subject: regex }] })
        .populate('UploaderID', 'Name')
        .select('Title Subject Semester CoverImage Likes Downloads')
        .limit(10),
      PYQ.find({ $or: [{ Title: regex }, { Subject: regex }] })
        .populate('UploaderID', 'Name')
        .select('Title Subject Semester Year ExamType Likes Downloads')
        .limit(10),
      Book.find({ $or: [{ Title: regex }, { Author: regex }, { Subject: regex }], Status: 'Available' })
        .populate('OwnerID', 'Name')
        .select('Title Author Subject CoverImage Status')
        .limit(10),
    ]);
    res.json({ success: true, data: { notes, pyqs, books } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
