import mongoose from 'mongoose';

export const UserSchema = new mongoose.Schema({
  Name: {
    type: String,
    required: [true, 'Please add a name']
  },
  Email: {
    type: String,
    required: [true, 'Please add an email'],
    unique: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please add a valid email'
    ]
  },
  PasswordHash: {
    type: String,
    required: [true, 'Please add a password'],
    minlength: 6,
    select: false
  },
  Role: {
    type: String,
    enum: ['Student', 'Admin'],
    default: 'Student'
  },
  CollegeID: {
    type: String,
    required: [false, 'College ID is optional but recommended']
  }
}, {
  timestamps: true
});

const User = mongoose.model('User', UserSchema);

export default User;
