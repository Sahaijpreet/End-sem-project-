import mongoose from 'mongoose';

const ExchangeRequestSchema = new mongoose.Schema({
  Status: {
    type: String,
    enum: ['Pending', 'Accepted', 'Rejected'],
    default: 'Pending'
  },
  BookID: {
    type: mongoose.Schema.ObjectId,
    ref: 'Book',
    required: true
  },
  RequesterID: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

const ExchangeRequest = mongoose.model('ExchangeRequest', ExchangeRequestSchema);

export default ExchangeRequest;
