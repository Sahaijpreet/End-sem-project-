import Note from '../models/Note.js';
import PYQ from '../models/PYQ.js';
import User from '../models/User.js';

export const getLeaderboard = async (req, res) => {
  try {
    const [notes, pyqs] = await Promise.all([
      Note.find().select('UploaderID Likes Downloads'),
      PYQ.find().select('UploaderID Likes Downloads'),
    ]);

    const scoreMap = {};

    for (const n of notes) {
      const uid = n.UploaderID?.toString();
      if (!uid) continue;
      if (!scoreMap[uid]) scoreMap[uid] = { uploads: 0, likes: 0, downloads: 0 };
      scoreMap[uid].uploads += 1;
      scoreMap[uid].likes += n.Likes?.length ?? 0;
      scoreMap[uid].downloads += n.Downloads ?? 0;
    }
    for (const p of pyqs) {
      const uid = p.UploaderID?.toString();
      if (!uid) continue;
      if (!scoreMap[uid]) scoreMap[uid] = { uploads: 0, likes: 0, downloads: 0 };
      scoreMap[uid].uploads += 1;
      scoreMap[uid].likes += p.Likes?.length ?? 0;
      scoreMap[uid].downloads += p.Downloads ?? 0;
    }

    const userIds = Object.keys(scoreMap);
    const users = await User.find({ _id: { $in: userIds } }).select('Name Avatar Branch Year CollegeID');

    const leaderboard = users
      .map((u) => {
        const s = scoreMap[u._id.toString()] || {};
        return {
          _id: u._id,
          Name: u.Name,
          Avatar: u.Avatar,
          Branch: u.Branch,
          Year: u.Year,
          uploads: s.uploads || 0,
          likes: s.likes || 0,
          downloads: s.downloads || 0,
          score: (s.uploads || 0) * 5 + (s.likes || 0) * 2 + (s.downloads || 0),
        };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, 20);

    res.json({ success: true, data: leaderboard });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
