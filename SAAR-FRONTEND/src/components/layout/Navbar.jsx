import { Link } from 'react-router-dom';
import { BookOpen, UserCircle, Menu, Shield } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function Navbar() {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();

  return (
    <nav className="bg-white shadow-sm border-b border-parchment-200">
      <div className="h-16 flex items-center px-4 sm:px-6">

        {/* Logo - extreme left */}
        <Link to="/" className="flex items-center gap-2 shrink-0">
          <BookOpen className="h-8 w-8 text-accent-primary" />
          <span className="text-2xl font-bold text-ink-900 tracking-tight">SAAR</span>
        </Link>

        {/* Nav links - center */}
        <div className="hidden md:flex flex-1 items-center justify-center gap-2">
          <Link to="/notes" className="text-ink-800 hover:text-accent-primary hover:bg-indigo-50 hover:shadow-md hover:scale-105 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200">Notes</Link>
          <Link to="/book-exchange" className="text-ink-800 hover:text-accent-primary hover:bg-indigo-50 hover:shadow-md hover:scale-105 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200">Book Exchange</Link>
          <Link to="/ai-summary" className="text-ink-800 hover:text-accent-primary hover:bg-indigo-50 hover:shadow-md hover:scale-105 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 flex items-center gap-1.5">
            <span className="inline-block w-2 h-2 rounded-full bg-accent-primary animate-pulse"></span>
            AI Summary
          </Link>
          <Link to="/upload" className="bg-accent-primary text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-accent-hover hover:shadow-md hover:scale-105 transition-all duration-200 shadow-sm">Upload</Link>
          {isAdmin && (
            <Link to="/admin" className="text-ink-800 hover:text-accent-primary hover:bg-indigo-50 hover:shadow-md hover:scale-105 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 inline-flex items-center gap-1">
              <Shield className="h-4 w-4" /> Admin
            </Link>
          )}
        </div>

        {/* Auth - extreme right */}
        <div className="flex items-center gap-3 shrink-0 ml-auto">
          {isAuthenticated ? (
            <>
              <span className="hidden sm:inline text-sm text-ink-800 max-w-[140px] truncate" title={user?.Email}>
                {user?.Name}
              </span>
              {isAdmin && (
                <Link
                  to="/admin"
                  className="inline-flex items-center gap-1 text-sm font-medium text-accent-primary hover:text-accent-hover px-2 py-1 rounded-md border border-parchment-200 bg-parchment-50"
                >
                  <Shield className="h-4 w-4 shrink-0" />
                  <span>Admin</span>
                </Link>
              )}
              <Link to="/profile" className="text-ink-800 hover:text-accent-primary" title="Profile">
                <UserCircle className="h-6 w-6" />
              </Link>
              <button
                type="button"
                onClick={() => logout()}
                className="text-sm font-medium text-ink-800 hover:text-accent-primary"
              >
                Log out
              </button>
            </>
          ) : (
            <>
              <Link
                to="/auth"
                state={{ mode: 'login' }}
                className="text-ink-800 hover:text-accent-primary px-3 py-2 text-sm font-medium"
              >
                Log in
              </Link>
              <Link
                to="/auth"
                state={{ mode: 'register' }}
                className="inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-accent-primary hover:bg-accent-hover transition-colors"
              >
                Sign up
              </Link>
            </>
          )}
          <button type="button" className="md:hidden text-ink-800 hover:text-accent-primary" aria-label="Menu">
            <Menu className="h-6 w-6" />
          </button>
        </div>

      </div>
    </nav>
  );
}
