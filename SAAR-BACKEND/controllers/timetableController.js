import Timetable from '../models/Timetable.js';

export const getTimetable = async (req, res) => {
  try {
    const tt = await Timetable.findOne({ UserID: req.user._id });
    res.json({ success: true, data: tt || { Slots: [] } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const saveTimetable = async (req, res) => {
  try {
    const { Slots, ImageURL } = req.body;
    const update = { Slots };
    if (ImageURL !== undefined) update.ImageURL = ImageURL;
    const tt = await Timetable.findOneAndUpdate(
      { UserID: req.user._id },
      update,
      { upsert: true, new: true }
    );
    res.json({ success: true, data: tt });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
