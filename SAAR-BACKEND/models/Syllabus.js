import mongoose from 'mongoose';

const TopicSchema = new mongoose.Schema({
  Name: { type: String, required: true },
  Done: { type: Boolean, default: false },
});

const SyllabusSchema = new mongoose.Schema({
  UserID: { type: mongoose.Schema.ObjectId, ref: 'User', required: true },
  Subject: { type: String, required: true },
  Semester: { type: Number, min: 1, max: 8, required: true },
  Topics: [TopicSchema],
}, { timestamps: true });

SyllabusSchema.index({ UserID: 1, Subject: 1, Semester: 1 }, { unique: true });

const Syllabus = mongoose.model('Syllabus', SyllabusSchema);
export default Syllabus;
