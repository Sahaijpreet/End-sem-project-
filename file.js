// SAAR-BACKEND/models/User.js
export const UserSchema = new mongoose.Schema({
  Name, Email, EmailVerified, PasswordHash,
  Role: { type: String, enum: ['Student', 'Admin'], default: 'Student' },
  LoginAttempts, AccountLocked, AccountLockedUntil,
  TwoFactorEnabled, Bookmarks, Branch, Year, ...
});


