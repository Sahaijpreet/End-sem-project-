import mongoose from 'mongoose';

export const UserSchema = new mongoose.Schema({
  Name: { type: String, required: [true, 'Please add a name'] },
  Email: {
    type: String,
    required: [true, 'Please add an email'],
    unique: true,
    match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please add a valid email'],
  },
  EmailVerified: { type: Boolean, default: false },
  EmailVerificationToken: { type: String, select: false },
  EmailVerificationExpires: { type: Date, select: false },
  PasswordHash: { type: String, required: true, minlength: 6, select: false },
  PasswordResetToken: { type: String, select: false },
  PasswordResetExpires: { type: Date, select: false },
  PasswordResetOTP: { type: String, select: false },
  PasswordResetOTPExpires: { type: Date, select: false },
  LoginAttempts: { type: Number, default: 0 },
  AccountLocked: { type: Boolean, default: false },
  AccountLockedUntil: { type: Date, select: false },
  LastLogin: { type: Date },
  TwoFactorEnabled: { type: Boolean, default: false },
  TwoFactorSecret: { type: String, select: false },
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
