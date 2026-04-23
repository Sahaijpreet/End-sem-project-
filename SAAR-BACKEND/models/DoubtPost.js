import mongoose from 'mongoose';

const AnswerSchema = new mongoose.Schema({
  AuthorID: { type: mongoose.Schema.ObjectId, ref: 'User', required: true },
  Text: { type: String, required: true, trim: true },
  Upvotes: [{ type: mongoose.Schema.ObjectId, ref: 'User' }],
  IsAccepted: { type: Boolean, default: false },
}, { timestamps: true });

const DoubtPostSchema = new mongoose.Schema({
  Title: { type: String, required: true, trim: true },
  Body: { type: String, required: true, trim: true },
  Subject: { type: String, required: true },
  Semester: { type: Number, min: 1, max: 8 },
  AuthorID: { type: mongoose.Schema.ObjectId, ref: 'User', required: true },
  Tags: [{ type: String }],
  Answers: [AnswerSchema],
  Views: { type: Number, default: 0 },
  Solved: { type: Boolean, default: false },
}, { timestamps: true });

const DoubtPost = mongoose.model('DoubtPost', DoubtPostSchema);
export default DoubtPost;
