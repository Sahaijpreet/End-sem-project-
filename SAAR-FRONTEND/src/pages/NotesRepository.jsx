import { useEffect, useMemo, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Search, Filter, Eye, ChevronDown, ThumbsUp } from 'lucide-react';
import { apiFetch, fileUrl } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const SUBJECTS = ['Computer Science', 'Physics', 'Chemistry', 'Mathematics', 'Economics', 'History', 'Biology', 'Other'];

export default function NotesRepository() {
  const { isAuthenticated, user } = useAuth();
  const toast = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQ = searchParams.get('q') || '';
  const [searchTerm, setSearchTerm] = useState(initialQ);
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterSubjects, setFilterSubjects] = useState(new Set());
  const [filterSemesters, setFilterSemesters] = useState(new Set());
  const [likingId, setLikingId] = useState(null);

  useEffect(() => {
    setSearchTerm(initialQ);
  }, [initialQ]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError('');
    apiFetch('/api/notes', { skipAuth: true })
      .then((res) => {
        if (cancelled) return;
        if (res.success && Array.isArray(res.data)) setNotes(res.data);
        else setNotes([]);
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err.message || 'Failed to load notes');
          setNotes([]);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  const filtered = useMemo(() => {
    const q = searchTerm.toLowerCase();
    return notes.filter((n) => {
      const title = (n.Title || '').toLowerCase();
      const subject = n.Subject || '';
      const sem = String(n.Semester ?? '');
      const matchQ = !q || title.includes(q) || subject.toLowerCase().includes(q);
      const matchSub = filterSubjects.size === 0 || filterSubjects.has(subject);
      const matchSem = filterSemesters.size === 0 || filterSemesters.has(sem);
      return matchQ && matchSub && matchSem;
    });
  }, [notes, searchTerm, filterSubjects, filterSemesters]);

  function toggleSubject(s) {
    setFilterSubjects((prev) => {
      const next = new Set(prev);
      if (next.has(s)) next.delete(s);
      else next.add(s);
      return next;
    });
  }

  function toggleSemester(sem) {
    setFilterSemesters((prev) => {
      const next = new Set(prev);
      if (next.has(sem)) next.delete(sem);
      else next.add(sem);
      return next;
    });
  }

  async function handleLike(noteId) {
    if (!isAuthenticated) { toast('Log in to like notes.', 'error'); return; }
    setLikingId(noteId);
    try {
      const res = await apiFetch(`/api/notes/${noteId}/like`, { method: 'POST', body: JSON.stringify({}) });
      setNotes((prev) => prev.map((n) =>
        n._id === noteId ? { ...n, Likes: Array(res.data.likes).fill(null), _liked: res.data.liked } : n
      ));
      toast(res.data.liked ? 'Note liked!' : 'Like removed.');
    } catch (e) {
      toast(e.message || 'Failed to like note.', 'error');
    } finally {
      setLikingId(null);
    }
  }

  return (
    <div className="flex-1 bg-parchment-50 min-h-[calc(100vh-4rem)] flex flex-col md:flex-row">

      <aside className="w-full md:w-64 lg:w-72 bg-white border-r border-parchment-200 flex-shrink-0">
        <div className="p-6 sticky top-0 h-full max-h-screen overflow-y-auto">
          <div className="flex items-center gap-2 mb-6 text-ink-900">
            <Filter className="h-5 w-5" />
            <h2 className="text-lg font-bold">Filters</h2>
          </div>

          <div className="mb-6">
            <h3 className="text-sm font-semibold text-ink-900 mb-3 flex justify-between items-center cursor-pointer">
              Subject <ChevronDown className="h-4 w-4 text-slate-400" />
            </h3>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {SUBJECTS.map((subject) => (
                <label key={subject} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={filterSubjects.has(subject)}
                    onChange={() => toggleSubject(subject)}
                    className="rounded border-parchment-300 text-accent-primary focus:ring-indigo-500"
                  />
                  <span className="ml-2 text-sm text-ink-800">{subject}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="mb-6">
            <h3 className="text-sm font-semibold text-ink-900 mb-3 flex justify-between items-center cursor-pointer">
              Semester <ChevronDown className="h-4 w-4 text-slate-400" />
            </h3>
            <div className="space-y-2">
              {['1', '2', '3', '4', '5', '6', '7', '8'].map((sem) => (
                <label key={sem} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={filterSemesters.has(sem)}
                    onChange={() => toggleSemester(sem)}
                    className="rounded border-parchment-300 text-accent-primary focus:ring-indigo-500"
                  />
                  <span className="ml-2 text-sm text-ink-800">Semester {sem}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </aside>

      <main className="flex-1 p-6 lg:p-8">

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-ink-900">Notes Repository</h1>
            <p className="text-ink-800 text-sm mt-1">Browse notes shared by your peers.</p>
          </div>
          <div className="relative w-full md:w-96">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-slate-400" />
            </div>
            <input
              type="text"
              placeholder="Search notes by title or subject..."
              value={searchTerm}
              onChange={(e) => {
                const v = e.target.value;
                setSearchTerm(v);
                setSearchParams(v ? { q: v } : {});
              }}
              className="block w-full pl-10 pr-3 py-2 border border-parchment-300 rounded-lg leading-5 bg-white placeholder-slate-500 focus:outline-none focus:placeholder-slate-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm shadow-sm"
            />
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-sm">{error}</div>
        )}

        <div className="mb-6 flex items-center justify-between text-sm text-ink-800">
          <span>{loading ? 'Loading…' : `Showing ${filtered.length} results`}</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {!loading && filtered.length === 0 && (
            <p className="text-ink-800 col-span-full">No notes match your filters yet. Try uploading one.</p>
          )}
          {filtered.map((note) => {
            const uploader = note.UploaderID?.Name || 'Student';
            const pdfHref = fileUrl(note.FileURL);
            return (
              <div key={note._id} className="bg-white rounded-xl shadow-sm border border-parchment-200 overflow-hidden hover:shadow-md transition-shadow group flex flex-col">
                {note.CoverImage ? (
                  <div className="h-44 w-full overflow-hidden">
                    <img src={fileUrl(note.CoverImage)} alt="cover" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  </div>
                ) : null}
                <div className="p-3 flex-1">
                  <div className="flex justify-between items-start mb-2">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-accent-primary">
                      {note.Subject}
                    </span>
                    <span className="text-xs font-semibold text-slate-400">Sem {note.Semester}</span>
                  </div>
                  <h3 className="text-sm font-bold text-ink-900 mb-1 line-clamp-2" title={note.Title}>
                    {note.Title}
                  </h3>
                  <p className="text-xs text-ink-800">By {uploader}</p>
                </div>
                <div className="bg-parchment-50 px-3 py-2 border-t border-parchment-200 mt-auto flex gap-2">
                  <a
                    href={pdfHref}
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 flex items-center justify-center gap-2 py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-lg text-white bg-accent-primary hover:bg-accent-hover focus:outline-none transition-colors"
                  >
                    <Eye className="h-4 w-4" />
                    Open PDF
                  </a>
                  <Link
                    to="/ai-summary"
                    state={{ noteId: note._id }}
                    className="flex items-center justify-center py-2 px-3 border border-parchment-300 rounded-lg text-sm font-medium text-ink-900 bg-white hover:bg-parchment-50"
                  >
                    AI
                  </Link>
                  <button
                    type="button"
                    disabled={likingId === note._id}
                    onClick={() => handleLike(note._id)}
                    className={`flex items-center justify-center gap-1 py-2 px-3 border rounded-lg text-sm font-medium transition-colors ${
                      note._liked ? 'bg-indigo-100 border-indigo-300 text-accent-primary' : 'border-parchment-300 text-ink-800 bg-white hover:bg-parchment-50'
                    }`}
                  >
                    <ThumbsUp className="h-4 w-4" />
                    {note.Likes?.length ?? 0}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

      </main>
    </div>
  );
}
