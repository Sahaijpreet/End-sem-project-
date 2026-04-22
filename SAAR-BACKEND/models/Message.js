import mongoose from 'mongoose';

const MessageSchema = new mongoose.Schema({
  ConversationID: { type: mongoose.Schema.ObjectId, ref: 'Conversation', required: true },
  SenderID: { type: mongoose.Schema.ObjectId, ref: 'User', required: true },
  Text: { type: String, required: true, trim: true, maxlength: 1000 },
}, { timestamps: true });

const Message = mongoose.model('Message', MessageSchema);
export default Message;
