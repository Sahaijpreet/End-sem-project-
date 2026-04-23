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
    const { Slots } = req.body;
    const tt = await Timetable.findOneAndUpdate(
      { UserID: req.user._id },
      { Slots },
      { upsert: true, new: true }
    );
    res.json({ success: true, data: tt });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
