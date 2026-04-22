import mongoose from 'mongoose';

const PYQSchema = new mongoose.Schema({
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
    min: 1,
    max: 8
  },
  Year: {
    type: Number,
    required: [true, 'Please specify the exam year']
  },
  ExamType: {
    type: String,
    enum: ['Mid Semester', 'End Semester', 'Quiz', 'Other'],
    default: 'End Semester'
  },
  FileURL: {
    type: String,
    required: true
  },
  UploaderID: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  Likes: [{ type: mongoose.Schema.ObjectId, ref: 'User' }],
  Downloads: { type: Number, default: 0 },
}, { timestamps: true });

const PYQ = mongoose.model('PYQ', PYQSchema);
export default PYQ;
