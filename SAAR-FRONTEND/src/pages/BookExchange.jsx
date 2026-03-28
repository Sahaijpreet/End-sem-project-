import { useEffect, useState } from 'react';
import { Search, Filter, BookOpen, MessageCircle, MapPin } from 'lucide-react';
import { apiFetch } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

const PLACEHOLDER = 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=400';

export default function BookExchange() {
  const { isAuthenticated } = useAuth();
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
  const [actionId, setActionId] = useState(null);

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

  const filteredBooks = books.filter((book) => {
    const matchesSearch =
      book.Title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      book.Author.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'All' || book.Status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  async function handleListBook(e) {
    e.preventDefault();
    if (!listTitle.trim() || !listAuthor.trim() || !listSubject) return;
    setActionId('list');
    try {
      await apiFetch('/api/books', {
        method: 'POST',
        body: JSON.stringify({
          Title: listTitle.trim(),
          Author: listAuthor.trim(),
          Subject: listSubject,
        }),
      });
      setListOpen(false);
      setListTitle('');
      setListAuthor('');
      setListSubject('');
      await loadBooks();
    } catch (err) {
      setError(err.message || 'Could not list book');
    } finally {
      setActionId(null);
    }
  }

  async function requestBook(id) {
    if (!isAuthenticated) {
      setError('Log in to request a book.');
      return;
    }
    setActionId(id);
    try {
      await apiFetch(`/api/books/request/${id}`, { method: 'POST', body: JSON.stringify({}) });
      await loadBooks();
    } catch (err) {
      setError(err.message || 'Request failed');
    } finally {
      setActionId(null);
    }
  }

  return (
    <div className="flex-1 bg-parchment-50 py-8 min-h-[calc(100vh-4rem)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-ink-900 flex items-center gap-3">
              <BookOpen className="h-8 w-8 text-accent-primary" />
              Book Exchange Marketplace
            </h1>
            <p className="text-ink-800 mt-2 max-w-2xl">
              List books you own or request an exchange when a copy is available.
            </p>
          </div>
          <button
            type="button"
            onClick={() => (isAuthenticated ? setListOpen(true) : setError('Log in to list a book.'))}
            className="bg-accent-primary text-white px-6 py-2.5 rounded-lg shadow-sm font-medium hover:bg-accent-hover transition-colors whitespace-nowrap"
          >
            + List a Book
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-sm flex justify-between gap-4">
            <span>{error}</span>
            {!isAuthenticated && (
              <Link to="/auth" className="font-medium text-accent-primary shrink-0">Log in</Link>
            )}
          </div>
        )}

        <div className="bg-white p-4 rounded-xl shadow-sm border border-parchment-200 mb-8 flex flex-col lg:flex-row gap-4 justify-between items-center">

          <div className="relative w-full lg:w-96">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-slate-400" />
            </div>
            <input
              type="text"
              placeholder="Search by title or author..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-2.5 border border-parchment-300 rounded-lg bg-parchment-50 hover:bg-white focus:bg-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
            />
          </div>

          <div className="flex flex-wrap items-center gap-4 w-full lg:w-auto">
            <div className="flex items-center gap-2 text-sm">
              <Filter className="h-4 w-4 text-ink-800" />
              <span className="font-medium text-ink-800">Status:</span>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="border-parchment-300 rounded-md shadow-sm py-1.5 pl-3 pr-8 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="All">All Books</option>
                <option value="Available">Available</option>
                <option value="Requested">Requested</option>
                <option value="Exchanged">Exchanged</option>
              </select>
            </div>

            <div className="flex items-center gap-2 text-sm">
              <span className="font-medium text-ink-800">Subject:</span>
              <select
                value={subjectFilter}
                onChange={(e) => setSubjectFilter(e.target.value)}
                className="border-parchment-300 rounded-md shadow-sm py-1.5 pl-3 pr-8 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="">All Subjects</option>
                <option value="Computer Science">Computer Science</option>
                <option value="Physics">Physics</option>
                <option value="Mathematics">Mathematics</option>
                <option value="Economics">Economics</option>
                <option value="Chemistry">Chemistry</option>
                <option value="Biology">Biology</option>
              </select>
            </div>
          </div>
        </div>

        {loading && <p className="text-ink-800 mb-4">Loading books…</p>}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredBooks.map((book) => {
            const owner = book.OwnerID?.Name || 'Student';
            const busy = actionId === book._id;
            return (
              <div key={book._id} className="bg-white rounded-xl shadow-sm border border-parchment-200 overflow-hidden hover:shadow-lg transition-all group flex flex-col">

                <div className="relative h-48 w-full bg-parchment-100 flex items-center justify-center overflow-hidden border-b border-parchment-200">
                  <div className="absolute top-3 right-3 z-10 flex gap-2">
                    <span
                      className={`px-2.5 py-1 text-xs font-bold rounded-full shadow-sm ${
                        book.Status === 'Available' ? 'bg-emerald-500 text-white' : 'bg-amber-500 text-white'
                      }`}
                    >
                      {book.Status}
                    </span>
                  </div>
                  <img
                    src={PLACEHOLDER}
                    alt=""
                    className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>

                <div className="p-5 flex-1 flex flex-col">
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
                        <span className="text-sm font-medium text-ink-800">{owner}</span>
                      </div>
                      {book.Status === 'Available' ? (
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

        {listOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
            <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
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
                <div className="flex justify-end gap-2 pt-2">
                  <button type="button" onClick={() => setListOpen(false)} className="px-4 py-2 border rounded-lg">Cancel</button>
                  <button
                    type="submit"
                    disabled={actionId === 'list'}
                    className="px-4 py-2 bg-accent-primary text-white rounded-lg disabled:opacity-50"
                  >
                    {actionId === 'list' ? 'Saving…' : 'Publish listing'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
