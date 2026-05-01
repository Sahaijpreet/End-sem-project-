import User from '../models/User.js';
import Note from '../models/Note.js';
import Book from '../models/Book.js';
import PYQ from '../models/PYQ.js';
import ExchangeRequest from '../models/ExchangeRequest.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function deleteUploadedFile(fileUrl) {
  if (!fileUrl) return;
  try {
    const relative = fileUrl.replace(/^\/+/, '');
    const abs = path.join(__dirname, '..', relative);
    if (fs.existsSync(abs)) fs.unlinkSync(abs);
  } catch {}
}

export const getStats = async (req, res) => {
  try {
    const [totalUsers, totalNotes, totalBooks, totalPYQs, latestNotes] = await Promise.all([
      User.countDocuments({}),
      Note.countDocuments({}),
      Book.countDocuments({}),
      PYQ.countDocuments({}),
      Note.find().populate('UploaderID', 'Name').sort('-UploadDate').limit(5),
    ]);
    res.status(200).json({ success: true, data: { totalUsers, totalNotes, totalBooks, totalPYQs, latestNotes } });
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
    deleteUploadedFile(note.FileURL);
    deleteUploadedFile(note.CoverImage);
    res.status(200).json({ success: true, message: 'Note deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const listUsers = async (req, res) => {
  try {
    const { page = 1, limit = 50 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [users, total] = await Promise.all([
      User.find().select('-PasswordHash').sort('-createdAt').skip(skip).limit(parseInt(limit)),
      User.countDocuments(),
    ]);
    res.status(200).json({ success: true, count: users.length, total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)), data: users });
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

export const listAllPYQs = async (req, res) => {
  try {
    const pyqs = await PYQ.find().populate('UploaderID', 'Name').sort('-createdAt');
    res.status(200).json({ success: true, data: pyqs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deletePYQ = async (req, res) => {
  try {
    const pyq = await PYQ.findByIdAndDelete(req.params.id);
    if (!pyq) return res.status(404).json({ success: false, message: 'PYQ not found' });
    deleteUploadedFile(pyq.FileURL);
    res.status(200).json({ success: true, message: 'PYQ deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.status(200).json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
