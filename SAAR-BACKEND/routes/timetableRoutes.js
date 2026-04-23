import express from 'express';
import { getTimetable, saveTimetable } from '../controllers/timetableController.js';
import { protect } from '../middleware/authMiddleware.js';
import { handleImageUpload } from '../middleware/imageUploadMiddleware.js';

const router = express.Router();
router.get('/', protect, getTimetable);
router.put('/', protect, saveTimetable);
router.post('/image', protect, handleImageUpload('timetable'), async (req, res) => {
  try {
    const { default: Timetable } = await import('../models/Timetable.js');
    const imageURL = req.file ? `/uploads/${req.file.filename}` : '';
    const tt = await Timetable.findOneAndUpdate(
      { UserID: req.user._id },
      { ImageURL: imageURL },
      { upsert: true, new: true }
    );
    res.json({ success: true, data: { ImageURL: tt.ImageURL } });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});
export default router;
