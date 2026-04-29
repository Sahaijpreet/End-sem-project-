import { useEffect, useMemo, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Search, Filter, ChevronDown, Download, Bookmark, BookmarkCheck, MessageSquare, X } from 'lucide-react';
import { apiFetch, fileUrl } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useReveal } from '../hooks/useReveal';
import StarRating from '../components/StarRating';
import Comments from '../components/Comments';

const SUBJECTS = ['Computer Science', 'Physics', 'Chemistry', 'Mathematics', 'Economics', 'History', 'Biology', 'Other'];

export default function NotesRepository() {
  const { isAuthenticated, user } = useAuth();
  const toast = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState(searchParams.get('q') || '');
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterSubjects, setFilterSubjects] = useState(new Set());
  const [filterSemesters, setFilterSemesters] = useState(new Set());
  const [bookmarks, setBookmarks] = useState(new Set());
  const [activeComment, setActiveComment] = useState(null);

  useReveal('.reveal, .reveal-left, .reveal-scale', [notes]);

  useEffect(() => { setSearchTerm(searchParams.get('q') || ''); }, [searchParams]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError('');
    const fetches = [apiFetch('/api/notes', { skipAuth: true })];
    if (isAuthenticated) fetches.push(apiFetch('/api/auth/bookmarks'));
    Promise.all(fetches)
      .then(([nRes, bmRes]) => {
        if (cancelled) return;
        setNotes(nRes.success && Array.isArray(nRes.data) ? nRes.data : []);
        if (bmRes?.success) {
          const ids = new Set(bmRes.data.notes?.map((n) => n._id) || []);
          setBookmarks(ids);
        }
      })
      .catch((err) => { if (!cancelled) { setError(err.message || 'Failed to load notes'); setNotes([]); } })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [isAuthenticated]);

  const filtered = useMemo(() => {
    const q = searchTerm.toLowerCase();
    return notes.filter((n) => {
      const matchQ = !q || (n.Title || '').toLowerCase().includes(q) || (n.Subject || '').toLowerCase().includes(q);
      const matchSub = filterSubjects.size === 0 || filterSubjects.has(n.Subject);
      const matchSem = filterSemesters.size === 0 || filterSemesters.has(String(n.Semester ?? ''));
      return matchQ && matchSub && matchSem;
    });
  }, [notes, searchTerm, filterSubjects, filterSemesters]);

  function toggleSubject(s) {
    setFilterSubjects((prev) => { const n = new Set(prev); n.has(s) ? n.delete(s) : n.add(s); return n; });
  }
  function toggleSemester(sem) {
    setFilterSemesters((prev) => { const n = new Set(prev); n.has(sem) ? n.delete(sem) : n.add(sem); return n; });
  }

  async function handleBookmark(noteId) {
    if (!isAuthenticated) { toast('Log in to bookmark.', 'error'); return; }
    try {
      const res = await apiFetch(`/api/auth/bookmarks/Note/${noteId}`, { method: 'POST', body: JSON.stringify({}) });
      setBookmarks((prev) => {
        const n = new Set(prev);
        res.data.bookmarked ? n.add(noteId) : n.delete(noteId);
        return n;
      });
      toast(res.data.bookmarked ? 'Bookmarked!' : 'Bookmark removed.');
    } catch (e) { toast(e.message || 'Failed to bookmark.', 'error'); }
  }

  function handleDownload(noteId, pdfHref) {
    apiFetch(`/api/notes/${noteId}/download`, { method: 'POST', body: JSON.stringify({}) }).catch(() => {});
    window.open(pdfHref, '_blank');
  }

  return (
    <div className="flex-1 bg-parchment-50 min-h-[calc(100vh-4rem)] flex flex-col md:flex-row">
      <aside className="w-full md:w-64 lg:w-72 bg-white border-r border-parchment-200 flex-shrink-0">
        <div className="p-6 sticky top-16 max-h-[calc(100vh-4rem)] overflow-y-auto">
          <div className="flex items-center gap-2 mb-6 text-ink-900">
            <Filter className="h-5 w-5" />
            <h2 className="text-lg font-bold">Filters</h2>
          </div>
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-ink-900 mb-3 flex justify-between items-center">
              Subject <ChevronDown className="h-4 w-4 text-slate-400" />
            </h3>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {SUBJECTS.map((s) => (
                <label key={s} className="flex items-center">
                  <input type="checkbox" checked={filterSubjects.has(s)} onChange={() => toggleSubject(s)}
                    className="rounded border-parchment-300 text-accent-primary focus:ring-indigo-500" />
                  <span className="ml-2 text-sm text-ink-800">{s}</span>
                </label>
              ))}
            </div>
          </div>
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-ink-900 mb-3 flex justify-between items-center">
              Semester <ChevronDown className="h-4 w-4 text-slate-400" />
            </h3>
            <div className="space-y-2">
              {['1','2','3','4','5','6','7','8'].map((sem) => (
                <label key={sem} className="flex items-center">
                  <input type="checkbox" checked={filterSemesters.has(sem)} onChange={() => toggleSemester(sem)}
                    className="rounded border-parchment-300 text-accent-primary focus:ring-indigo-500" />
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
            <input type="text" placeholder="Search notes by title or subject..." value={searchTerm}
              onChange={(e) => { const v = e.target.value; setSearchTerm(v); setSearchParams(v ? { q: v } : {}); }}
              className="block w-full pl-10 pr-3 py-2 border border-parchment-300 rounded-lg text-sm bg-white text-ink-900 focus:outline-none focus:ring-1 focus:ring-indigo-500 shadow-sm" />
          </div>
        </div>

        {error && <div className="mb-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-sm">{error}</div>}
        <div className="mb-6 text-sm text-ink-800">{loading ? 'Loading…' : `Showing ${filtered.length} results`}</div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {!loading && filtered.length === 0 && <p className="text-ink-800 col-span-full">No notes match your filters yet.</p>}
          {filtered.map((note, idx) => {
            const pdfHref = fileUrl(note.FileURL);
            const isBookmarked = bookmarks.has(note._id);
            return (
              <div key={note._id} className={`card-hover bg-white rounded-xl shadow-sm border border-parchment-200 overflow-hidden group flex flex-col`}>
                {note.CoverImage && (
                  <div className="h-44 w-full overflow-hidden">
                    <img src={fileUrl(note.CoverImage)} alt="cover" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  </div>
                )}
                <div className="p-3 flex-1">
                  <div className="flex justify-between items-start mb-2">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-accent-primary">{note.Subject}</span>
                    <span className="text-xs font-semibold text-slate-400">Sem {note.Semester}</span>
                  </div>
                  <h3 className="text-sm font-bold text-ink-900 mb-1 line-clamp-2">
                  <Link to={`/notes/${note._id}`} className="hover:text-accent-primary hover:underline">{note.Title}</Link>
                </h3>
                  <p className="text-xs text-ink-800 mb-2">
                    By {note.UploaderID?._id ? (
                      <Link to={`/user/${note.UploaderID._id}`} className="hover:text-accent-primary hover:underline font-medium">
                        {note.UploaderID.Name || 'Student'}
                      </Link>
                    ) : (
                      'Student'
                    )}
                  </p>
                  <StarRating resourceType="Note" resourceId={note._id} />
                  <div className="flex gap-3 mt-1 text-xs text-ink-800">
                    <span>{note.Downloads ?? 0} downloads</span>
                  </div>
                </div>
                <div className="bg-parchment-50 px-3 py-2 border-t border-parchment-200 mt-auto flex gap-1.5 flex-wrap">
                  {isAuthenticated ? (
                    <>
                      <button onClick={() => handleDownload(note._id, pdfHref)}
                        className="flex-1 flex items-center justify-center gap-1 py-2 px-3 text-sm font-medium rounded-lg text-white bg-accent-primary hover:bg-accent-hover transition-colors">
                        <Download className="h-4 w-4" /> Open
                      </button>
                      <Link to="/ai-summary" state={{ noteId: note._id }}
                        className="flex items-center justify-center py-2 px-3 border border-parchment-300 rounded-lg text-sm font-medium text-ink-900 bg-white hover:bg-parchment-50">
                        AI
                      </Link>
                      <button type="button" onClick={() => handleBookmark(note._id)}
                        className={`flex items-center justify-center py-2 px-3 border rounded-lg text-sm transition-colors ${isBookmarked ? 'bg-violet-100 border-violet-300 text-violet-600' : 'border-parchment-300 text-ink-800 bg-white hover:bg-parchment-50'}`}>
                        {isBookmarked ? <BookmarkCheck className="h-4 w-4" /> : <Bookmark className="h-4 w-4" />}
                      </button>
                      <button type="button" onClick={() => setActiveComment(activeComment === note._id ? null : note._id)}
                        className="flex items-center justify-center py-2 px-3 border border-parchment-300 rounded-lg text-sm text-ink-800 bg-white hover:bg-parchment-50">
                        <MessageSquare className="h-4 w-4" />
                      </button>
                    </>
                  ) : (
                    <Link to="/auth" state={{ mode: 'login' }}
                      className="flex-1 flex items-center justify-center gap-1 py-2 px-3 text-sm font-medium rounded-lg text-white bg-accent-primary hover:bg-accent-hover transition-colors">
                      Login to Access
                    </Link>
                  )}
                </div>
                {activeComment === note._id && isAuthenticated && (
                  <div className="px-4 pb-4 border-t border-parchment-100">
                    <div className="flex justify-end pt-2">
                      <button onClick={() => setActiveComment(null)} className="text-slate-400 hover:text-ink-900"><X className="h-4 w-4" /></button>
                    </div>
                    <Comments resourceType="Note" resourceId={note._id} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}
