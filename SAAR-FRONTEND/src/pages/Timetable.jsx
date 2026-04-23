import { useEffect, useRef, useState } from 'react';
import { Clock, Plus, Trash2, Save, Edit2, X, Upload, Image, ChevronDown } from 'lucide-react';
import { apiFetch, fileUrl } from '../lib/api';
import { useToast } from '../context/ToastContext';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const TYPES = ['Lecture', 'Lab', 'Tutorial', 'Other'];
const SUBJECTS = ['Computer Science', 'Physics', 'Chemistry', 'Mathematics', 'Economics', 'History', 'Biology', 'Other'];
const TYPE_COLORS = {
  Lecture:  'bg-indigo-100 text-indigo-700 border-indigo-200',
  Lab:      'bg-emerald-100 text-emerald-700 border-emerald-200',
  Tutorial: 'bg-amber-100 text-amber-700 border-amber-200',
  Other:    'bg-slate-100 text-slate-600 border-slate-200',
};

const emptySlot = () => ({ Day: 'Monday', StartTime: '09:00', EndTime: '10:00', Subject: '', Room: '', Type: 'Lecture' });

export default function Timetable() {
  const toast = useToast();
  const fileRef = useRef(null);
  const [slots, setSlots] = useState([]);
  const [imageUrl, setImageUrl] = useState('');   // uploaded timetable image
  const [saving, setSaving] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editSlots, setEditSlots] = useState([]);  // working copy inside modal
  const [imgPreview, setImgPreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [tab, setTab] = useState('schedule');      // 'schedule' | 'image'

  useEffect(() => {
    apiFetch('/api/timetable')
      .then((r) => {
        if (r.success) {
          setSlots(r.data.Slots || []);
          setImageUrl(r.data.ImageURL || '');
        }
      })
      .catch(() => {});
  }, []);

  /* ── open edit modal with a copy of current slots ── */
  function openEdit() {
    setEditSlots(slots.map((s) => ({ ...s })));
    setEditOpen(true);
  }

  function addEditSlot() { setEditSlots((s) => [...s, emptySlot()]); }
  function removeEditSlot(i) { setEditSlots((s) => s.filter((_, idx) => idx !== i)); }
  function updateEditSlot(i, field, val) {
    setEditSlots((s) => s.map((sl, idx) => idx === i ? { ...sl, [field]: val } : sl));
  }

  async function saveEdit() {
    setSaving(true);
    try {
      await apiFetch('/api/timetable', { method: 'PUT', body: JSON.stringify({ Slots: editSlots }) });
      setSlots(editSlots);
      setEditOpen(false);
      toast('Timetable saved!');
    } catch (e) { toast(e.message, 'error'); }
    finally { setSaving(false); }
  }

  /* ── image upload ── */
  function handleImageFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImgPreview(URL.createObjectURL(file));
  }

  async function uploadImage() {
    const file = fileRef.current?.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('timetable', file);
      const r = await apiFetch('/api/timetable/image', { method: 'POST', body: fd });
      setImageUrl(r.data.ImageURL);
      setImgPreview(null);
      if (fileRef.current) fileRef.current.value = '';
      toast('Timetable image uploaded!');
    } catch (e) { toast(e.message, 'error'); }
    finally { setUploading(false); }
  }

  const byDay = DAYS.map((day) => ({
    day,
    slots: slots.map((s, i) => ({ ...s, idx: i })).filter((s) => s.Day === day),
  })).filter((d) => d.slots.length > 0);

  const hasSchedule = slots.length > 0;
  const hasImage = !!imageUrl;

  return (
    <div className="flex-1 bg-parchment-50 min-h-[calc(100vh-4rem)] py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">

        {/* Header */}
        <div className="flex items-center justify-between mb-6 animate-fade-up">
          <div className="flex items-center gap-3">
            <Clock className="h-7 w-7 text-accent-primary" />
            <div>
              <h1 className="text-2xl font-bold text-ink-900">My Timetable</h1>
              <p className="text-ink-800 text-sm">Your weekly class schedule.</p>
            </div>
          </div>
          <button onClick={openEdit}
            className="flex items-center gap-2 px-4 py-2 bg-accent-primary text-white rounded-lg text-sm font-semibold hover:bg-accent-hover btn-glow transition-all">
            <Edit2 className="h-4 w-4" /> Edit Timetable
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 border-b border-parchment-200 mb-6">
          {['schedule', 'image'].map((t) => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors capitalize ${tab === t ? 'border-accent-primary text-accent-primary' : 'border-transparent text-ink-800 hover:text-ink-900'}`}>
              {t === 'schedule' ? 'Schedule View' : 'Image Upload'}
            </button>
          ))}
        </div>

        {/* ── SCHEDULE VIEW ── */}
        {tab === 'schedule' && (
          <>
            {!hasSchedule ? (
              <div className="text-center py-20">
                <Clock className="h-14 w-14 text-slate-300 mx-auto mb-4" />
                <p className="text-ink-900 font-semibold text-lg mb-1">No schedule yet</p>
                <p className="text-ink-800 text-sm mb-6">Click "Edit Timetable" to add your classes.</p>
                <button onClick={openEdit}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-accent-primary text-white rounded-lg text-sm font-semibold hover:bg-accent-hover btn-glow">
                  <Plus className="h-4 w-4" /> Add Classes
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {byDay.map(({ day, slots: daySlots }) => (
                  <div key={day} className="bg-white rounded-xl border border-parchment-200 shadow-sm overflow-hidden card-hover">
                    <div className="px-5 py-3 bg-parchment-50 border-b border-parchment-200 flex items-center justify-between">
                      <h3 className="font-bold text-ink-900">{day}</h3>
                      <span className="text-xs text-slate-400">{daySlots.length} class{daySlots.length !== 1 ? 'es' : ''}</span>
                    </div>
                    <div className="divide-y divide-parchment-100">
                      {daySlots.sort((a, b) => a.StartTime.localeCompare(b.StartTime)).map((slot) => (
                        <div key={slot.idx}
                          onClick={openEdit}
                          className="px-5 py-4 flex flex-wrap items-center gap-3 cursor-pointer hover:bg-parchment-50 transition-colors group">
                          <div className="flex items-center gap-1.5 w-32 shrink-0">
                            <Clock className="h-3.5 w-3.5 text-slate-400" />
                            <span className="text-sm font-semibold text-ink-900">{slot.StartTime}</span>
                            <span className="text-xs text-slate-400">–</span>
                            <span className="text-sm font-semibold text-ink-900">{slot.EndTime}</span>
                          </div>
                          <span className="text-sm font-medium text-ink-900 flex-1">{slot.Subject || <span className="text-slate-400 italic">No subject</span>}</span>
                          {slot.Room && (
                            <span className="text-xs text-slate-400 bg-parchment-100 px-2 py-0.5 rounded-full">{slot.Room}</span>
                          )}
                          <span className={`text-xs px-2.5 py-0.5 rounded-full font-semibold border ${TYPE_COLORS[slot.Type] || TYPE_COLORS.Other}`}>
                            {slot.Type}
                          </span>
                          <Edit2 className="h-3.5 w-3.5 text-slate-300 group-hover:text-accent-primary transition-colors shrink-0" />
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* ── IMAGE VIEW ── */}
        {tab === 'image' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl border border-parchment-200 shadow-sm p-6">
              <h3 className="font-bold text-ink-900 mb-1">Upload Timetable Photo</h3>
              <p className="text-sm text-ink-800 mb-4">Take a photo of your physical timetable and upload it here.</p>

              <label className="block cursor-pointer">
                <div className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center transition-colors ${imgPreview ? 'border-accent-primary/40 bg-parchment-50' : 'border-parchment-300 hover:border-accent-primary/50 hover:bg-parchment-50'}`}>
                  {imgPreview ? (
                    <img src={imgPreview} alt="preview" className="max-h-64 rounded-lg object-contain" />
                  ) : (
                    <>
                      <Image className="h-10 w-10 text-slate-300 mb-3" />
                      <p className="text-sm font-medium text-ink-900">Click to upload a photo</p>
                      <p className="text-xs text-slate-400 mt-1">JPG, PNG, WEBP up to 10MB</p>
                    </>
                  )}
                </div>
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImageFile} />
              </label>

              {imgPreview && (
                <div className="flex gap-2 mt-4">
                  <button onClick={uploadImage} disabled={uploading}
                    className="flex items-center gap-2 px-4 py-2 bg-accent-primary text-white rounded-lg text-sm font-semibold hover:bg-accent-hover disabled:opacity-50 btn-glow">
                    <Upload className="h-4 w-4" /> {uploading ? 'Uploading…' : 'Save Image'}
                  </button>
                  <button onClick={() => { setImgPreview(null); if (fileRef.current) fileRef.current.value = ''; }}
                    className="px-4 py-2 border border-parchment-300 rounded-lg text-sm text-ink-800 hover:bg-parchment-50">
                    Cancel
                  </button>
                </div>
              )}
            </div>

            {hasImage && !imgPreview && (
              <div className="bg-white rounded-xl border border-parchment-200 shadow-sm p-6">
                <h3 className="font-bold text-ink-900 mb-4">Your Uploaded Timetable</h3>
                <img src={fileUrl(imageUrl)} alt="timetable" className="w-full rounded-xl border border-parchment-200 object-contain max-h-[600px]" />
              </div>
            )}

            {!hasImage && !imgPreview && (
              <p className="text-center text-ink-800 text-sm py-8">No image uploaded yet.</p>
            )}
          </div>
        )}
      </div>

      {/* ── EDIT MODAL ── */}
      {editOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">

            {/* Modal header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-parchment-200 shrink-0">
              <h2 className="text-lg font-bold text-ink-900 flex items-center gap-2">
                <Edit2 className="h-5 w-5 text-accent-primary" /> Edit Timetable
              </h2>
              <button onClick={() => setEditOpen(false)} className="text-slate-400 hover:text-ink-900 transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal body */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr className="bg-parchment-50 text-xs font-bold text-ink-800 uppercase">
                      {['Day', 'Start', 'End', 'Subject', 'Room', 'Type', ''].map((h) => (
                        <th key={h} className="px-3 py-2.5 text-left whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-parchment-100">
                    {editSlots.map((slot, i) => (
                      <tr key={i} className="hover:bg-parchment-50 transition-colors">
                        <td className="px-3 py-2">
                          <select value={slot.Day} onChange={(e) => updateEditSlot(i, 'Day', e.target.value)}
                            className="border border-parchment-300 rounded-lg px-2 py-1.5 text-xs bg-white text-ink-900 focus:outline-none focus:ring-1 focus:ring-accent-primary">
                            {DAYS.map((d) => <option key={d} value={d}>{d}</option>)}
                          </select>
                        </td>
                        <td className="px-3 py-2">
                          <input type="time" value={slot.StartTime} onChange={(e) => updateEditSlot(i, 'StartTime', e.target.value)}
                            className="border border-parchment-300 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-accent-primary" />
                        </td>
                        <td className="px-3 py-2">
                          <input type="time" value={slot.EndTime} onChange={(e) => updateEditSlot(i, 'EndTime', e.target.value)}
                            className="border border-parchment-300 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-accent-primary" />
                        </td>
                        <td className="px-3 py-2">
                          <select value={slot.Subject} onChange={(e) => updateEditSlot(i, 'Subject', e.target.value)}
                            className="border border-parchment-300 rounded-lg px-2 py-1.5 text-xs bg-white text-ink-900 focus:outline-none focus:ring-1 focus:ring-accent-primary">
                            <option value="">Select subject</option>
                            {SUBJECTS.map((s) => <option key={s} value={s}>{s}</option>)}
                          </select>
                        </td>
                        <td className="px-3 py-2">
                          <input value={slot.Room} onChange={(e) => updateEditSlot(i, 'Room', e.target.value)}
                            placeholder="Room" className="border border-parchment-300 rounded-lg px-2 py-1.5 text-xs w-20 focus:outline-none focus:ring-1 focus:ring-accent-primary" />
                        </td>
                        <td className="px-3 py-2">
                          <select value={slot.Type} onChange={(e) => updateEditSlot(i, 'Type', e.target.value)}
                            className="border border-parchment-300 rounded-lg px-2 py-1.5 text-xs bg-white text-ink-900 focus:outline-none focus:ring-1 focus:ring-accent-primary">
                            {TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                          </select>
                        </td>
                        <td className="px-3 py-2">
                          <button onClick={() => removeEditSlot(i)} className="text-slate-400 hover:text-rose-500 transition-colors">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {editSlots.length === 0 && (
                  <p className="text-center text-ink-800 text-sm py-8">No slots yet. Click "Add Slot" below.</p>
                )}
              </div>
            </div>

            {/* Modal footer */}
            <div className="flex items-center justify-between px-6 py-4 border-t border-parchment-200 shrink-0 bg-parchment-50 rounded-b-2xl">
              <button onClick={addEditSlot}
                className="flex items-center gap-2 px-4 py-2 border border-parchment-300 rounded-lg text-sm text-ink-800 hover:bg-white bg-white transition-colors">
                <Plus className="h-4 w-4" /> Add Slot
              </button>
              <div className="flex gap-2">
                <button onClick={() => setEditOpen(false)}
                  className="px-4 py-2 border border-parchment-300 rounded-lg text-sm text-ink-800 hover:bg-white transition-colors">
                  Cancel
                </button>
                <button onClick={saveEdit} disabled={saving}
                  className="flex items-center gap-2 px-5 py-2 bg-accent-primary text-white rounded-lg text-sm font-semibold hover:bg-accent-hover disabled:opacity-50 btn-glow transition-all">
                  <Save className="h-4 w-4" /> {saving ? 'Saving…' : 'Save Changes'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
