import mongoose from 'mongoose';

const RatingSchema = new mongoose.Schema({
  ResourceType: { type: String, enum: ['Note', 'PYQ'], required: true },
  ResourceID: { type: mongoose.Schema.ObjectId, required: true },
  UserID: { type: mongoose.Schema.ObjectId, ref: 'User', required: true },
  Stars: { type: Number, min: 1, max: 5, required: true },
}, { timestamps: true });

// One rating per user per resource
RatingSchema.index({ ResourceID: 1, UserID: 1 }, { unique: true });

const Rating = mongoose.model('Rating', RatingSchema);
export default Rating;
