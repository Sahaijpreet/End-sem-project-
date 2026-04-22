import Conversation from '../models/Conversation.js';
import Message from '../models/Message.js';
import ExchangeRequest from '../models/ExchangeRequest.js';
import Book from '../models/Book.js';
import { createNotification } from './notificationController.js';

// Get or create conversation after a request is accepted
export const getOrCreateConversation = async (req, res) => {
  try {
    const { requestId } = req.params;
    const request = await ExchangeRequest.findById(requestId).populate('BookID');
    if (!request) return res.status(404).json({ success: false, message: 'Request not found' });
    if (request.Status !== 'Accepted')
      return res.status(400).json({ success: false, message: 'Conversation only available for accepted requests' });

    const uid = req.user._id.toString();
    const ownerId = request.BookID.OwnerID.toString();
    const requesterId = request.RequesterID.toString();

    if (uid !== ownerId && uid !== requesterId)
      return res.status(403).json({ success: false, message: 'Not authorized' });

    let convo = await Conversation.findOne({ BookID: request.BookID._id, OwnerID: ownerId, RequesterID: requesterId });
    if (!convo) {
      convo = await Conversation.create({
        BookID: request.BookID._id,
        OwnerID: ownerId,
        RequesterID: requesterId,
      });
    }
    await convo.populate([
      { path: 'BookID', select: 'Title Author' },
      { path: 'OwnerID', select: 'Name Email' },
      { path: 'RequesterID', select: 'Name Email' },
    ]);
    res.json({ success: true, data: convo });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get all conversations for the logged-in user
export const getMyConversations = async (req, res) => {
  try {
    const uid = req.user._id;
    const convos = await Conversation.find({ $or: [{ OwnerID: uid }, { RequesterID: uid }] })
      .populate('BookID', 'Title Author')
      .populate('OwnerID', 'Name')
      .populate('RequesterID', 'Name')
      .sort('-LastMessageAt');
    res.json({ success: true, data: convos });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get messages for a conversation
export const getMessages = async (req, res) => {
  try {
    const convo = await Conversation.findById(req.params.id);
    if (!convo) return res.status(404).json({ success: false, message: 'Conversation not found' });
    const uid = req.user._id.toString();
    if (convo.OwnerID.toString() !== uid && convo.RequesterID.toString() !== uid)
      return res.status(403).json({ success: false, message: 'Not authorized' });
    const messages = await Message.find({ ConversationID: req.params.id })
      .populate('SenderID', 'Name')
      .sort('createdAt');
    res.json({ success: true, data: messages });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Confirm exchange
export const confirmExchange = async (req, res) => {
  try {
    const convo = await Conversation.findById(req.params.id).populate('BookID');
    if (!convo) return res.status(404).json({ success: false, message: 'Conversation not found' });
    if (convo.ExchangeCompleted) return res.json({ success: true, data: convo, message: 'Already completed' });

    const uid = req.user._id.toString();
    const isOwner = convo.OwnerID.toString() === uid;
    const isRequester = convo.RequesterID.toString() === uid;
    if (!isOwner && !isRequester) return res.status(403).json({ success: false, message: 'Not authorized' });

    if (isOwner) convo.OwnerConfirmed = true;
    if (isRequester) convo.RequesterConfirmed = true;

    // Both confirmed — complete the exchange
    if (convo.OwnerConfirmed && convo.RequesterConfirmed) {
      convo.ExchangeCompleted = true;
      // Save book snapshot before deleting
      if (convo.BookID) {
        convo.BookSnapshot = {
          Title: convo.BookID.Title,
          Author: convo.BookID.Author,
          Subject: convo.BookID.Subject,
        };
        await Book.findByIdAndDelete(convo.BookID._id);
      }
    }
    await convo.save();
    await convo.populate([
      { path: 'OwnerID', select: 'Name Email' },
      { path: 'RequesterID', select: 'Name Email' },
    ]);
    res.json({ success: true, data: convo });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get all completed exchanges (admin)
export const getCompletedExchanges = async (req, res) => {
  try {
    const exchanges = await Conversation.find({ ExchangeCompleted: true })
      .populate('OwnerID', 'Name Email')
      .populate('RequesterID', 'Name Email')
      .sort('-updatedAt');
    res.json({ success: true, data: exchanges });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Send a message
export const sendMessage = async (req, res) => {
  try {
    const { text } = req.body;
    if (!text?.trim()) return res.status(400).json({ success: false, message: 'Message cannot be empty' });
    const convo = await Conversation.findById(req.params.id);
    if (!convo) return res.status(404).json({ success: false, message: 'Conversation not found' });
    const uid = req.user._id.toString();
    if (convo.OwnerID.toString() !== uid && convo.RequesterID.toString() !== uid)
      return res.status(403).json({ success: false, message: 'Not authorized' });
    const message = await Message.create({
      ConversationID: convo._id,
      SenderID: req.user._id,
      Text: text.trim(),
    });
    convo.LastMessage = text.trim();
    convo.LastMessageAt = new Date();
    await convo.save();
    // Notify the other user
    const otherId = convo.OwnerID.toString() === req.user._id.toString() ? convo.RequesterID : convo.OwnerID;
    await createNotification(otherId, 'new_message', `New message from ${req.user.Name || 'Someone'}`, `/chat/${convo._id}`);
    await message.populate('SenderID', 'Name');
    res.status(201).json({ success: true, data: message });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
