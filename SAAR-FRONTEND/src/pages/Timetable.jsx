import { useEffect, useState } from 'react';
import { Clock, Plus, Trash2, Save } from 'lucide-react';
import { apiFetch } from '../lib/api';
import { useToast } from '../context/ToastContext';

const DAYS = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];
const TYPES = ['Lecture','Lab','Tutorial','Other'];
const SUBJECTS = ['Computer Science','Physics','Chemistry','Mathematics','Economics','History','Biology','Other'];

const emptySlot = () => ({ Day: 'Monday', StartTime: '09:00', EndTime: '10:00', Subject: '', Room: '', Type: 'Lecture' });

export default function Timetable() {
  const toast = useToast();
  const [slots, setSlots] = useState([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    apiFetch('/api/timetable')
      .then((r) => r.success && setSlots(r.data.Slots || []))
      .catch(() => {});
  }, []);

  function addSlot() { setSlots((s) => [...s, emptySlot()]); }
  function removeSlot(i) { setSlots((s) => s.filter((_, idx) => idx !== i)); }
  function updateSlot(i, field, val) { setSlots((s) => s.map((sl, idx) => idx === i ? { ...sl, [field]: val } : sl)); }

  async function save() {
    setSaving(true);
    try {
      await apiFetch('/api/timetable', { method: 'PUT', body: JSON.stringify({ Slots: slots }) });
      toast('Timetable saved!');
    } catch (e) { toast(e.message, 'error'); }
    finally { setSaving(false); }
  }

  const byDay = DAYS.map((day) => ({ day, slots: slots.map((s, i) => ({ ...s, idx: i })).filter((s) => s.Day === day) }));

  return (
    <div className="flex-1 bg-parchment-50 py-8 min-h-[calc(100vh-4rem)]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between mb-8 animate-fade-up">
          <div className="flex items-center gap-3">
            <Clock className="h-7 w-7 text-accent-primary" />
            <div>
              <h1 className="text-2xl font-bold text-ink-900">My Timetable</h1>
              <p className="text-ink-800 text-sm">Manage your weekly class schedule.</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={addSlot} className="flex items-center gap-2 px-4 py-2 border border-parchment-300 rounded-lg text-sm text-ink-800 hover:bg-parchment-100 bg-white">
              <Plus className="h-4 w-4" /> Add Slot
            </button>
            <button onClick={save} disabled={saving} className="flex items-center gap-2 px-4 py-2 bg-accent-primary text-white rounded-lg text-sm font-semibold hover:bg-accent-hover disabled:opacity-50 btn-glow">
              <Save className="h-4 w-4" /> {saving ? 'Saving…' : 'Save'}
            </button>
          </div>
        </div>

        {/* Grid view */}
        <div className="space-y-4">
          {byDay.filter((d) => d.slots.length > 0).map(({ day, slots: daySlots }) => (
            <div key={day} className="bg-white rounded-xl border border-parchment-200 shadow-sm overflow-hidden">
              <div className="px-5 py-3 bg-parchment-50 border-b border-parchment-200">
                <h3 className="font-bold text-ink-900">{day}</h3>
              </div>
              <div className="divide-y divide-parchment-100">
                {daySlots.map((slot) => (
                  <div key={slot.idx} className="px-5 py-3 flex flex-wrap items-center gap-3">
                    <span className="text-sm font-semibold text-ink-900 w-32">{slot.StartTime} – {slot.EndTime}</span>
                    <span className="text-sm text-ink-900 flex-1">{slot.Subject}</span>
                    {slot.Room && <span className="text-xs text-slate-400">{slot.Room}</span>}
                    <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${slot.Type === 'Lab' ? 'bg-emerald-100 text-emerald-700' : slot.Type === 'Tutorial' ? 'bg-amber-100 text-amber-700' : 'bg-indigo-100 text-accent-primary'}`}>{slot.Type}</span>
                    <button onClick={() => removeSlot(slot.idx)} className="text-slate-400 hover:text-rose-500"><Trash2 className="h-4 w-4" /></button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Edit table */}
        {slots.length > 0 && (
          <div className="mt-8 bg-white rounded-xl border border-parchment-200 shadow-sm overflow-hidden">
            <div className="px-5 py-3 border-b border-parchment-200 bg-parchment-50">
              <h3 className="font-bold text-ink-900">Edit Slots</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-parchment-50 text-xs font-semibold text-ink-800 uppercase">
                  <tr>
                    {['Day','Start','End','Subject','Room','Type',''].map((h) => (
                      <th key={h} className="px-4 py-2 text-left">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-parchment-100">
                  {slots.map((slot, i) => (
                    <tr key={i}>
                      <td className="px-3 py-2">
                        <select value={slot.Day} onChange={(e) => updateSlot(i, 'Day', e.target.value)} className="border border-parchment-300 rounded px-2 py-1 text-xs bg-white">
                          {DAYS.map((d) => <option key={d} value={d}>{d}</option>)}
                        </select>
                      </td>
                      <td className="px-3 py-2"><input type="time" value={slot.StartTime} onChange={(e) => updateSlot(i, 'StartTime', e.target.value)} className="border border-parchment-300 rounded px-2 py-1 text-xs" /></td>
                      <td className="px-3 py-2"><input type="time" value={slot.EndTime} onChange={(e) => updateSlot(i, 'EndTime', e.target.value)} className="border border-parchment-300 rounded px-2 py-1 text-xs" /></td>
                      <td className="px-3 py-2">
                        <select value={slot.Subject} onChange={(e) => updateSlot(i, 'Subject', e.target.value)} className="border border-parchment-300 rounded px-2 py-1 text-xs bg-white">
                          <option value="">Select</option>
                          {SUBJECTS.map((s) => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </td>
                      <td className="px-3 py-2"><input value={slot.Room} onChange={(e) => updateSlot(i, 'Room', e.target.value)} placeholder="Room" className="border border-parchment-300 rounded px-2 py-1 text-xs w-20" /></td>
                      <td className="px-3 py-2">
                        <select value={slot.Type} onChange={(e) => updateSlot(i, 'Type', e.target.value)} className="border border-parchment-300 rounded px-2 py-1 text-xs bg-white">
                          {TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                        </select>
                      </td>
                      <td className="px-3 py-2"><button onClick={() => removeSlot(i)} className="text-slate-400 hover:text-rose-500"><Trash2 className="h-4 w-4" /></button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {slots.length === 0 && (
          <div className="text-center py-16">
            <Clock className="h-12 w-12 text-slate-300 mx-auto mb-3" />
            <p className="text-ink-800">No slots yet. Click "Add Slot" to build your timetable.</p>
          </div>
        )}
      </div>
    </div>
  );
}
