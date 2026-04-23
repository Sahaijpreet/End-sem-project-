import mongoose from 'mongoose';

const SlotSchema = new mongoose.Schema({
  Day: { type: String, enum: ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'], required: true },
  StartTime: { type: String, required: true },
  EndTime: { type: String, required: true },
  Subject: { type: String, required: true },
  Room: { type: String, default: '' },
  Type: { type: String, enum: ['Lecture','Lab','Tutorial','Other'], default: 'Lecture' },
});

const TimetableSchema = new mongoose.Schema({
  UserID: { type: mongoose.Schema.ObjectId, ref: 'User', required: true, unique: true },
  Slots: [SlotSchema],
  ImageURL: { type: String, default: '' },
}, { timestamps: true });

const Timetable = mongoose.model('Timetable', TimetableSchema);
export default Timetable;
