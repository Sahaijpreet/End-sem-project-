import Note from '../models/Note.js';

export const uploadNote = async (req, res) => {
  try {
    const { Title, Subject, Semester } = req.body;
    
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please upload a PDF file' });
    }
    
    const FileURL = `/uploads/${req.file.filename}`;

    const note = await Note.create({
      Title,
      Subject,
      Semester,
      FileURL,
      UploaderID: req.user._id
    });

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

export const getNoteById = async (req, res) => {
  try {
    const note = await Note.findById(req.params.id)
      .populate('UploaderID', 'Name CollegeID');
      
    if (!note) {
      return res.status(404).json({ success: false, message: 'Note not found' });
    }
    
    res.status(200).json({ success: true, data: note });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
