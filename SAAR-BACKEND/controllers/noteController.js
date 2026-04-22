import Note from '../models/Note.js';

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
    const { subject, semester } = req.query;
    
    let query = {};
    if (subject) query.Subject = subject;
    if (semester) query.Semester = semester;

    const notes = await Note.find(query)
      .populate('UploaderID', 'Name CollegeID')
      .sort('-UploadDate');
      
    res.status(200).json({ success: true, count: notes.length, data: notes });
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
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
