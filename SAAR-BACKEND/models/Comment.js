import mongoose from 'mongoose';

const CommentSchema = new mongoose.Schema({
  ResourceType: { type: String, enum: ['Note', 'PYQ'], required: true },
  ResourceID: { type: mongoose.Schema.ObjectId, required: true, refPath: 'ResourceType' },
  AuthorID: { type: mongoose.Schema.ObjectId, ref: 'User', required: true },
  Text: { type: String, required: true, trim: true, maxlength: 1000 },
}, { timestamps: true });

const Comment = mongoose.model('Comment', CommentSchema);
export default Comment;
