import { useEffect, useState } from 'react';
import { BookMarked, Plus, Trash2, Check, X, ChevronDown, ChevronUp } from 'lucide-react';
import { apiFetch } from '../lib/api';
import { useToast } from '../context/ToastContext';

const SUBJECTS = ['Computer Science','Physics','Chemistry','Mathematics','Economics','History','Biology','Other'];

export default function SyllabusTracker() {
  const toast = useToast();
  const [syllabi, setSyllabi] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [expanded, setExpanded] = useState({});
  const [form, setForm] = useState({ Subject: '', Semester: '', topicsText: '' });

  useEffect(() => {
    apiFetch('/api/syllabus')
      .then((r) => r.success && setSyllabi(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  async function addSyllabus(e) {
    e.preventDefault();
    const Topics = form.topicsText.split('\n').map((t) => t.trim()).filter(Boolean).map((Name) => ({ Name, Done: false }));
    if (!Topics.length) { toast('Add at least one topic', 'error'); return; }
    try {
      const r = await apiFetch('/api/syllabus', { method: 'POST', body: JSON.stringify({ Subject: form.Subject, Semester: form.Semester, Topics }) });
      setSyllabi((prev) => {
        const idx = prev.findIndex((s) => s._id === r.data._id);
        return idx >= 0 ? prev.map((s, i) => i === idx ? r.data : s) : [...prev, r.data];
      });
      setShowAdd(false);
      setForm({ Subject: '', Semester: '', topicsText: '' });
      toast('Syllabus saved!');
    } catch (e) { toast(e.message, 'error'); }
  }

  async function toggleTopic(syllabusId, topicId) {
    try {
      const r = await apiFetch(`/api/syllabus/${syllabusId}/topics/${topicId}`, { method: 'PATCH', body: JSON.stringify({}) });
      setSyllabi((prev) => prev.map((s) => s._id === syllabusId ? r.data : s));
    } catch (e) { toast(e.message, 'error'); }
  }

  async function deleteSyllabus(id) {
    try {
      await apiFetch(`/api/syllabus/${id}`, { method: 'DELETE' });
      setSyllabi((prev) => prev.filter((s) => s._id !== id));
      toast('Deleted.');
    } catch (e) { toast(e.message, 'error'); }
  }

  function progress(s) {
    if (!s.Topics.length) return 0;
    return Math.round((s.Topics.filter((t) => t.Done).length / s.Topics.length) * 100);
  }

  return (
    <div className="flex-1 bg-parchment-50 py-8 min-h-[calc(100vh-4rem)]">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between mb-8 animate-fade-up">
          <div className="flex items-center gap-3">
            <BookMarked className="h-7 w-7 text-accent-primary" />
            <div>
              <h1 className="text-2xl font-bold text-ink-900">Syllabus Tracker</h1>
              <p className="text-ink-800 text-sm">Track your topic completion per subject.</p>
            </div>
          </div>
          <button onClick={() => setShowAdd(true)} className="flex items-center gap-2 px-4 py-2 bg-accent-primary text-white rounded-lg text-sm font-semibold hover:bg-accent-hover btn-glow">
            <Plus className="h-4 w-4" /> Add Subject
          </button>
        </div>

        {loading ? <p className="text-ink-800">Loading…</p> : syllabi.length === 0 ? (
          <div className="text-center py-16">
            <BookMarked className="h-12 w-12 text-slate-300 mx-auto mb-3" />
            <p className="text-ink-800">No subjects tracked yet. Add one to get started.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {syllabi.map((s) => {
              const pct = progress(s);
              const isOpen = expanded[s._id];
              return (
                <div key={s._id} className="bg-white rounded-xl border border-parchment-200 shadow-sm overflow-hidden">
                  <div className="px-5 py-4 flex items-center gap-4 cursor-pointer" onClick={() => setExpanded((e) => ({ ...e, [s._id]: !e[s._id] }))}>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold text-ink-900">{s.Subject}</h3>
                        <span className="text-xs bg-parchment-100 text-ink-800 px-2 py-0.5 rounded-full">Sem {s.Semester}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex-1 h-2 bg-parchment-100 rounded-full overflow-hidden">
                          <div className="h-full bg-accent-primary rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
                        </div>
                        <span className="text-xs font-semibold text-ink-800 shrink-0">{pct}% ({s.Topics.filter((t) => t.Done).length}/{s.Topics.length})</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={(e) => { e.stopPropagation(); deleteSyllabus(s._id); }} className="text-slate-400 hover:text-rose-500"><Trash2 className="h-4 w-4" /></button>
                      {isOpen ? <ChevronUp className="h-4 w-4 text-slate-400" /> : <ChevronDown className="h-4 w-4 text-slate-400" />}
                    </div>
                  </div>
                  {isOpen && (
                    <div className="border-t border-parchment-100 divide-y divide-parchment-100">
                      {s.Topics.map((t) => (
                        <div key={t._id} className="flex items-center gap-3 px-5 py-3 hover:bg-parchment-50 cursor-pointer" onClick={() => toggleTopic(s._id, t._id)}>
                          <div className={`w-5 h-5 rounded flex items-center justify-center border-2 transition-colors ${t.Done ? 'bg-accent-primary border-accent-primary' : 'border-parchment-300'}`}>
                            {t.Done && <Check className="h-3 w-3 text-white" />}
                          </div>
                          <span className={`text-sm ${t.Done ? 'line-through text-slate-400' : 'text-ink-900'}`}>{t.Name}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-lg font-bold text-ink-900">Add Subject</h2>
              <button onClick={() => setShowAdd(false)} className="text-slate-400 hover:text-ink-900"><X className="h-5 w-5" /></button>
            </div>
            <form onSubmit={addSyllabus} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <select required value={form.Subject} onChange={(e) => setForm((f) => ({ ...f, Subject: e.target.value }))}
                  className="border border-parchment-300 rounded-lg px-3 py-2 text-sm bg-white">
                  <option value="">Subject</option>
                  {SUBJECTS.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
                <select required value={form.Semester} onChange={(e) => setForm((f) => ({ ...f, Semester: e.target.value }))}
                  className="border border-parchment-300 rounded-lg px-3 py-2 text-sm bg-white">
                  <option value="">Semester</option>
                  {[1,2,3,4,5,6,7,8].map((s) => <option key={s} value={s}>Sem {s}</option>)}
                </select>
              </div>
              <textarea required value={form.topicsText} onChange={(e) => setForm((f) => ({ ...f, topicsText: e.target.value }))}
                placeholder="Enter topics, one per line&#10;e.g. Arrays&#10;Linked Lists&#10;Trees" rows={6}
                className="w-full border border-parchment-300 rounded-lg px-3 py-2 text-sm resize-none" />
              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => setShowAdd(false)} className="px-4 py-2 border border-parchment-300 rounded-lg text-sm text-ink-800">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-accent-primary text-white rounded-lg text-sm font-semibold">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
