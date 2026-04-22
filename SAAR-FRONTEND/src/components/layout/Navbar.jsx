import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, UserCircle, Menu, Shield, MessageCircle, Search, Sun, Moon, Trophy, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { apiFetch, fileUrl } from '../../lib/api';

export default function Navbar() {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { dark, toggle } = useTheme();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState(null);
  const [searching, setSearching] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const searchRef = useRef(null);
  const inputRef = useRef(null);
  const debounceRef = useRef(null);

  // focus input when search opens
  useEffect(() => {
    if (searchOpen) setTimeout(() => inputRef.current?.focus(), 50);
  }, [searchOpen]);

  // debounced search
  useEffect(() => {
    if (!query.trim()) { setResults(null); return; }
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setSearching(true);
      try {
        const r = await apiFetch(`/api/search?q=${encodeURIComponent(query)}`, { skipAuth: true });
        setResults(r.success ? r.data : null);
      } catch { setResults(null); }
      finally { setSearching(false); }
    }, 350);
    return () => clearTimeout(debounceRef.current);
  }, [query]);

  // close on outside click
  useEffect(() => {
    function handleClick(e) {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setResults(null);
        setSearchOpen(false);
        setQuery('');
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  function closeSearch() {
    setSearchOpen(false);
    setQuery('');
    setResults(null);
  }

  const totalResults = results ? (results.notes?.length + results.pyqs?.length + results.books?.length) : 0;

  return (
    <nav className="bg-white shadow-sm border-b border-parchment-200 sticky top-0 z-50">
      <div className="h-16 flex items-center px-4 sm:px-6 gap-3">

        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 shrink-0">
          <BookOpen className="h-8 w-8 text-accent-primary" />
          <span className="text-2xl font-bold text-ink-900 tracking-tight">SAAR</span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex flex-1 items-center justify-center gap-1">
          <Link to="/notes" className="text-ink-800 hover:text-accent-primary hover:bg-indigo-50 px-3 py-2 rounded-lg text-sm font-semibold transition-all">Notes</Link>
          <Link to="/pyqs" className="text-ink-800 hover:text-accent-primary hover:bg-indigo-50 px-3 py-2 rounded-lg text-sm font-semibold transition-all">PYQs</Link>
          <Link to="/book-exchange" className="text-ink-800 hover:text-accent-primary hover:bg-indigo-50 px-3 py-2 rounded-lg text-sm font-semibold transition-all">Books</Link>
          <Link to="/leaderboard" className="text-ink-800 hover:text-accent-primary hover:bg-indigo-50 px-3 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-1">
            <Trophy className="h-4 w-4" /> Board
          </Link>
          <Link to="/ai-summary" className="text-ink-800 hover:text-accent-primary hover:bg-indigo-50 px-3 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-accent-primary animate-pulse inline-block" />
            AI
          </Link>
          <Link to="/upload" className="bg-accent-primary text-white px-3 py-2 rounded-lg text-sm font-semibold hover:bg-accent-hover transition-all shadow-sm">Upload</Link>
          {isAdmin && (
            <Link to="/admin" className="text-ink-800 hover:text-accent-primary hover:bg-indigo-50 px-3 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-1">
              <Shield className="h-4 w-4" /> Admin
            </Link>
          )}
        </div>

        {/* Right side */}
        <div className="flex items-center gap-2 shrink-0 ml-auto">

          {/* Expandable search */}
          <div ref={searchRef} className="relative flex items-center">
            <div className={`flex items-center overflow-hidden transition-all duration-300 ease-in-out ${searchOpen ? 'w-56 lg:w-72 border border-parchment-300 rounded-lg bg-white' : 'w-8'}`}>
              <button
                onClick={() => searchOpen ? closeSearch() : setSearchOpen(true)}
                className="p-2 text-ink-800 hover:text-accent-primary shrink-0 transition-colors"
                title="Search"
              >
                {searchOpen ? <X className="h-4 w-4" /> : <Search className="h-5 w-5" />}
              </button>
              {searchOpen && (
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search everything…"
                  className="flex-1 py-2 pr-3 text-sm bg-transparent text-ink-900 focus:outline-none placeholder-slate-400"
                />
              )}
            </div>

            {/* Dropdown results */}
            {searchOpen && (results || searching) && (
              <div className="absolute top-full right-0 mt-1 w-72 bg-white border border-parchment-200 rounded-xl shadow-lg z-50 max-h-80 overflow-y-auto">
                {searching && <p className="p-3 text-sm text-ink-800">Searching…</p>}
                {results && totalResults === 0 && <p className="p-3 text-sm text-ink-800">No results found.</p>}
                {results?.notes?.length > 0 && (
                  <div>
                    <p className="px-3 pt-2 pb-1 text-xs font-bold text-slate-400 uppercase">Notes</p>
                    {results.notes.map((n) => (
                      <Link key={n._id} to="/notes" state={{ highlight: n._id }} onClick={closeSearch}
                        className="flex items-center gap-2 px-3 py-2 hover:bg-parchment-50 text-sm text-ink-900">
                        <span className="truncate">{n.Title}</span>
                        <span className="text-xs text-slate-400 shrink-0">{n.Subject}</span>
                      </Link>
                    ))}
                  </div>
                )}
                {results?.pyqs?.length > 0 && (
                  <div>
                    <p className="px-3 pt-2 pb-1 text-xs font-bold text-slate-400 uppercase">PYQs</p>
                    {results.pyqs.map((p) => (
                      <Link key={p._id} to="/pyqs" onClick={closeSearch}
                        className="flex items-center gap-2 px-3 py-2 hover:bg-parchment-50 text-sm text-ink-900">
                        <span className="truncate">{p.Title}</span>
                        <span className="text-xs text-slate-400 shrink-0">{p.Subject}</span>
                      </Link>
                    ))}
                  </div>
                )}
                {results?.books?.length > 0 && (
                  <div>
                    <p className="px-3 pt-2 pb-1 text-xs font-bold text-slate-400 uppercase">Books</p>
                    {results.books.map((b) => (
                      <Link key={b._id} to="/book-exchange" onClick={closeSearch}
                        className="flex items-center gap-2 px-3 py-2 hover:bg-parchment-50 text-sm text-ink-900">
                        <span className="truncate">{b.Title}</span>
                        <span className="text-xs text-slate-400 shrink-0">{b.Author}</span>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Dark mode */}
          <button onClick={toggle} className="p-2 rounded-lg text-ink-800 hover:text-accent-primary hover:bg-parchment-100 transition-colors" title="Toggle dark mode">
            {dark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </button>

          {isAuthenticated ? (
            <>
              <Link to="/profile" className="text-ink-800 hover:text-accent-primary" title="Profile">
                {user?.Avatar ? (
                  <img src={fileUrl(user.Avatar)} alt="avatar" className="h-7 w-7 rounded-full object-cover" />
                ) : (
                  <UserCircle className="h-6 w-6" />
                )}
              </Link>
              <Link to="/inbox" className="text-ink-800 hover:text-accent-primary" title="Inbox">
                <MessageCircle className="h-6 w-6" />
              </Link>
              <button type="button" onClick={() => logout()} className="text-sm font-medium text-ink-800 hover:text-accent-primary hidden sm:block">
                Log out
              </button>
            </>
          ) : (
            <>
              <Link to="/auth" state={{ mode: 'login' }} className="text-ink-800 hover:text-accent-primary px-3 py-2 text-sm font-medium">Log in</Link>
              <Link to="/auth" state={{ mode: 'register' }} className="inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-accent-primary hover:bg-accent-hover transition-colors">
                Sign up
              </Link>
            </>
          )}

          <button type="button" onClick={() => setMobileOpen((o) => !o)} className="md:hidden text-ink-800 hover:text-accent-primary" aria-label="Menu">
            <Menu className="h-6 w-6" />
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden bg-white border-t border-parchment-200 px-4 py-3 space-y-1">
          {[
            { to: '/notes', label: 'Notes' },
            { to: '/pyqs', label: 'PYQs' },
            { to: '/book-exchange', label: 'Book Exchange' },
            { to: '/leaderboard', label: 'Leaderboard' },
            { to: '/ai-summary', label: 'AI Summary' },
            { to: '/upload', label: 'Upload' },
          ].map(({ to, label }) => (
            <Link key={to} to={to} onClick={() => setMobileOpen(false)}
              className="block px-3 py-2 rounded-lg text-sm font-medium text-ink-800 hover:bg-parchment-100">
              {label}
            </Link>
          ))}
          {isAuthenticated && (
            <button onClick={() => { logout(); setMobileOpen(false); }} className="block w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-ink-800 hover:bg-parchment-100">
              Log out
            </button>
          )}
        </div>
      )}
    </nav>
  );
}
