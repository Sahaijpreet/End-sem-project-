import Syllabus from '../models/Syllabus.js';

export const getSyllabi = async (req, res) => {
  try {
    const syllabi = await Syllabus.find({ UserID: req.user._id }).sort('Subject');
    res.json({ success: true, data: syllabi });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const upsertSyllabus = async (req, res) => {
  try {
    const { Subject, Semester, Topics } = req.body;
    const syllabus = await Syllabus.findOneAndUpdate(
      { UserID: req.user._id, Subject, Semester },
      { Topics },
      { upsert: true, new: true }
    );
    res.json({ success: true, data: syllabus });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const toggleTopic = async (req, res) => {
  try {
    const syllabus = await Syllabus.findById(req.params.id);
    if (!syllabus) return res.status(404).json({ success: false, message: 'Syllabus not found' });
    if (syllabus.UserID.toString() !== req.user._id.toString())
      return res.status(403).json({ success: false, message: 'Not authorized' });
    const topic = syllabus.Topics.id(req.params.topicId);
    if (!topic) return res.status(404).json({ success: false, message: 'Topic not found' });
    topic.Done = !topic.Done;
    await syllabus.save();
    res.json({ success: true, data: syllabus });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteSyllabus = async (req, res) => {
  try {
    await Syllabus.findOneAndDelete({ _id: req.params.id, UserID: req.user._id });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
