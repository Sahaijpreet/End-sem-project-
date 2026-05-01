import Note from '../models/Note.js';
import Rating from '../models/Rating.js';
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

export const uploadNote = async (req, res) => {
  try {
    const { Title, Subject, Semester } = req.body;
    if (!req.files?.document?.[0]) {
      return res.status(400).json({ success: false, message: 'Please upload a PDF file' });
    }
    const FileURL = `/uploads/${req.files.document[0].filename}`;
    const CoverImage = req.files?.cover?.[0] ? `/uploads/${req.files.cover[0].filename}` : '';
    const note = await Note.create({ Title, Subject, Semester, FileURL, CoverImage, UploaderID: req.user._id });
    res.status(201).json({ success: true, data: note });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getNotes = async (req, res) => {
  try {
    const { subject, semester, page = 1, limit = 20 } = req.query;
    const query = {};
    if (subject) query.Subject = subject;
    if (semester) query.Semester = semester;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [notes, total] = await Promise.all([
      Note.find(query).populate('UploaderID', 'Name CollegeID').sort('-UploadDate').skip(skip).limit(parseInt(limit)),
      Note.countDocuments(query),
    ]);

    // Embed ratings in one aggregation instead of N per-card requests
    const noteIds = notes.map((n) => n._id);
    const ratingAgg = await Rating.aggregate([
      { $match: { ResourceType: 'Note', ResourceID: { $in: noteIds } } },
      { $group: { _id: '$ResourceID', avg: { $avg: '$Stars' }, count: { $sum: 1 } } },
    ]);
    const ratingMap = Object.fromEntries(ratingAgg.map((r) => [r._id.toString(), { avg: Math.round(r.avg * 10) / 10, count: r.count }]));
    const data = notes.map((n) => ({ ...n.toObject(), rating: ratingMap[n._id.toString()] || { avg: 0, count: 0 } }));

    res.status(200).json({ success: true, count: data.length, total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)), data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const toggleLike = async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);
    if (!note) return res.status(404).json({ success: false, message: 'Note not found' });
    const uid = req.user._id.toString();
    const idx = note.Likes.findIndex((l) => l.toString() === uid);
    if (idx === -1) note.Likes.push(req.user._id);
    else note.Likes.splice(idx, 1);
    await note.save();
    res.json({ success: true, data: { likes: note.Likes.length, liked: idx === -1 } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getNoteById = async (req, res) => {
  try {
    const note = await Note.findById(req.params.id).populate('UploaderID', 'Name CollegeID');
    if (!note) return res.status(404).json({ success: false, message: 'Note not found' });
    res.status(200).json({ success: true, data: note });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const trackDownload = async (req, res) => {
  try {
    await Note.findByIdAndUpdate(req.params.id, { $inc: { Downloads: 1 } });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteNote = async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);
    if (!note) return res.status(404).json({ success: false, message: 'Note not found' });
    const isOwner = note.UploaderID.toString() === req.user._id.toString();
    if (!isOwner && req.user.Role !== 'Admin') return res.status(403).json({ success: false, message: 'Not authorized' });
    await note.deleteOne();
    deleteUploadedFile(note.FileURL);
    deleteUploadedFile(note.CoverImage);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
