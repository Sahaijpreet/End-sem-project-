import mongoose from 'mongoose';

const GroupMessageSchema = new mongoose.Schema({
  GroupID: { type: mongoose.Schema.ObjectId, ref: 'StudyGroup', required: true },
  SenderID: { type: mongoose.Schema.ObjectId, ref: 'User', required: true },
  Text: { type: String, required: true, trim: true },
}, { timestamps: true });

const GroupMessage = mongoose.model('GroupMessage', GroupMessageSchema);
export default GroupMessage;
