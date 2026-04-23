import mongoose from 'mongoose';

const FollowSchema = new mongoose.Schema({
  FollowerID: { type: mongoose.Schema.ObjectId, ref: 'User', required: true },
  FollowingID: { type: mongoose.Schema.ObjectId, ref: 'User', required: true },
}, { timestamps: true });

FollowSchema.index({ FollowerID: 1, FollowingID: 1 }, { unique: true });

const Follow = mongoose.model('Follow', FollowSchema);
export default Follow;
