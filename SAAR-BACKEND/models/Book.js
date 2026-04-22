import mongoose from 'mongoose';

const BookSchema = new mongoose.Schema({
  Title: {
    type: String,
    required: [true, 'Please add a title'],
    trim: true
  },
  Author: {
    type: String,
    required: [true, 'Please add the author']
  },
  Subject: {
    type: String,
    required: [true, 'Please specify the subject']
  },
  Status: {
    type: String,
    enum: ['Available', 'Requested', 'Exchanged'],
    default: 'Available'
  },
  OwnerID: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  CoverImage: { type: String, default: '' }
}, {
  timestamps: true
});

const Book = mongoose.model('Book', BookSchema);

export default Book;
