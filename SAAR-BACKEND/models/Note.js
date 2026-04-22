import mongoose from 'mongoose';

const NoteSchema = new mongoose.Schema({
  Title: {
    type: String,
    required: [true, 'Please add a title'],
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters']
  },
  Subject: {
    type: String,
    required: [true, 'Please specify the subject']
  },
  Semester: {
    type: Number,
    required: [true, 'Please specify the semester (1-8)'],
    min: [1, 'Semester cannot be less than 1'],
    max: [8, 'Semester cannot be more than 8']
  },
  FileURL: {
    type: String,
    required: [true, 'Please provide the file path']
  },
  UploadDate: {
    type: Date,
    default: Date.now
  },
  UploaderID: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  CoverImage: { type: String, default: '' },
  Likes: [{ type: mongoose.Schema.ObjectId, ref: 'User' }],
  Downloads: { type: Number, default: 0 },
}, {
  timestamps: true
});

const Note = mongoose.model('Note', NoteSchema);

export default Note;
