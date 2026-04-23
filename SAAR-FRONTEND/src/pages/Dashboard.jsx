import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FileText, BookOpen, BookMarked, Shield, Download, Bookmark, Clock, HelpCircle, Users, Calculator, ClipboardList, Layers } from 'lucide-react';
import { apiFetch } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { useReveal } from '../hooks/useReveal';

export default function Dashboard() {
  const { user, isAdmin } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const notice = location.state?.notice;
  const [notes, setNotes] = useState([]);
  const [books, setBooks] = useState([]);
  const [bookmarks, setBookmarks] = useState({ notes: [], pyqs: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      apiFetch('/api/notes', { skipAuth: true }),
      apiFetch('/api/books', { skipAuth: true }),
      apiFetch('/api/auth/bookmarks'),
    ])
      .then(([nRes, bRes, bmRes]) => {
        if (cancelled) return;
        setNotes(nRes.success && Array.isArray(nRes.data) ? nRes.data : []);
        setBooks(bRes.success && Array.isArray(bRes.data) ? bRes.data : []);
        setBookmarks(bmRes.success ? bmRes.data : { notes: [], pyqs: [] });
      })
      .catch(() => { if (!cancelled) { setNotes([]); setBooks([]); } })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  const myNotes = useMemo(() => {
    const uid = user?._id;
    if (!uid) return [];
    return notes.filter((n) => {
      const up = n.UploaderID;
      const id = typeof up === 'object' && up?._id ? String(up._id) : String(up || '');
      return id === String(uid);
    });
  }, [notes, user]);

  const myListedBooks = useMemo(() => {
    const uid = user?._id;
    if (!uid) return [];
    return books.filter((b) => {
      const o = b.OwnerID;
      const id = typeof o === 'object' && o?._id ? String(o._id) : String(o || '');
      return id === String(uid);
    });
  }, [books, user]);

  useReveal();

  return (
    <div className="flex-1 bg-parchment-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {notice && (
          <div className="mb-6 p-4 rounded-lg border border-amber-200 bg-amber-50 text-amber-900 text-sm flex justify-between gap-4 items-start">
            <span>{notice}</span>
            <button
              type="button"
              onClick={() => navigate('/dashboard', { replace: true, state: {} })}
              className="shrink-0 text-amber-800 hover:text-ink-900 font-medium"
            >
              Dismiss
            </button>
          </div>
        )}

        <div className="mb-8 animate-fade-up">
          <h1 className="text-3xl font-bold text-ink-900">Student Dashboard</h1>
          <p className="text-ink-800 mt-2">
            Welcome back{user?.Name ? `, ${user.Name}` : ''}. Here is a snapshot of your activity on SAAR.
          </p>
          {isAdmin && (
            <p className="mt-3">
              <Link
                to="/admin"
                className="inline-flex items-center gap-2 text-sm font-medium text-accent-primary hover:underline"
              >
                <Shield className="h-4 w-4" /> Open admin dashboard
              </Link>
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8 reveal">
          <div className="bg-white rounded-xl shadow-sm border border-parchment-200 p-6 flex items-center">
            <div className="bg-indigo-100 text-accent-primary p-4 rounded-lg mr-4">
              <FileText className="h-6 w-6" />
            </div>
            <div>
              <div className="text-2xl font-bold text-ink-900">{loading ? '…' : myNotes.length}</div>
              <div className="text-sm text-ink-800 font-medium">Notes uploaded</div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-parchment-200 p-6 flex items-center">
            <div className="bg-amber-100 text-amber-600 p-4 rounded-lg mr-4">
              <BookOpen className="h-6 w-6" />
            </div>
            <div>
              <div className="text-2xl font-bold text-ink-900">{loading ? '…' : myListedBooks.length}</div>
              <div className="text-sm text-ink-800 font-medium">Books listed</div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-parchment-200 p-6 flex items-center">
            <div className="bg-violet-100 text-violet-600 p-4 rounded-lg mr-4">
              <Bookmark className="h-6 w-6" />
            </div>
            <div>
              <div className="text-2xl font-bold text-ink-900">{loading ? '…' : (bookmarks.notes?.length || 0) + (bookmarks.pyqs?.length || 0)}</div>
              <div className="text-sm text-ink-800 font-medium">Bookmarks</div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-parchment-200 p-6 flex items-center">
            <div className="bg-emerald-100 text-emerald-600 p-4 rounded-lg mr-4">
              <Download className="h-6 w-6" />
            </div>
            <div>
              <div className="text-2xl font-bold text-ink-900">{loading ? '…' : myNotes.reduce((s, n) => s + (n.Downloads || 0), 0)}</div>
              <div className="text-sm text-ink-800 font-medium">Total downloads</div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 reveal">
          <div className="bg-white rounded-xl shadow-sm border border-parchment-200 overflow-hidden">
            <div className="px-6 py-5 border-b border-parchment-200 flex justify-between items-center">
              <h2 className="text-lg font-bold text-ink-900 flex items-center gap-2">
                <FileText className="h-5 w-5 text-accent-primary" />
                Your uploads
              </h2>
              <Link to="/upload" className="text-sm text-accent-primary font-medium">Upload</Link>
            </div>
            <div className="divide-y divide-slate-100">
              {(loading ? [] : myNotes).slice(0, 8).map((note) => (
                <div key={note._id} className="p-4 flex justify-between items-center">
                  <div>
                    <h3 className="font-semibold text-ink-900">{note.Title}</h3>
                    <p className="text-sm text-ink-800">{note.Subject} · Sem {note.Semester}</p>
                  </div>
                </div>
              ))}
              {!loading && myNotes.length === 0 && (
                <p className="p-6 text-ink-800 text-sm">You have not uploaded any notes yet.</p>
              )}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-parchment-200 overflow-hidden">
            <div className="px-6 py-5 border-b border-parchment-200 flex justify-between items-center">
              <h2 className="text-lg font-bold text-ink-900 flex items-center gap-2">
                <BookMarked className="h-5 w-5 text-amber-500" />
                Your book listings
              </h2>
              <Link to="/book-exchange" className="text-sm text-accent-primary font-medium">Marketplace</Link>
            </div>
            <div className="p-6 space-y-4">
              {myListedBooks.slice(0, 6).map((book) => (
                <div key={book._id} className="border border-parchment-200 rounded-lg p-4">
                  <h3 className="font-semibold text-ink-900 text-sm line-clamp-1">{book.Title}</h3>
                  <span className="inline-block mt-2 px-2 py-1 text-xs font-medium rounded-full bg-parchment-100 text-ink-900">
                    {book.Status}
                  </span>
                </div>
              ))}
              {!loading && myListedBooks.length === 0 && (
                <p className="text-ink-800 text-sm">List a book from the marketplace page.</p>
              )}
            </div>
          </div>
        </div>

        {/* Quick access tools */}
        <div className="mt-8 reveal">
          <h2 className="text-lg font-bold text-ink-900 mb-4">Quick Access</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { to: '/timetable',   icon: <Clock         className="h-5 w-5" />, label: 'Timetable',          bg: 'bg-blue-100',   color: 'text-blue-600'   },
              { to: '/syllabus',    icon: <BookMarked    className="h-5 w-5" />, label: 'Syllabus Tracker',   bg: 'bg-emerald-100', color: 'text-emerald-600' },
              { to: '/groups',      icon: <Users         className="h-5 w-5" />, label: 'Study Groups',       bg: 'bg-violet-100', color: 'text-violet-600'  },
              { to: '/forum',       icon: <HelpCircle    className="h-5 w-5" />, label: 'Doubt Forum',        bg: 'bg-rose-100',   color: 'text-rose-600'   },
              { to: '/cgpa',        icon: <Calculator    className="h-5 w-5" />, label: 'CGPA Calculator',    bg: 'bg-amber-100',  color: 'text-amber-600'  },
              { to: '/attendance',  icon: <BookOpen      className="h-5 w-5" />, label: 'Attendance',         bg: 'bg-teal-100',   color: 'text-teal-600'   },
              { to: '/assignments', icon: <ClipboardList className="h-5 w-5" />, label: 'Assignments',        bg: 'bg-pink-100',   color: 'text-pink-600'   },
              { to: '/flashcards',  icon: <Layers        className="h-5 w-5" />, label: 'Flashcards',         bg: 'bg-indigo-100', color: 'text-indigo-600' },
            ].map(({ to, icon, label, bg, color }) => (
              <Link key={to} to={to}
                className="card-hover flex items-center gap-3 bg-white border border-parchment-200 rounded-xl p-4 shadow-sm hover:border-accent-primary/30 transition-all">
                <div className={`${bg} ${color} p-2.5 rounded-lg shrink-0`}>{icon}</div>
                <span className="text-sm font-semibold text-ink-900">{label}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
