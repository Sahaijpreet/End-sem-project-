import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Search, Filter, BookOpen, MessageCircle, MapPin, CheckCircle, XCircle, Bell, ImagePlus, X, Trash2 } from 'lucide-react';
import { apiFetch, fileUrl } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Link, useNavigate } from 'react-router-dom';

const PLACEHOLDER = 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=400';

export default function BookExchange() {
  const { isAuthenticated, user } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [tab, setTab] = useState('browse'); // 'browse' | 'requests' | 'my-requests'
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [subjectFilter, setSubjectFilter] = useState('');
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [listOpen, setListOpen] = useState(false);
  const [listTitle, setListTitle] = useState('');
  const [listAuthor, setListAuthor] = useState('');
  const [listSubject, setListSubject] = useState('');
  const [listCover, setListCover] = useState(null);
  const [listCoverPreview, setListCoverPreview] = useState('');
  const [actionId, setActionId] = useState(null);
  const [myRequests, setMyRequests] = useState([]);
  const [myOutgoingRequests, setMyOutgoingRequests] = useState([]);
  const [reqLoading, setReqLoading] = useState(false);

  async function loadBooks() {
    setLoading(true);
    setError('');
    try {
      const q = subjectFilter ? `?subject=${encodeURIComponent(subjectFilter)}` : '';
      const res = await apiFetch(`/api/books${q}`, { skipAuth: true });
      if (res.success && Array.isArray(res.data)) setBooks(res.data);
      else setBooks([]);
    } catch (e) {
      setError(e.message || 'Failed to load books');
      setBooks([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadBooks();
  }, [subjectFilter]);

  async function loadMyRequests() {
    if (!isAuthenticated) return;
    setReqLoading(true);
    try {
      const [incomingRes, outgoingRes] = await Promise.all([
        apiFetch('/api/books/my-requests'),
        apiFetch('/api/books/my-outgoing-requests')
      ]);
      if (incomingRes.success) setMyRequests(incomingRes.data);
      if (outgoingRes.success) setMyOutgoingRequests(outgoingRes.data);
    } catch (err) {
      console.error('Failed to load requests:', err.message);
    } finally {
      setReqLoading(false);
    }
  }

  useEffect(() => { loadMyRequests(); }, [isAuthenticated]);

  const filteredBooks = books.filter((book) => {
    const matchesSearch =
      book.Title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      book.Author.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'All' || book.Status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  async function cancelRequest(reqId) {
    setActionId(reqId);
    try {
      await apiFetch(`/api/books/cancel-request/${reqId}`, { method: 'DELETE' });
      await Promise.all([loadBooks(), loadMyRequests()]);
      toast('Request cancelled successfully!');
    } catch (err) {
      toast(err.message || 'Failed to cancel request', 'error');
    } finally {
      setActionId(null);
    }
  }

  async function handleListBook(e) {
    e.preventDefault();
    if (!listTitle.trim() || !listAuthor.trim() || !listSubject) return;
    setActionId('list');
    try {
      await apiFetch('/api/books', {
        method: 'POST',
        body: (() => {
          const fd = new FormData();
          fd.append('Title', listTitle.trim());
          fd.append('Author', listAuthor.trim());
          fd.append('Subject', listSubject);
          if (listCover) fd.append('cover', listCover);
          return fd;
        })(),
      });
      setListOpen(false);
      setListTitle(''); setListAuthor(''); setListSubject(''); setListCover(null); setListCoverPreview('');
      await loadBooks();
      toast('Book listed successfully!');
    } catch (err) {
      toast(err.message || 'Could not list book', 'error');
    } finally {
      setActionId(null);
    }
  }

  async function deleteBook(id) {
    if (!window.confirm('Delete this book listing? This cannot be undone.')) return;
    try {
      await apiFetch(`/api/books/${id}`, { method: 'DELETE' });
      setBooks((prev) => prev.filter((b) => b._id !== id));
      toast('Book deleted.');
    } catch (err) { toast(err.message || 'Failed to delete.', 'error'); }
  }

  async function requestBook(id) {
    if (!isAuthenticated) { toast('Log in to request a book.', 'error'); return; }
    setActionId(id);
    try {
      await apiFetch(`/api/books/request/${id}`, { method: 'POST', body: JSON.stringify({}) });
      await loadBooks();
      toast('Exchange request sent!');
    } catch (err) {
      toast(err.message || 'Request failed', 'error');
    } finally {
      setActionId(null);
    }
  }

  async function respondRequest(reqId, action) {
    setActionId(reqId);
    try {
      const res = await apiFetch(`/api/books/respond/${reqId}`, { method: 'PATCH', body: JSON.stringify({ action }) });
      toast(action === 'accept' ? 'Request accepted!' : 'Request declined.');
      if (action === 'accept') {
        // Open chat after accepting
        const chatRes = await apiFetch(`/api/chat/conversations/request/${reqId}`);
        if (chatRes.success) navigate(`/chat/${chatRes.data._id}`);
      }
      await Promise.all([loadBooks(), loadMyRequests()]);
    } catch (err) {
      toast(err.message || 'Action failed', 'error');
    } finally {
      setActionId(null);
    }
  }

  const STATUSES = ['Available', 'Requested', 'Exchanged'];
  const SUBJECTS = ['Computer Science', 'Physics', 'Mathematics', 'Economics', 'Chemistry', 'Biology'];

  return (
    <div className="flex-1 bg-parchment-50 min-h-[calc(100vh-4rem)] flex flex-col md:flex-row">
      {/* Sidebar Filters */}
      <aside className="w-full md:w-52 bg-white border-r border-parchment-200 flex-shrink-0">
        <div className="p-5 sticky top-16 max-h-[calc(100vh-4rem)] overflow-y-auto">
          <div className="flex items-center gap-2 mb-5 text-ink-900">
            <Filter className="h-5 w-5" />
            <h2 className="text-lg font-bold">Filters</h2>
          </div>
          <div className="mb-5">
            <h3 className="text-sm font-semibold text-ink-900 mb-3">Status</h3>
            <div className="space-y-2">
              {STATUSES.map((s) => (
                <label key={s} className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox"
                    checked={filterStatus === s}
                    onChange={() => setFilterStatus(filterStatus === s ? 'All' : s)}
                    className="rounded border-parchment-300 text-accent-primary focus:ring-indigo-500" />
                  <span className="text-sm text-ink-800">{s}</span>
                </label>
              ))}
            </div>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-ink-900 mb-3">Subject</h3>
            <div className="space-y-2">
              {SUBJECTS.map((s) => (
                <label key={s} className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox"
                    checked={subjectFilter === s}
                    onChange={() => setSubjectFilter(subjectFilter === s ? '' : s)}
                    className="rounded border-parchment-300 text-accent-primary focus:ring-indigo-500" />
                  <span className="text-sm text-ink-800">{s}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </aside>

      <div className="flex-1 p-4 min-w-0">
      <div className="max-w-none">

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-4 animate-[fadeSlideDown_0.4s_ease_both] bg-white border border-parchment-200 rounded-xl px-5 py-4 shadow-sm">
          <div>
            <h1 className="text-2xl font-bold text-ink-900 flex items-center gap-2">
              <BookOpen className="h-6 w-6 text-accent-primary" />
              Book Exchange
            </h1>
            <p className="text-ink-800 text-sm mt-0.5">List books you own or request an exchange when a copy is available.</p>
          </div>
          <div className="flex gap-2 flex-wrap">
            {isAuthenticated && (
              <>
                <button
                  type="button"
                  onClick={() => { setTab(tab === 'requests' ? 'browse' : 'requests'); loadMyRequests(); }}
                  className={`flex items-center gap-2 border border-parchment-300 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    tab === 'requests' ? 'bg-accent-primary text-white' : 'bg-white text-ink-800 hover:bg-parchment-50'
                  }`}
                >
                  <Bell className="h-4 w-4" />
                  Incoming {myRequests.filter(r => r.Status === 'Pending').length > 0 && <span className="bg-red-500 text-white text-xs rounded-full px-1.5">{myRequests.filter(r => r.Status === 'Pending').length}</span>}
                </button>
                <button
                  type="button"
                  onClick={() => { setTab(tab === 'my-requests' ? 'browse' : 'my-requests'); loadMyRequests(); }}
                  className={`flex items-center gap-2 border border-parchment-300 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    tab === 'my-requests' ? 'bg-accent-primary text-white' : 'bg-white text-ink-800 hover:bg-parchment-50'
                  }`}
                >
                  My Requests {myOutgoingRequests.filter(r => r.Status === 'Pending').length > 0 && <span className="bg-blue-500 text-white text-xs rounded-full px-1.5">{myOutgoingRequests.filter(r => r.Status === 'Pending').length}</span>}
                </button>
              </>
            )}
            <button
              type="button"
              onClick={() => (isAuthenticated ? setListOpen(true) : toast('Log in to list a book.', 'error'))}
              className="bg-accent-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-accent-hover transition-colors whitespace-nowrap"
            >
              + List a Book
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-sm flex justify-between gap-4">
            <span>{error}</span>
            {!isAuthenticated && <Link to="/auth" className="font-medium text-accent-primary shrink-0">Log in</Link>}
          </div>
        )}

        {tab === 'my-requests' && (
          <div className="bg-white rounded-xl shadow-sm border border-parchment-200 mb-8 overflow-hidden">
            <div className="p-5 border-b border-parchment-200 bg-parchment-50 flex justify-between items-center">
              <h2 className="font-bold text-ink-900">My outgoing requests</h2>
              <button type="button" onClick={() => setTab('browse')} className="text-sm text-accent-primary">Back to browse</button>
            </div>
            {reqLoading ? (
              <p className="p-6 text-ink-800 text-sm">Loading…</p>
            ) : myOutgoingRequests.length === 0 ? (
              <p className="p-6 text-ink-800 text-sm">No outgoing requests yet.</p>
            ) : (
              <div className="divide-y divide-parchment-200">
                {myOutgoingRequests.map((req) => (
                  <div key={req._id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <p className="font-semibold text-ink-900">{req.BookID?.Title}</p>
                      <p className="text-sm text-ink-800">
                        Requested from {req.BookID?.OwnerID?._id ? (
                          <Link to={`/user/${req.BookID.OwnerID._id}`} className="font-medium hover:text-accent-primary hover:underline">
                            {req.BookID.OwnerID.Name}
                          </Link>
                        ) : (
                          <span className="font-medium">{req.BookID?.OwnerID?.Name}</span>
                        )} · {req.BookID?.OwnerID?.Email}
                      </p>
                      <span className={`inline-block mt-1 px-2 py-0.5 text-xs font-semibold rounded-full ${
                        req.Status === 'Pending' ? 'bg-amber-100 text-amber-800' :
                        req.Status === 'Accepted' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                      }`}>{req.Status}</span>
                    </div>
                    <div className="flex gap-2">
                      {req.Status === 'Pending' && (
                        <button
                          type="button"
                          disabled={actionId === req._id}
                          onClick={() => cancelRequest(req._id)}
                          className="flex items-center gap-1 px-3 py-1.5 bg-rose-50 text-rose-700 border border-rose-200 rounded-lg text-sm font-medium hover:bg-rose-100 disabled:opacity-50"
                        >
                          <XCircle className="h-4 w-4" /> Cancel
                        </button>
                      )}
                      {req.Status === 'Accepted' && (
                        <button
                          type="button"
                          onClick={async () => {
                            const res = await apiFetch(`/api/chat/conversations/request/${req._id}`);
                            if (res.success) navigate(`/chat/${res.data._id}`);
                          }}
                          className="flex items-center gap-1 px-3 py-1.5 bg-indigo-50 text-accent-primary border border-indigo-200 rounded-lg text-sm font-medium hover:bg-indigo-100"
                        >
                          <MessageCircle className="h-4 w-4" /> Chat
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {tab === 'requests' && (
          <div className="bg-white rounded-xl shadow-sm border border-parchment-200 mb-8 overflow-hidden">
            <div className="p-5 border-b border-parchment-200 bg-parchment-50 flex justify-between items-center">
              <h2 className="font-bold text-ink-900">Incoming exchange requests on your books</h2>
              <button type="button" onClick={() => setTab('browse')} className="text-sm text-accent-primary">Back to browse</button>
            </div>
            {reqLoading ? (
              <p className="p-6 text-ink-800 text-sm">Loading…</p>
            ) : myRequests.length === 0 ? (
              <p className="p-6 text-ink-800 text-sm">No requests yet.</p>
            ) : (
              <div className="divide-y divide-parchment-200">
                {myRequests.map((req) => (
                  <div key={req._id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <p className="font-semibold text-ink-900">{req.BookID?.Title}</p>
                      <p className="text-sm text-ink-800">
                        Requested by {req.RequesterID?._id ? (
                          <Link to={`/user/${req.RequesterID._id}`} className="font-medium hover:text-accent-primary hover:underline">
                            {req.RequesterID.Name}
                          </Link>
                        ) : (
                          <span className="font-medium">{req.RequesterID?.Name}</span>
                        )} · {req.RequesterID?.Email}
                      </p>
                      <span className={`inline-block mt-1 px-2 py-0.5 text-xs font-semibold rounded-full ${
                        req.Status === 'Pending' ? 'bg-amber-100 text-amber-800' :
                        req.Status === 'Accepted' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                      }`}>{req.Status}</span>
                    </div>
                    {req.Status === 'Pending' && (
                      <div className="flex gap-2">
                        <button
                          type="button"
                          disabled={actionId === req._id}
                          onClick={() => respondRequest(req._id, 'accept')}
                          className="flex items-center gap-1 px-3 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg text-sm font-medium hover:bg-emerald-100 disabled:opacity-50"
                        >
                          <CheckCircle className="h-4 w-4" /> Accept
                        </button>
                        <button
                          type="button"
                          disabled={actionId === req._id}
                          onClick={() => respondRequest(req._id, 'reject')}
                          className="flex items-center gap-1 px-3 py-1.5 bg-rose-50 text-rose-700 border border-rose-200 rounded-lg text-sm font-medium hover:bg-rose-100 disabled:opacity-50"
                        >
                          <XCircle className="h-4 w-4" /> Decline
                        </button>
                      </div>
                    )}
                    {req.Status === 'Accepted' && (
                      <button
                        type="button"
                        onClick={async () => {
                          const res = await apiFetch(`/api/chat/conversations/request/${req._id}`);
                          if (res.success) navigate(`/chat/${res.data._id}`);
                        }}
                        className="flex items-center gap-1 px-3 py-1.5 bg-indigo-50 text-accent-primary border border-indigo-200 rounded-lg text-sm font-medium hover:bg-indigo-100"
                      >
                        <MessageCircle className="h-4 w-4" /> Chat
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {(tab === 'browse' || tab === 'requests' || tab === 'my-requests') && (
          <div className="relative mb-6">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-slate-400" />
            </div>
            <input
              type="text"
              placeholder="Search by title or author..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-9 pr-3 py-2 border border-parchment-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 shadow-sm"
            />
          </div>
        )}

        {loading && tab === 'browse' && <p className="text-ink-800 mb-4">Loading books…</p>}

        {tab === 'browse' && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredBooks.map((book) => {
              const owner = book.OwnerID?.Name || 'Student';
              const busy = actionId === book._id;
              const isMyBook = book.OwnerID?._id === user?._id;
              const hasRequested = myOutgoingRequests.some(req => req.BookID?._id === book._id && req.Status === 'Pending');
              
              return (
                <div key={book._id} className="bg-white rounded-xl shadow-sm border border-parchment-200 overflow-hidden hover:shadow-lg transition-all group flex flex-col">

                  <div className="relative h-52 w-full bg-parchment-100 flex items-center justify-center overflow-hidden border-b border-parchment-200">
                    <div className="absolute top-3 right-3 z-10 flex gap-2">
                      <span
                        className={`px-2.5 py-1 text-xs font-bold rounded-full shadow-sm ${
                          book.Status === 'Available' ? 'bg-emerald-500 text-white' : 
                          book.Status === 'Requested' ? 'bg-amber-500 text-white' :
                          'bg-slate-500 text-white'
                        }`}
                      >
                        {book.Status}
                      </span>
                    </div>
                    <img
                      src={book.CoverImage ? fileUrl(book.CoverImage) : PLACEHOLDER}
                      alt=""
                      className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>

                  <div className="p-3 flex-1 flex flex-col">
                    <p className="text-xs font-semibold text-accent-primary mb-1 tracking-wide uppercase">{book.Subject}</p>
                    <h3 className="text-lg font-bold text-ink-900 mb-1 line-clamp-2" title={book.Title}>{book.Title}</h3>
                    <p className="text-sm text-ink-800 mb-4">{book.Author}</p>

                    <div className="mt-auto space-y-3">
                      <div className="flex items-center gap-2 text-sm text-ink-800">
                        <MapPin className="h-4 w-4 text-slate-400" />
                        <span className="truncate">Campus meetup (coordinate with owner)</span>
                      </div>

                      <div className="flex items-center justify-between pt-3 border-t border-parchment-200">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center text-accent-primary font-bold text-xs">
                            {owner.charAt(0)}
                          </div>
                          {book.OwnerID?._id ? (
                            <Link to={`/user/${book.OwnerID._id}`} className="text-sm font-medium text-ink-800 hover:text-accent-primary hover:underline">
                              {owner}
                            </Link>
                          ) : (
                            <span className="text-sm font-medium text-ink-800">{owner}</span>
                          )}
                        </div>
                        {isMyBook ? (
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-slate-500 px-3 py-1.5 bg-slate-100 rounded-md">Your book</span>
                            <button type="button" onClick={() => deleteBook(book._id)}
                              className="flex items-center gap-1 px-2 py-1.5 bg-rose-50 text-rose-600 border border-rose-200 rounded-md text-xs hover:bg-rose-100 transition-colors">
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        ) : hasRequested ? (
                          <span className="text-xs text-amber-700 px-3 py-1.5 bg-amber-100 rounded-md font-medium">Requested</span>
                        ) : book.Status === 'Available' ? (
                          <button
                            type="button"
                            disabled={busy}
                            onClick={() => requestBook(book._id)}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 text-accent-primary hover:bg-indigo-100 rounded-md font-medium text-sm transition-colors disabled:opacity-50"
                          >
                            <MessageCircle className="h-4 w-4" /> {busy ? '…' : 'Request'}
                          </button>
                        ) : (
                          <button type="button" disabled className="flex items-center gap-1.5 px-3 py-1.5 bg-parchment-100 text-slate-400 rounded-md font-medium text-sm cursor-not-allowed">
                            <MessageCircle className="h-4 w-4" /> Unavailable
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {listOpen && createPortal(
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40" onClick={(e) => e.target === e.currentTarget && setListOpen(false)}>
            <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
              <h2 className="text-lg font-bold text-ink-900 mb-4">List a book</h2>
              <form onSubmit={handleListBook} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-ink-800">Title</label>
                  <input
                    required
                    value={listTitle}
                    onChange={(e) => setListTitle(e.target.value)}
                    className="mt-1 w-full border border-parchment-300 rounded-lg px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-ink-800">Author</label>
                  <input
                    required
                    value={listAuthor}
                    onChange={(e) => setListAuthor(e.target.value)}
                    className="mt-1 w-full border border-parchment-300 rounded-lg px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-ink-800">Subject</label>
                  <select
                    required
                    value={listSubject}
                    onChange={(e) => setListSubject(e.target.value)}
                    className="mt-1 w-full border border-parchment-300 rounded-lg px-3 py-2"
                  >
                    <option value="">Select</option>
                    <option value="Computer Science">Computer Science</option>
                    <option value="Physics">Physics</option>
                    <option value="Mathematics">Mathematics</option>
                    <option value="Economics">Economics</option>
                    <option value="Chemistry">Chemistry</option>
                    <option value="Biology">Biology</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-ink-800">Cover Image <span className="text-slate-400 text-xs">(optional)</span></label>
                  <div className="mt-1 flex items-center gap-3">
                    {listCoverPreview ? (
                      <div className="relative w-16 h-20 rounded-lg overflow-hidden border border-parchment-200">
                        <img src={listCoverPreview} alt="cover" className="w-full h-full object-cover" />
                        <button type="button" onClick={() => { setListCover(null); setListCoverPreview(''); }}
                          className="absolute top-0.5 right-0.5 bg-red-500 text-white rounded-full p-0.5">
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ) : (
                      <label className="w-16 h-20 rounded-lg border-2 border-dashed border-parchment-300 hover:border-indigo-400 flex flex-col items-center justify-center cursor-pointer bg-parchment-50">
                        <input type="file" accept="image/jpeg,image/png,image/webp" className="hidden"
                          onChange={(e) => {
                            const f = e.target.files?.[0];
                            if (f) { setListCover(f); setListCoverPreview(URL.createObjectURL(f)); }
                          }} />
                        <ImagePlus className="h-5 w-5 text-slate-400" />
                      </label>
                    )}
                    <p className="text-xs text-ink-800">JPG, PNG or WEBP</p>
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button type="button" onClick={() => setListOpen(false)} className="px-4 py-2 border border-parchment-300 rounded-lg text-ink-800 hover:bg-parchment-50">Cancel</button>
                  <button
                    type="submit"
                    disabled={actionId === 'list'}
                    className="px-4 py-2 bg-accent-primary text-white rounded-lg disabled:opacity-50 hover:bg-accent-hover"
                  >
                    {actionId === 'list' ? 'Saving…' : 'Publish listing'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        , document.body)}
      </div>
      </div>
    </div>
  );
}
