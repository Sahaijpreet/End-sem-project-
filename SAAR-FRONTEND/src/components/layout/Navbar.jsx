import { Link } from 'react-router-dom';
import { BookOpen, UserCircle, Menu, Shield } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function Navbar() {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();

  return (
    <nav className="bg-white shadow-sm border-b border-parchment-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-2">
              <BookOpen className="h-8 w-8 text-accent-primary" />
              <span className="text-2xl font-bold text-ink-900 tracking-tight">SAAR</span>
            </Link>
            <div className="hidden md:ml-10 md:flex md:space-x-8">
              <Link to="/notes" className="text-ink-800 hover:text-accent-primary px-3 py-2 text-sm font-medium transition-colors">Notes</Link>
              <Link to="/book-exchange" className="text-ink-800 hover:text-accent-primary px-3 py-2 text-sm font-medium transition-colors">Book Exchange</Link>
              <Link to="/ai-summary" className="text-ink-800 hover:text-accent-primary px-3 py-2 text-sm font-medium transition-colors">AI Summary</Link>
              <Link to="/upload" className="text-ink-800 hover:text-accent-primary px-3 py-2 text-sm font-medium transition-colors">Upload</Link>
              {isAdmin && (
                <Link to="/admin" className="text-ink-800 hover:text-accent-primary px-3 py-2 text-sm font-medium transition-colors inline-flex items-center gap-1">
                  <Shield className="h-4 w-4" /> Admin
                </Link>
              )}
            </div>
          </div>
          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <>
                <span className="hidden sm:inline text-sm text-ink-800 max-w-[140px] truncate" title={user?.Email}>
                  {user?.Name}
                </span>
                {isAdmin && (
                  <Link
                    to="/admin"
                    className="inline-flex items-center gap-1 text-sm font-medium text-accent-primary hover:text-accent-hover px-2 py-1 rounded-md border border-parchment-200 bg-parchment-50"
                    title="Admin dashboard"
                  >
                    <Shield className="h-4 w-4 shrink-0" />
                    <span>Admin</span>
                  </Link>
                )}
                <Link to="/dashboard" className="text-ink-800 hover:text-accent-primary p-2 md:p-0" title="Dashboard">
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
              <div className="flex items-center gap-2 sm:gap-3">
                <Link
                  to="/auth"
                  state={{ mode: 'login' }}
                  className="text-ink-800 hover:text-accent-primary px-2 sm:px-3 py-2 text-sm font-medium"
                >
                  Log in
                </Link>
                <Link
                  to="/auth"
                  state={{ mode: 'register' }}
                  className="inline-flex items-center justify-center px-3 sm:px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-accent-primary hover:bg-accent-hover transition-colors"
                >
                  Sign up
                </Link>
              </div>
            )}
            <button type="button" className="md:hidden text-ink-800 hover:text-accent-primary" aria-label="Menu">
              <Menu className="h-6 w-6" />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
