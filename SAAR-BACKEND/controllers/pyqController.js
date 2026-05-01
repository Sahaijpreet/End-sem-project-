import PYQ from '../models/PYQ.js';
import Rating from '../models/Rating.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

export const uploadPYQ = async (req, res) => {
  try {
    const { Title, Subject, Semester, Year, ExamType, Degree } = req.body;
    if (!req.file) return res.status(400).json({ success: false, message: 'Please upload a file' });
    const pyq = await PYQ.create({
      Title, Subject, Semester, Year, ExamType, Degree: Degree || '',
      FileURL: `/uploads/${req.file.filename}`,
      UploaderID: req.user._id
    });
    res.status(201).json({ success: true, data: pyq });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getPYQs = async (req, res) => {
  try {
    const { subject, semester, year, examType, page = 1, limit = 20 } = req.query;
    const query = {};
    if (subject) query.Subject = subject;
    if (semester) query.Semester = semester;
    if (year) query.Year = year;
    if (examType) query.ExamType = examType;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [pyqs, total] = await Promise.all([
      PYQ.find(query).populate('UploaderID', 'Name CollegeID').sort('-createdAt').skip(skip).limit(parseInt(limit)),
      PYQ.countDocuments(query),
    ]);

    const pyqIds = pyqs.map((p) => p._id);
    const ratingAgg = await Rating.aggregate([
      { $match: { ResourceType: 'PYQ', ResourceID: { $in: pyqIds } } },
      { $group: { _id: '$ResourceID', avg: { $avg: '$Stars' }, count: { $sum: 1 } } },
    ]);
    const ratingMap = Object.fromEntries(ratingAgg.map((r) => [r._id.toString(), { avg: Math.round(r.avg * 10) / 10, count: r.count }]));
    const data = pyqs.map((p) => ({ ...p.toObject(), rating: ratingMap[p._id.toString()] || { avg: 0, count: 0 } }));

    res.status(200).json({ success: true, count: data.length, total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)), data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const togglePYQLike = async (req, res) => {
  try {
    const pyq = await PYQ.findById(req.params.id);
    if (!pyq) return res.status(404).json({ success: false, message: 'PYQ not found' });
    const uid = req.user._id.toString();
    const idx = pyq.Likes.findIndex((l) => l.toString() === uid);
    if (idx === -1) pyq.Likes.push(req.user._id);
    else pyq.Likes.splice(idx, 1);
    await pyq.save();
    res.json({ success: true, data: { likes: pyq.Likes.length, liked: idx === -1 } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const trackPYQDownload = async (req, res) => {
  try {
    await PYQ.findByIdAndUpdate(req.params.id, { $inc: { Downloads: 1 } });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deletePYQ = async (req, res) => {
  try {
    const pyq = await PYQ.findById(req.params.id);
    if (!pyq) return res.status(404).json({ success: false, message: 'PYQ not found' });
    if (pyq.UploaderID.toString() !== req.user._id.toString() && req.user.Role !== 'Admin')
      return res.status(403).json({ success: false, message: 'Not authorized' });
    const filePath = pyq.FileURL ? path.join(path.dirname(fileURLToPath(import.meta.url)), '..', pyq.FileURL) : null;
    await pyq.deleteOne();
    if (filePath && fs.existsSync(filePath)) fs.unlinkSync(filePath);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
