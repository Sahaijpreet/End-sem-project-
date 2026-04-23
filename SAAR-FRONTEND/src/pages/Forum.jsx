import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { HelpCircle, Plus, Eye, CheckCircle, MessageSquare, X, ChevronUp } from 'lucide-react';
import { apiFetch } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useReveal } from '../hooks/useReveal';

const SUBJECTS = ['Computer Science','Physics','Chemistry','Mathematics','Economics','History','Biology','Other'];

export default function Forum() {
  const { isAuthenticated } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ Title: '', Body: '', Subject: '', Semester: '', Tags: '' });
  const [filter, setFilter] = useState({ subject: '', solved: '' });
  useReveal('.reveal, .reveal-left, .reveal-scale', [posts]);

  useEffect(() => {
    const q = new URLSearchParams();
    if (filter.subject) q.set('subject', filter.subject);
    if (filter.solved !== '') q.set('solved', filter.solved);
    apiFetch(`/api/forum?${q}`, { skipAuth: true })
      .then((r) => setPosts(r.success ? r.data : []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [filter]);

  async function handleCreate(e) {
    e.preventDefault();
    try {
      const payload = { ...form, Tags: form.Tags.split(',').map((t) => t.trim()).filter(Boolean) };
      const r = await apiFetch('/api/forum', { method: 'POST', body: JSON.stringify(payload) });
      toast('Doubt posted!');
      setShowCreate(false);
      navigate(`/forum/${r.data._id}`);
    } catch (err) { toast(err.message, 'error'); }
  }

  return (
    <div className="flex-1 bg-parchment-50 py-8 min-h-[calc(100vh-4rem)]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between mb-6 animate-fade-up">
          <div className="flex items-center gap-3">
            <HelpCircle className="h-7 w-7 text-accent-primary" />
            <div>
              <h1 className="text-2xl font-bold text-ink-900">Doubt Forum</h1>
              <p className="text-ink-800 text-sm">Ask questions, get answers from peers.</p>
            </div>
          </div>
          {isAuthenticated && (
            <button onClick={() => setShowCreate(true)}
              className="flex items-center gap-2 px-4 py-2 bg-accent-primary text-white rounded-lg text-sm font-semibold hover:bg-accent-hover btn-glow">
              <Plus className="h-4 w-4" /> Ask a Doubt
            </button>
          )}
        </div>

        {/* Filters */}
        <div className="flex gap-3 mb-6 flex-wrap">
          <select value={filter.subject} onChange={(e) => setFilter((f) => ({ ...f, subject: e.target.value }))}
            className="border border-parchment-300 rounded-lg px-3 py-2 text-sm bg-white text-ink-800">
            <option value="">All Subjects</option>
            {SUBJECTS.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <select value={filter.solved} onChange={(e) => setFilter((f) => ({ ...f, solved: e.target.value }))}
            className="border border-parchment-300 rounded-lg px-3 py-2 text-sm bg-white text-ink-800">
            <option value="">All</option>
            <option value="false">Unsolved</option>
            <option value="true">Solved</option>
          </select>
        </div>

        {loading ? <p className="text-ink-800">Loading…</p> : (
          <div className="space-y-3">
            {posts.length === 0 && <p className="text-ink-800">No doubts posted yet. Be the first!</p>}
            {posts.map((p, i) => (
              <Link key={p._id} to={`/forum/${p._id}`}
                className={`reveal delay-${Math.min(i * 100, 500)} card-hover block bg-white rounded-xl border border-parchment-200 p-5 shadow-sm`}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      {p.Solved && <span className="flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full"><CheckCircle className="h-3 w-3" /> Solved</span>}
                      <span className="text-xs bg-indigo-100 text-accent-primary px-2 py-0.5 rounded-full font-semibold">{p.Subject}</span>
                      {p.Semester && <span className="text-xs bg-parchment-100 text-ink-800 px-2 py-0.5 rounded-full">Sem {p.Semester}</span>}
                    </div>
                    <h3 className="font-bold text-ink-900 truncate">{p.Title}</h3>
                    <p className="text-sm text-ink-800 mt-1">By {p.AuthorID?.Name || 'Student'}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1 shrink-0 text-xs text-slate-400">
                    <span className="flex items-center gap-1"><MessageSquare className="h-3.5 w-3.5" />{p.Answers?.length ?? 0}</span>
                    <span className="flex items-center gap-1"><Eye className="h-3.5 w-3.5" />{p.Views}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-lg font-bold text-ink-900">Ask a Doubt</h2>
              <button onClick={() => setShowCreate(false)} className="text-slate-400 hover:text-ink-900"><X className="h-5 w-5" /></button>
            </div>
            <form onSubmit={handleCreate} className="space-y-3">
              <input required value={form.Title} onChange={(e) => setForm((f) => ({ ...f, Title: e.target.value }))}
                placeholder="Title — summarize your doubt" className="w-full border border-parchment-300 rounded-lg px-3 py-2 text-sm" />
              <textarea required value={form.Body} onChange={(e) => setForm((f) => ({ ...f, Body: e.target.value }))}
                placeholder="Describe your doubt in detail…" rows={4}
                className="w-full border border-parchment-300 rounded-lg px-3 py-2 text-sm resize-none" />
              <div className="grid grid-cols-2 gap-3">
                <select required value={form.Subject} onChange={(e) => setForm((f) => ({ ...f, Subject: e.target.value }))}
                  className="border border-parchment-300 rounded-lg px-3 py-2 text-sm bg-white">
                  <option value="">Subject</option>
                  {SUBJECTS.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
                <select value={form.Semester} onChange={(e) => setForm((f) => ({ ...f, Semester: e.target.value }))}
                  className="border border-parchment-300 rounded-lg px-3 py-2 text-sm bg-white">
                  <option value="">Semester (optional)</option>
                  {[1,2,3,4,5,6,7,8].map((s) => <option key={s} value={s}>Sem {s}</option>)}
                </select>
              </div>
              <input value={form.Tags} onChange={(e) => setForm((f) => ({ ...f, Tags: e.target.value }))}
                placeholder="Tags (comma separated, optional)" className="w-full border border-parchment-300 rounded-lg px-3 py-2 text-sm" />
              <div className="flex justify-end gap-2 pt-1">
                <button type="button" onClick={() => setShowCreate(false)} className="px-4 py-2 border border-parchment-300 rounded-lg text-sm text-ink-800">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-accent-primary text-white rounded-lg text-sm font-semibold">Post</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
