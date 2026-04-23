import mongoose from 'mongoose';

const NotificationSchema = new mongoose.Schema({
  UserID: { type: mongoose.Schema.ObjectId, ref: 'User', required: true },
  Type: { type: String, enum: ['book_requested', 'request_accepted', 'request_declined', 'new_message', 'exchange_confirmed', 'new_answer', 'new_follower'], required: true },
  Message: { type: String, required: true },
  Link: { type: String, default: '' },
  Read: { type: Boolean, default: false },
}, { timestamps: true });

const Notification = mongoose.model('Notification', NotificationSchema);
export default Notification;
