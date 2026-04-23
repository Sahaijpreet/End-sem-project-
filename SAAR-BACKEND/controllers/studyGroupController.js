import StudyGroup from '../models/StudyGroup.js';
import GroupMessage from '../models/GroupMessage.js';
import { createNotification } from './notificationController.js';

export const createGroup = async (req, res) => {
  try {
    const { Name, Subject, Semester, Description } = req.body;
    const group = await StudyGroup.create({
      Name, Subject, Semester, Description,
      CreatedBy: req.user._id,
      Members: [req.user._id],
    });
    await group.populate('CreatedBy', 'Name Avatar');
    res.status(201).json({ success: true, data: group });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getGroups = async (req, res) => {
  try {
    const { subject, semester } = req.query;
    const query = {};
    if (subject) query.Subject = subject;
    if (semester) query.Semester = semester;
    const groups = await StudyGroup.find(query)
      .populate('CreatedBy', 'Name Avatar')
      .sort('-LastMessageAt');
    res.json({ success: true, data: groups });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const joinGroup = async (req, res) => {
  try {
    const group = await StudyGroup.findById(req.params.id);
    if (!group) return res.status(404).json({ success: false, message: 'Group not found' });
    if (group.Members.includes(req.user._id))
      return res.status(400).json({ success: false, message: 'Already a member' });
    group.Members.push(req.user._id);
    await group.save();
    res.json({ success: true, data: group });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const leaveGroup = async (req, res) => {
  try {
    const group = await StudyGroup.findById(req.params.id);
    if (!group) return res.status(404).json({ success: false, message: 'Group not found' });
    group.Members = group.Members.filter((m) => m.toString() !== req.user._id.toString());
    await group.save();
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getGroupMessages = async (req, res) => {
  try {
    const group = await StudyGroup.findById(req.params.id);
    if (!group) return res.status(404).json({ success: false, message: 'Group not found' });
    if (!group.Members.map(String).includes(req.user._id.toString()))
      return res.status(403).json({ success: false, message: 'Not a member' });
    const messages = await GroupMessage.find({ GroupID: req.params.id })
      .populate('SenderID', 'Name Avatar')
      .sort('createdAt')
      .limit(100);
    res.json({ success: true, data: messages });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const sendGroupMessage = async (req, res) => {
  try {
    const { text } = req.body;
    if (!text?.trim()) return res.status(400).json({ success: false, message: 'Message cannot be empty' });
    const group = await StudyGroup.findById(req.params.id);
    if (!group) return res.status(404).json({ success: false, message: 'Group not found' });
    if (!group.Members.map(String).includes(req.user._id.toString()))
      return res.status(403).json({ success: false, message: 'Not a member' });
    const message = await GroupMessage.create({ GroupID: group._id, SenderID: req.user._id, Text: text.trim() });
    group.LastMessage = text.trim();
    group.LastMessageAt = new Date();
    await group.save();
    await message.populate('SenderID', 'Name Avatar');
    res.status(201).json({ success: true, data: message });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getMyGroups = async (req, res) => {
  try {
    const groups = await StudyGroup.find({ Members: req.user._id })
      .populate('CreatedBy', 'Name Avatar')
      .sort('-LastMessageAt');
    res.json({ success: true, data: groups });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
