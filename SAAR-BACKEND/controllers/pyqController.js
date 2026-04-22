import PYQ from '../models/PYQ.js';

export const uploadPYQ = async (req, res) => {
  try {
    const { Title, Subject, Semester, Year, ExamType } = req.body;
    if (!req.file) return res.status(400).json({ success: false, message: 'Please upload a PDF file' });
    const pyq = await PYQ.create({
      Title, Subject, Semester, Year, ExamType,
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
    const { subject, semester, year, examType } = req.query;
    const query = {};
    if (subject) query.Subject = subject;
    if (semester) query.Semester = semester;
    if (year) query.Year = year;
    if (examType) query.ExamType = examType;
    const pyqs = await PYQ.find(query)
      .populate('UploaderID', 'Name CollegeID')
      .sort('-createdAt');
    res.status(200).json({ success: true, count: pyqs.length, data: pyqs });
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
