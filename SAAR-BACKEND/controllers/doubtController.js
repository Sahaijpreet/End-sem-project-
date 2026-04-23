import DoubtPost from '../models/DoubtPost.js';
import { createNotification } from './notificationController.js';

export const createDoubt = async (req, res) => {
  try {
    const { Title, Body, Subject, Semester, Tags } = req.body;
    const post = await DoubtPost.create({ Title, Body, Subject, Semester, Tags, AuthorID: req.user._id });
    await post.populate('AuthorID', 'Name Avatar');
    res.status(201).json({ success: true, data: post });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getDoubts = async (req, res) => {
  try {
    const { subject, semester, solved } = req.query;
    const query = {};
    if (subject) query.Subject = subject;
    if (semester) query.Semester = semester;
    if (solved !== undefined) query.Solved = solved === 'true';
    const posts = await DoubtPost.find(query)
      .populate('AuthorID', 'Name Avatar')
      .select('-Answers')
      .sort('-createdAt');
    res.json({ success: true, data: posts });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getDoubtById = async (req, res) => {
  try {
    const post = await DoubtPost.findByIdAndUpdate(
      req.params.id,
      { $inc: { Views: 1 } },
      { new: true }
    ).populate('AuthorID', 'Name Avatar')
     .populate('Answers.AuthorID', 'Name Avatar');
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });
    res.json({ success: true, data: post });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const addAnswer = async (req, res) => {
  try {
    const { text } = req.body;
    if (!text?.trim()) return res.status(400).json({ success: false, message: 'Answer cannot be empty' });
    const post = await DoubtPost.findById(req.params.id);
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });
    post.Answers.push({ AuthorID: req.user._id, Text: text.trim() });
    await post.save();
    await post.populate('Answers.AuthorID', 'Name Avatar');
    await createNotification(post.AuthorID, 'new_answer', `${req.user.Name} answered your doubt: "${post.Title}"`, `/forum/${post._id}`);
    res.status(201).json({ success: true, data: post.Answers[post.Answers.length - 1] });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const upvoteAnswer = async (req, res) => {
  try {
    const post = await DoubtPost.findById(req.params.id);
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });
    const answer = post.Answers.id(req.params.answerId);
    if (!answer) return res.status(404).json({ success: false, message: 'Answer not found' });
    const uid = req.user._id.toString();
    const idx = answer.Upvotes.findIndex((u) => u.toString() === uid);
    if (idx === -1) answer.Upvotes.push(req.user._id);
    else answer.Upvotes.splice(idx, 1);
    await post.save();
    res.json({ success: true, data: { upvotes: answer.Upvotes.length, upvoted: idx === -1 } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const acceptAnswer = async (req, res) => {
  try {
    const post = await DoubtPost.findById(req.params.id);
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });
    if (post.AuthorID.toString() !== req.user._id.toString())
      return res.status(403).json({ success: false, message: 'Only the author can accept an answer' });
    post.Answers.forEach((a) => { a.IsAccepted = a._id.toString() === req.params.answerId; });
    post.Solved = true;
    await post.save();
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteDoubt = async (req, res) => {
  try {
    const post = await DoubtPost.findById(req.params.id);
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });
    if (post.AuthorID.toString() !== req.user._id.toString() && req.user.Role !== 'Admin')
      return res.status(403).json({ success: false, message: 'Not authorized' });
    await post.deleteOne();
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
