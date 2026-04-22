import Comment from '../models/Comment.js';

export const getComments = async (req, res) => {
  try {
    const { resourceType, resourceId } = req.params;
    const comments = await Comment.find({ ResourceType: resourceType, ResourceID: resourceId })
      .populate('AuthorID', 'Name Avatar')
      .sort('createdAt');
    res.json({ success: true, data: comments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const addComment = async (req, res) => {
  try {
    const { resourceType, resourceId } = req.params;
    const { text } = req.body;
    if (!text?.trim()) return res.status(400).json({ success: false, message: 'Comment cannot be empty' });
    const comment = await Comment.create({
      ResourceType: resourceType,
      ResourceID: resourceId,
      AuthorID: req.user._id,
      Text: text.trim(),
    });
    await comment.populate('AuthorID', 'Name Avatar');
    res.status(201).json({ success: true, data: comment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) return res.status(404).json({ success: false, message: 'Comment not found' });
    const isOwner = comment.AuthorID.toString() === req.user._id.toString();
    const isAdmin = req.user.Role === 'Admin';
    if (!isOwner && !isAdmin) return res.status(403).json({ success: false, message: 'Not authorized' });
    await comment.deleteOne();
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
