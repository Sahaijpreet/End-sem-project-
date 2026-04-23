import { useEffect, useState } from 'react';
import { CheckSquare, XSquare, Plus, Trash2, AlertTriangle, CheckCircle } from 'lucide-react';

const KEY = 'saar_attendance';
const load = () => { try { return JSON.parse(localStorage.getItem(KEY)) || []; } catch { return []; } };
const save = (d) => localStorage.setItem(KEY, JSON.stringify(d));

const emptySubject = (name = '') => ({ id: Date.now(), name, present: 0, absent: 0, target: 75 });

export default function AttendanceTracker() {
  const [subjects, setSubjects] = useState(load);
  const [newName, setNewName] = useState('');

  useEffect(() => { save(subjects); }, [subjects]);

  function addSubject(e) {
    e.preventDefault();
    if (!newName.trim()) return;
    setSubjects((s) => [...s, emptySubject(newName.trim())]);
    setNewName('');
  }

  function mark(id, type) {
    setSubjects((s) => s.map((sub) => sub.id === id ? { ...sub, [type]: sub[type] + 1 } : sub));
  }

  function unmark(id, type) {
    setSubjects((s) => s.map((sub) => sub.id === id ? { ...sub, [type]: Math.max(0, sub[type] - 1) } : sub));
  }

  function remove(id) { setSubjects((s) => s.filter((sub) => sub.id !== id)); }

  function updateTarget(id, val) {
    setSubjects((s) => s.map((sub) => sub.id === id ? { ...sub, target: Number(val) } : sub));
  }

  function pct(sub) {
    const total = sub.present + sub.absent;
    return total ? Math.round((sub.present / total) * 100) : null;
  }

  function classesNeeded(sub) {
    const { present, absent, target } = sub;
    const total = present + absent;
    const currentPct = total ? (present / total) * 100 : 0;
    if (currentPct >= target) return null;
    // x = classes needed: (present + x) / (total + x) >= target/100
    const x = Math.ceil((target * total / 100 - present) / (1 - target / 100));
    return x > 0 ? x : 0;
  }

  function canBunk(sub) {
    const { present, absent, target } = sub;
    const total = present + absent;
    if (!total) return 0;
    // max bunks: present / (total + x) >= target/100
    const x = Math.floor((present * 100 / target) - total);
    return x > 0 ? x : 0;
  }

  const overall = subjects.length ? Math.round(subjects.reduce((a, s) => a + (pct(s) ?? 0), 0) / subjects.length) : null;

  return (
    <div className="flex-1 bg-parchment-50 py-8 min-h-[calc(100vh-4rem)]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">

        <div className="flex items-center gap-3 mb-8 animate-fade-up">
          <CheckSquare className="h-7 w-7 text-accent-primary" />
          <div>
            <h1 className="text-2xl font-bold text-ink-900">Attendance Tracker</h1>
            <p className="text-ink-800 text-sm">Track your attendance and stay above the required percentage.</p>
          </div>
        </div>

        {/* Overall */}
        {overall !== null && (
          <div className="bg-white rounded-2xl border border-parchment-200 shadow-sm p-5 mb-6 flex items-center gap-4">
            <div className={`text-4xl font-extrabold ${overall >= 75 ? 'text-emerald-600' : 'text-rose-600'}`}>{overall}%</div>
            <div>
              <p className="font-semibold text-ink-900">Overall Attendance</p>
              <p className="text-sm text-ink-800">{overall >= 75 ? '✅ You are safe!' : '⚠️ Below required attendance'}</p>
            </div>
          </div>
        )}

        {/* Add subject */}
        <form onSubmit={addSubject} className="flex gap-3 mb-6">
          <input value={newName} onChange={(e) => setNewName(e.target.value)}
            placeholder="Subject name (e.g. Data Structures)"
            className="flex-1 border border-parchment-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-accent-primary bg-white" />
          <button type="submit" className="flex items-center gap-2 px-4 py-2.5 bg-accent-primary text-white rounded-lg text-sm font-semibold hover:bg-accent-hover btn-glow">
            <Plus className="h-4 w-4" /> Add
          </button>
        </form>

        {subjects.length === 0 ? (
          <div className="text-center py-16">
            <CheckSquare className="h-12 w-12 text-slate-300 mx-auto mb-3" />
            <p className="text-ink-800">No subjects yet. Add one to start tracking.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {subjects.map((sub) => {
              const p = pct(sub);
              const needed = classesNeeded(sub);
              const bunk = canBunk(sub);
              const safe = p !== null && p >= sub.target;
              return (
                <div key={sub.id} className="bg-white rounded-xl border border-parchment-200 shadow-sm p-5">
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div className="flex-1">
                      <h3 className="font-bold text-ink-900">{sub.name}</h3>
                      <div className="flex items-center gap-3 mt-1 text-xs text-ink-800">
                        <span className="text-emerald-600 font-semibold">{sub.present} present</span>
                        <span className="text-rose-500 font-semibold">{sub.absent} absent</span>
                        <span>{sub.present + sub.absent} total</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-ink-800">Target:</span>
                      <select value={sub.target} onChange={(e) => updateTarget(sub.id, e.target.value)}
                        className="border border-parchment-300 rounded px-2 py-1 text-xs bg-white">
                        {[60,65,70,75,80,85,90].map((t) => <option key={t} value={t}>{t}%</option>)}
                      </select>
                      <button onClick={() => remove(sub.id)} className="text-slate-400 hover:text-rose-500"><Trash2 className="h-4 w-4" /></button>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="mb-4">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-ink-800">Attendance</span>
                      <span className={`font-bold ${safe ? 'text-emerald-600' : 'text-rose-500'}`}>{p !== null ? `${p}%` : 'No data'}</span>
                    </div>
                    <div className="h-2.5 bg-parchment-100 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full transition-all duration-500 ${safe ? 'bg-emerald-500' : 'bg-rose-500'}`}
                        style={{ width: `${p ?? 0}%` }} />
                    </div>
                    <div className="h-0 relative">
                      <div className="absolute top-0 w-px h-2.5 bg-amber-500 -translate-y-2.5" style={{ left: `${sub.target}%` }} />
                    </div>
                  </div>

                  {/* Status */}
                  {p !== null && (
                    <div className={`text-xs font-medium mb-4 flex items-center gap-1.5 ${safe ? 'text-emerald-600' : 'text-amber-600'}`}>
                      {safe ? <><CheckCircle className="h-3.5 w-3.5" /> You can bunk {bunk} more class{bunk !== 1 ? 'es' : ''}</> :
                        <><AlertTriangle className="h-3.5 w-3.5" /> Attend {needed} more class{needed !== 1 ? 'es' : ''} to reach {sub.target}%</>}
                    </div>
                  )}

                  {/* Buttons */}
                  <div className="flex gap-2">
                    <button onClick={() => mark(sub.id, 'present')}
                      className="flex-1 flex items-center justify-center gap-2 py-2 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-lg text-sm font-semibold hover:bg-emerald-100 transition-colors">
                      <CheckSquare className="h-4 w-4" /> Present
                    </button>
                    <button onClick={() => mark(sub.id, 'absent')}
                      className="flex-1 flex items-center justify-center gap-2 py-2 bg-rose-50 border border-rose-200 text-rose-600 rounded-lg text-sm font-semibold hover:bg-rose-100 transition-colors">
                      <XSquare className="h-4 w-4" /> Absent
                    </button>
                    <button onClick={() => unmark(sub.id, 'present')} className="px-3 py-2 border border-parchment-300 rounded-lg text-xs text-ink-800 hover:bg-parchment-100" title="Undo present">↩P</button>
                    <button onClick={() => unmark(sub.id, 'absent')} className="px-3 py-2 border border-parchment-300 rounded-lg text-xs text-ink-800 hover:bg-parchment-100" title="Undo absent">↩A</button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
