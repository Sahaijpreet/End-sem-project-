import mongoose from 'mongoose';

export const UserSchema = new mongoose.Schema({
  Name: { type: String, required: [true, 'Please add a name'] },
  Email: {
    type: String,
    required: [true, 'Please add an email'],
    unique: true,
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please add a valid email'],
  },
  PasswordHash: { type: String, required: true, minlength: 6, select: false },
  Role: { type: String, enum: ['Student', 'Admin'], default: 'Student' },
  CollegeID: { type: String, default: '' },
  Bio: { type: String, default: '', maxlength: 300 },
  Branch: { type: String, default: '' },
  Year: { type: Number, min: 1, max: 6, default: null },
  Avatar: { type: String, default: '' },
  Bookmarks: [{
    ResourceType: { type: String, enum: ['Note', 'PYQ'] },
    ResourceID: { type: mongoose.Schema.ObjectId },
  }],
}, { timestamps: true });

const User = mongoose.model('User', UserSchema);
export default User;
