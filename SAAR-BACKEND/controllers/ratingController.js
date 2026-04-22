import Rating from '../models/Rating.js';

export const rateResource = async (req, res) => {
  try {
    const { resourceType, resourceId } = req.params;
    const { stars } = req.body;
    if (!stars || stars < 1 || stars > 5) return res.status(400).json({ success: false, message: 'Stars must be 1-5' });
    const rating = await Rating.findOneAndUpdate(
      { ResourceType: resourceType, ResourceID: resourceId, UserID: req.user._id },
      { Stars: stars },
      { upsert: true, new: true }
    );
    const agg = await Rating.aggregate([
      { $match: { ResourceType: resourceType, ResourceID: rating.ResourceID } },
      { $group: { _id: null, avg: { $avg: '$Stars' }, count: { $sum: 1 } } },
    ]);
    const { avg = 0, count = 0 } = agg[0] || {};
    res.json({ success: true, data: { avg: Math.round(avg * 10) / 10, count, userRating: stars } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getResourceRating = async (req, res) => {
  try {
    const { resourceType, resourceId } = req.params;
    const agg = await Rating.aggregate([
      { $match: { ResourceType: resourceType, ResourceID: new (await import('mongoose')).default.Types.ObjectId(resourceId) } },
      { $group: { _id: null, avg: { $avg: '$Stars' }, count: { $sum: 1 } } },
    ]);
    const { avg = 0, count = 0 } = agg[0] || {};
    let userRating = null;
    if (req.user) {
      const r = await Rating.findOne({ ResourceType: resourceType, ResourceID: resourceId, UserID: req.user._id });
      userRating = r?.Stars ?? null;
    }
    res.json({ success: true, data: { avg: Math.round(avg * 10) / 10, count, userRating } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
