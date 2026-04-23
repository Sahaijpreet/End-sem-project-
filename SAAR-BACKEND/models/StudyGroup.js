import mongoose from 'mongoose';

const StudyGroupSchema = new mongoose.Schema({
  Name: { type: String, required: true, trim: true },
  Subject: { type: String, required: true },
  Semester: { type: Number, min: 1, max: 8, required: true },
  Description: { type: String, default: '' },
  CreatedBy: { type: mongoose.Schema.ObjectId, ref: 'User', required: true },
  Members: [{ type: mongoose.Schema.ObjectId, ref: 'User' }],
  LastMessageAt: { type: Date, default: Date.now },
  LastMessage: { type: String, default: '' },
}, { timestamps: true });

const StudyGroup = mongoose.model('StudyGroup', StudyGroupSchema);
export default StudyGroup;
