import { useEffect, useState } from 'react';
import { ClipboardList, Plus, Trash2, CheckCircle, Clock, AlertTriangle, X } from 'lucide-react';

const KEY = 'saar_assignments';
const load = () => { try { return JSON.parse(localStorage.getItem(KEY)) || []; } catch { return []; } };
const save = (d) => localStorage.setItem(KEY, JSON.stringify(d));

const SUBJECTS = ['Computer Science','Physics','Chemistry','Mathematics','Economics','History','Biology','Other'];
const TYPES = ['Assignment','Project','Quiz','Lab','Presentation','Other'];
const PRIORITIES = ['High','Medium','Low'];

const PRIORITY_COLORS = {
  High:   'bg-rose-100 text-rose-700 border-rose-200',
  Medium: 'bg-amber-100 text-amber-700 border-amber-200',
  Low:    'bg-emerald-100 text-emerald-700 border-emerald-200',
};

export default function AssignmentTracker() {
  const [assignments, setAssignments] = useState(load);
  const [showAdd, setShowAdd] = useState(false);
  const [filter, setFilter] = useState('all'); // all | pending | done
  const [form, setForm] = useState({ title: '', subject: '', type: 'Assignment', dueDate: '', priority: 'Medium', notes: '' });

  useEffect(() => { save(assignments); }, [assignments]);

  function addAssignment(e) {
    e.preventDefault();
    setAssignments((a) => [...a, { ...form, id: Date.now(), done: false, createdAt: new Date().toISOString() }]);
    setForm({ title: '', subject: '', type: 'Assignment', dueDate: '', priority: 'Medium', notes: '' });
    setShowAdd(false);
  }

  function toggle(id) { setAssignments((a) => a.map((x) => x.id === id ? { ...x, done: !x.done } : x)); }
  function remove(id) { setAssignments((a) => a.filter((x) => x.id !== id)); }

  function daysLeft(dueDate) {
    if (!dueDate) return null;
    const diff = Math.ceil((new Date(dueDate) - new Date()) / (1000 * 60 * 60 * 24));
    return diff;
  }

  function dueLabel(days) {
    if (days === null) return null;
    if (days < 0) return { text: 'Overdue', cls: 'text-rose-600 font-bold' };
    if (days === 0) return { text: 'Due today!', cls: 'text-rose-500 font-bold' };
    if (days === 1) return { text: 'Due tomorrow', cls: 'text-amber-600 font-semibold' };
    return { text: `${days} days left`, cls: days <= 3 ? 'text-amber-500' : 'text-ink-800' };
  }

  const filtered = assignments
    .filter((a) => filter === 'all' ? true : filter === 'done' ? a.done : !a.done)
    .sort((a, b) => {
      if (a.done !== b.done) return a.done ? 1 : -1;
      if (a.dueDate && b.dueDate) return new Date(a.dueDate) - new Date(b.dueDate);
      return 0;
    });

  const pending = assignments.filter((a) => !a.done).length;
  const overdue = assignments.filter((a) => !a.done && a.dueDate && daysLeft(a.dueDate) < 0).length;

  return (
    <div className="flex-1 bg-parchment-50 py-8 min-h-[calc(100vh-4rem)]">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">

        <div className="flex items-center justify-between mb-8 animate-fade-up">
          <div className="flex items-center gap-3">
            <ClipboardList className="h-7 w-7 text-accent-primary" />
            <div>
              <h1 className="text-2xl font-bold text-ink-900">Assignment Tracker</h1>
              <p className="text-ink-800 text-sm">Never miss a deadline again.</p>
            </div>
          </div>
          <button onClick={() => setShowAdd(true)} className="flex items-center gap-2 px-4 py-2 bg-accent-primary text-white rounded-lg text-sm font-semibold hover:bg-accent-hover btn-glow">
            <Plus className="h-4 w-4" /> Add
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[
            { label: 'Pending', val: pending, color: 'text-amber-600', bg: 'bg-amber-50 border-amber-200' },
            { label: 'Overdue', val: overdue, color: 'text-rose-600', bg: 'bg-rose-50 border-rose-200' },
            { label: 'Completed', val: assignments.filter((a) => a.done).length, color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-200' },
          ].map(({ label, val, color, bg }) => (
            <div key={label} className={`rounded-xl border p-4 text-center ${bg}`}>
              <div className={`text-2xl font-extrabold ${color}`}>{val}</div>
              <div className="text-xs text-ink-800 mt-0.5">{label}</div>
            </div>
          ))}
        </div>

        {/* Filter tabs */}
        <div className="flex gap-1 border-b border-parchment-200 mb-5">
          {['all','pending','done'].map((f) => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors capitalize ${filter === f ? 'border-accent-primary text-accent-primary' : 'border-transparent text-ink-800 hover:text-ink-900'}`}>
              {f}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-16">
            <ClipboardList className="h-12 w-12 text-slate-300 mx-auto mb-3" />
            <p className="text-ink-800">No assignments here. Add one!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((a) => {
              const days = daysLeft(a.dueDate);
              const due = dueLabel(days);
              return (
                <div key={a.id} className={`bg-white rounded-xl border border-parchment-200 shadow-sm p-4 flex gap-4 transition-opacity ${a.done ? 'opacity-60' : ''}`}>
                  <button onClick={() => toggle(a.id)} className="shrink-0 mt-0.5">
                    <CheckCircle className={`h-5 w-5 transition-colors ${a.done ? 'text-emerald-500 fill-emerald-500' : 'text-slate-300 hover:text-emerald-400'}`} />
                  </button>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className={`font-semibold text-ink-900 ${a.done ? 'line-through text-slate-400' : ''}`}>{a.title}</p>
                      <button onClick={() => remove(a.id)} className="text-slate-400 hover:text-rose-500 shrink-0"><Trash2 className="h-4 w-4" /></button>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-1.5">
                      {a.subject && <span className="text-xs bg-indigo-100 text-accent-primary px-2 py-0.5 rounded-full">{a.subject}</span>}
                      <span className="text-xs bg-parchment-100 text-ink-800 px-2 py-0.5 rounded-full">{a.type}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full border ${PRIORITY_COLORS[a.priority]}`}>{a.priority}</span>
                    </div>
                    <div className="flex items-center gap-3 mt-2">
                      {due && !a.done && (
                        <span className={`text-xs flex items-center gap-1 ${due.cls}`}>
                          {days < 0 ? <AlertTriangle className="h-3.5 w-3.5" /> : <Clock className="h-3.5 w-3.5" />}
                          {due.text}
                        </span>
                      )}
                      {a.dueDate && <span className="text-xs text-slate-400">{new Date(a.dueDate).toLocaleDateString()}</span>}
                    </div>
                    {a.notes && <p className="text-xs text-slate-400 mt-1 italic">{a.notes}</p>}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add modal */}
      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-lg font-bold text-ink-900">Add Assignment</h2>
              <button onClick={() => setShowAdd(false)} className="text-slate-400 hover:text-ink-900"><X className="h-5 w-5" /></button>
            </div>
            <form onSubmit={addAssignment} className="space-y-3">
              <input required value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                placeholder="Assignment title" className="w-full border border-parchment-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-accent-primary" />
              <div className="grid grid-cols-2 gap-3">
                <select value={form.subject} onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))}
                  className="border border-parchment-300 rounded-lg px-3 py-2 text-sm bg-white">
                  <option value="">Subject</option>
                  {SUBJECTS.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
                <select value={form.type} onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}
                  className="border border-parchment-300 rounded-lg px-3 py-2 text-sm bg-white">
                  {TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
                <input type="date" value={form.dueDate} onChange={(e) => setForm((f) => ({ ...f, dueDate: e.target.value }))}
                  className="border border-parchment-300 rounded-lg px-3 py-2 text-sm" />
                <select value={form.priority} onChange={(e) => setForm((f) => ({ ...f, priority: e.target.value }))}
                  className="border border-parchment-300 rounded-lg px-3 py-2 text-sm bg-white">
                  {PRIORITIES.map((p) => <option key={p} value={p}>{p} Priority</option>)}
                </select>
              </div>
              <textarea value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                placeholder="Notes (optional)" rows={2}
                className="w-full border border-parchment-300 rounded-lg px-3 py-2 text-sm resize-none" />
              <div className="flex justify-end gap-2 pt-1">
                <button type="button" onClick={() => setShowAdd(false)} className="px-4 py-2 border border-parchment-300 rounded-lg text-sm text-ink-800">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-accent-primary text-white rounded-lg text-sm font-semibold hover:bg-accent-hover">Add</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
