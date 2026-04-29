import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, UserCircle, Menu, Shield, Search, Sun, Moon, Trophy, X, ChevronDown, Calculator, CheckSquare, ClipboardList, Layers, Clock, BookMarked } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { apiFetch, fileUrl } from '../../lib/api';
import UnifiedInbox from '../UnifiedInbox';

const TOOLS = [
  { to: '/cgpa',        icon: <Calculator    className="h-4 w-4" />, label: 'CGPA Calculator',   color: 'text-amber-600'   },
  { to: '/assignments', icon: <ClipboardList className="h-4 w-4" />, label: 'Assignments',        color: 'text-rose-600'    },
  { to: '/flashcards',  icon: <Layers        className="h-4 w-4" />, label: 'Flashcards',         color: 'text-indigo-600'  },
  { to: '/timetable',   icon: <Clock         className="h-4 w-4" />, label: 'Timetable',          color: 'text-blue-600'    },
  { to: '/syllabus',    icon: <BookMarked    className="h-4 w-4" />, label: 'Syllabus Tracker',   color: 'text-violet-600'  },
];

export default function Navbar() {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState(null);
  const [searching, setSearching] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [toolsOpen, setToolsOpen] = useState(false);
  const searchRef = useRef(null);
  const toolsRef = useRef(null);
  const inputRef = useRef(null);
  const debounceRef = useRef(null);

  useEffect(() => {
    if (searchOpen) setTimeout(() => inputRef.current?.focus(), 50);
  }, [searchOpen]);

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
    }, 500); // Increased from 350ms to 500ms
    return () => clearTimeout(debounceRef.current);
  }, [query]);

  useEffect(() => {
    function handleClick(e) {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setResults(null); setSearchOpen(false); setQuery('');
      }
      if (toolsRef.current && !toolsRef.current.contains(e.target)) setToolsOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  function closeSearch() { setSearchOpen(false); setQuery(''); setResults(null); }

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
          <Link to="/notes"        className="text-ink-800 hover:text-accent-primary hover:bg-indigo-50 px-3 py-2 rounded-lg text-sm font-semibold transition-all">Notes</Link>
          <Link to="/pyqs"         className="text-ink-800 hover:text-accent-primary hover:bg-indigo-50 px-3 py-2 rounded-lg text-sm font-semibold transition-all">PYQs</Link>
          <Link to="/book-exchange"className="text-ink-800 hover:text-accent-primary hover:bg-indigo-50 px-3 py-2 rounded-lg text-sm font-semibold transition-all">Books</Link>
          <Link to="/groups"       className="text-ink-800 hover:text-accent-primary hover:bg-indigo-50 px-3 py-2 rounded-lg text-sm font-semibold transition-all">Groups</Link>
          <Link to="/leaderboard"  className="text-ink-800 hover:text-accent-primary hover:bg-indigo-50 px-3 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-1">
            <Trophy className="h-4 w-4" /> Board
          </Link>
          <Link to="/ai-summary"   className="text-ink-800 hover:text-accent-primary hover:bg-indigo-50 px-3 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-accent-primary animate-pulse inline-block" /> AI
          </Link>

          {/* Tools dropdown */}
          <div ref={toolsRef} className="relative">
            <button onClick={() => setToolsOpen((o) => !o)}
              className="flex items-center gap-1 text-ink-800 hover:text-accent-primary hover:bg-indigo-50 px-3 py-2 rounded-lg text-sm font-semibold transition-all">
              Tools <ChevronDown className={`h-3.5 w-3.5 transition-transform ${toolsOpen ? 'rotate-180' : ''}`} />
            </button>
            {toolsOpen && (
              <div className="absolute top-full left-0 mt-1 w-52 bg-white border border-parchment-200 rounded-xl shadow-lg z-50 py-1 overflow-hidden">
                {TOOLS.map(({ to, icon, label, color }) => (
                  <Link key={to} to={to} onClick={() => setToolsOpen(false)}
                    className="flex items-center gap-3 px-4 py-2.5 hover:bg-parchment-50 transition-colors">
                    <span className={color}>{icon}</span>
                    <span className="text-sm font-medium text-ink-900">{label}</span>
                  </Link>
                ))}
              </div>
            )}
          </div>

          <Link to="/upload" className="bg-accent-primary text-white px-3 py-2 rounded-lg text-sm font-semibold hover:bg-accent-hover transition-all shadow-sm">Upload</Link>
          {isAdmin && (
            <Link to="/admin" className="text-ink-800 hover:text-accent-primary hover:bg-indigo-50 px-3 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-1">
              <Shield className="h-4 w-4" /> Admin
            </Link>
          )}
        </div>

        {/* Right side pill */}
        <div className="flex items-center gap-2 shrink-0 ml-auto">
          <div className="flex items-center bg-parchment-50 border border-parchment-200 rounded-full px-2 py-1 gap-1 shadow-sm">

            {/* Search */}
            <div ref={searchRef} className="relative flex items-center">
              <div className={`flex items-center overflow-hidden transition-all duration-300 ease-in-out ${searchOpen ? 'w-44 lg:w-60' : 'w-7'}`}>
                <button onClick={() => searchOpen ? closeSearch() : setSearchOpen(true)}
                  className="p-1.5 text-ink-800 hover:text-accent-primary shrink-0 transition-colors rounded-full hover:bg-parchment-100" title="Search">
                  {searchOpen ? <X className="h-4 w-4" /> : <Search className="h-4 w-4" />}
                </button>
                {searchOpen && (
                  <input ref={inputRef} type="text" value={query} onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search everything…"
                    className="flex-1 py-1 pr-2 text-sm bg-transparent text-ink-900 focus:outline-none placeholder-slate-400" />
                )}
              </div>
              {searchOpen && (results || searching) && (
                <div className="absolute top-full right-0 mt-2 w-72 bg-white border border-parchment-200 rounded-xl shadow-lg z-50 max-h-80 overflow-y-auto">
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
            <button onClick={toggleTheme} className="p-1.5 rounded-full text-ink-800 hover:text-accent-primary hover:bg-parchment-100 transition-colors" title="Toggle dark mode">
              {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>

            {isAuthenticated && (
              <>
                <div className="w-px h-5 bg-parchment-300 mx-1" />
                <div className="pr-2">
                  <UnifiedInbox />
                </div>
                <Link to="/profile" className="shrink-0" title="Profile">
                  {user?.Avatar ? (
                    <img 
                      src={fileUrl(user.Avatar)} 
                      alt="avatar" 
                      className="h-7 w-7 rounded-full object-cover ring-2 ring-parchment-200 hover:ring-accent-primary transition-all" 
                      onError={(e) => {
                        console.error('Navbar avatar failed to load:', fileUrl(user.Avatar));
                        e.target.style.display = 'none';
                      }}
                    />
                  ) : (
                    <div className="h-7 w-7 rounded-full bg-indigo-100 flex items-center justify-center hover:bg-indigo-200 transition-colors">
                      <UserCircle className="h-5 w-5 text-accent-primary" />
                    </div>
                  )}
                </Link>
                <button type="button" onClick={() => logout()}
                  className="hidden sm:flex items-center gap-1 text-xs font-semibold text-ink-800 hover:text-accent-primary bg-white border border-parchment-200 rounded-full px-3 py-1 ml-1 hover:border-accent-primary transition-all">
                  Log out
                </button>
              </>
            )}

            {!isAuthenticated && (
              <>
                <div className="w-px h-5 bg-parchment-300 mx-1" />
                <Link to="/auth" state={{ mode: 'login' }} className="text-xs font-semibold text-ink-800 hover:text-accent-primary px-2 py-1 rounded-full hover:bg-parchment-100 transition-colors">Log in</Link>
                <Link to="/auth" state={{ mode: 'register' }} className="text-xs font-semibold text-white bg-accent-primary hover:bg-accent-hover px-3 py-1.5 rounded-full transition-colors shadow-sm">Sign up</Link>
              </>
            )}
          </div>

          <button type="button" onClick={() => setMobileOpen((o) => !o)} className="md:hidden text-ink-800 hover:text-accent-primary" aria-label="Menu">
            <Menu className="h-6 w-6" />
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden bg-white border-t border-parchment-200 px-4 py-3 space-y-1 max-h-[80vh] overflow-y-auto">
          {[
            { to: '/notes',        label: 'Notes' },
            { to: '/pyqs',         label: 'PYQs' },
            { to: '/book-exchange',label: 'Book Exchange' },
            { to: '/groups',       label: 'Study Groups' },
            { to: '/leaderboard',  label: 'Leaderboard' },
            { to: '/ai-summary',   label: 'AI Summary' },
            { to: '/upload',       label: 'Upload' },
            { to: '/cgpa',         label: '🎓 CGPA Calculator' },
            { to: '/assignments',  label: '📋 Assignments' },
            { to: '/flashcards',   label: '🃏 Flashcards' },
            { to: '/timetable',    label: '🕐 Timetable' },
            { to: '/syllabus',     label: '📚 Syllabus Tracker' },
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
