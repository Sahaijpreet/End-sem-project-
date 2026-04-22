import mongoose from 'mongoose';

const ConversationSchema = new mongoose.Schema({
  BookID: { type: mongoose.Schema.ObjectId, ref: 'Book', required: true },
  OwnerID: { type: mongoose.Schema.ObjectId, ref: 'User', required: true },
  RequesterID: { type: mongoose.Schema.ObjectId, ref: 'User', required: true },
  LastMessage: { type: String, default: '' },
  LastMessageAt: { type: Date, default: Date.now },
  OwnerConfirmed: { type: Boolean, default: false },
  RequesterConfirmed: { type: Boolean, default: false },
  ExchangeCompleted: { type: Boolean, default: false },
  BookSnapshot: {
    Title: String,
    Author: String,
    Subject: String,
  },
}, { timestamps: true });

const Conversation = mongoose.model('Conversation', ConversationSchema);
export default Conversation;
