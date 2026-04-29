import { Link } from 'react-router-dom';
import { Lock, LogIn, UserPlus } from 'lucide-react';

export default function LoginPrompt({ 
  title = "Authentication Required", 
  message = "Please log in to access this content",
  showRegister = true 
}) {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-parchment-200 dark:border-slate-700 p-8">
          <div className="mb-6">
            <div className="mx-auto w-16 h-16 bg-accent-primary/10 rounded-full flex items-center justify-center mb-4">
              <Lock className="h-8 w-8 text-accent-primary" />
            </div>
            <h2 className="text-2xl font-bold text-ink-900 dark:text-white mb-2">
              {title}
            </h2>
            <p className="text-ink-600 dark:text-slate-300">
              {message}
            </p>
          </div>
          
          <div className="space-y-3">
            <Link
              to="/auth"
              state={{ mode: 'login' }}
              className="w-full bg-accent-primary hover:bg-accent-hover text-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <LogIn className="h-4 w-4" />
              Log In
            </Link>
            
            {showRegister && (
              <Link
                to="/auth"
                state={{ mode: 'register' }}
                className="w-full bg-white hover:bg-parchment-50 dark:bg-slate-700 dark:hover:bg-slate-600 text-ink-900 dark:text-white font-semibold py-3 px-4 rounded-lg border border-parchment-200 dark:border-slate-600 transition-colors flex items-center justify-center gap-2"
              >
                <UserPlus className="h-4 w-4" />
                Sign Up
              </Link>
            )}
          </div>
          
          <div className="mt-6 pt-6 border-t border-parchment-200 dark:border-slate-600">
            <Link
              to="/"
              className="text-sm text-ink-600 dark:text-slate-400 hover:text-accent-primary transition-colors"
            >
              ← Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}