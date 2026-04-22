import Book from '../models/Book.js';
import ExchangeRequest from '../models/ExchangeRequest.js';

export const listBook = async (req, res) => {
  try {
    const { Title, Author, Subject } = req.body;
    
    const book = await Book.create({
      Title,
      Author,
      Subject,
      OwnerID: req.user._id
    });

    res.status(201).json({ success: true, data: book });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getAvailableBooks = async (req, res) => {
  try {
    const { subject } = req.query;
    
    let query = { Status: 'Available' };
    if (subject) query.Subject = subject;

    const books = await Book.find(query)
      .populate('OwnerID', 'Name CollegeID')
      .sort('-createdAt');
      
    res.status(200).json({ success: true, count: books.length, data: books });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const requestExchange = async (req, res) => {
  try {
    const bookId = req.params.id;
    
    const book = await Book.findById(bookId);
    if (!book) {
      return res.status(404).json({ success: false, message: 'Book not found' });
    }
    
    if (book.Status !== 'Available') {
      return res.status(400).json({ success: false, message: 'Book is not available for exchange' });
    }
    
    // Prevent owner from requesting their own book
    if (book.OwnerID.toString() === req.user._id.toString()) {
      return res.status(400).json({ success: false, message: 'You cannot request your own book' });
    }

    // Check if request already exists
    const existingRequest = await ExchangeRequest.findOne({
      BookID: bookId,
      RequesterID: req.user._id
    });
    
    if (existingRequest) {
      return res.status(400).json({ success: false, message: 'You have already requested this book' });
    }

    const exchangeRequest = await ExchangeRequest.create({
      BookID: bookId,
      RequesterID: req.user._id
    });
    
    // Update book status
    book.Status = 'Requested';
    await book.save();

    res.status(201).json({ success: true, data: exchangeRequest });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getMyRequests = async (req, res) => {
  try {
    // Requests on books I own
    const myBooks = await Book.find({ OwnerID: req.user._id }).select('_id');
    const bookIds = myBooks.map((b) => b._id);
    const requests = await ExchangeRequest.find({ BookID: { $in: bookIds } })
      .populate('BookID', 'Title Author Subject Status')
      .populate('RequesterID', 'Name Email')
      .sort('-createdAt');
    res.json({ success: true, data: requests });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const respondToRequest = async (req, res) => {
  try {
    const { action } = req.body; // 'accept' | 'reject'
    const request = await ExchangeRequest.findById(req.params.id).populate('BookID');
    if (!request) return res.status(404).json({ success: false, message: 'Request not found' });
    if (request.BookID.OwnerID.toString() !== req.user._id.toString())
      return res.status(403).json({ success: false, message: 'Not authorized' });
    if (action === 'accept') {
      request.Status = 'Accepted';
      request.BookID.Status = 'Exchanged';
      await request.BookID.save();
    } else {
      request.Status = 'Rejected';
      request.BookID.Status = 'Available';
      await request.BookID.save();
    }
    await request.save();
    res.json({ success: true, data: request });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
