import { AlertTriangle, XCircle, RefreshCw, Home, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export function ErrorMessage({ message, type = 'error', className = '' }) {
  const styles = {
    error: 'bg-red-50 border-red-200 text-red-800 dark:bg-red-900/20 dark:border-red-800 dark:text-red-200',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-800 dark:bg-yellow-900/20 dark:border-yellow-800 dark:text-yellow-200',
    info: 'bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-200'
  };

  const icons = {
    error: XCircle,
    warning: AlertTriangle,
    info: AlertTriangle
  };

  const Icon = icons[type];

  return (
    <div className={`p-3 rounded-lg border text-sm flex items-start gap-2 ${styles[type]} ${className}`}>
      <Icon className="h-4 w-4 mt-0.5 flex-shrink-0" />
      <span>{message}</span>
    </div>
  );
}

export function SuccessMessage({ message, className = '' }) {
  return (
    <div className={`p-3 rounded-lg border bg-green-50 border-green-200 text-green-800 dark:bg-green-900/20 dark:border-green-800 dark:text-green-200 text-sm flex items-start gap-2 ${className}`}>
      <XCircle className="h-4 w-4 mt-0.5 flex-shrink-0 text-green-600 dark:text-green-400" />
      <span>{message}</span>
    </div>
  );
}

export function ErrorPage({ 
  title = 'Something went wrong', 
  message = 'An unexpected error occurred. Please try again later.',
  showRetry = true,
  onRetry,
  showHome = true
}) {
  return (
    <div className="min-h-screen bg-parchment-50 dark:bg-slate-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white dark:bg-slate-800 py-8 px-4 shadow-lg sm:rounded-lg sm:px-10">
          <div className="text-center space-y-6">
            <XCircle className="mx-auto h-16 w-16 text-red-500" />
            <div>
              <h2 className="text-xl font-bold text-ink-900 dark:text-white">{title}</h2>
              <p className="mt-2 text-ink-600 dark:text-slate-400">{message}</p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              {showRetry && onRetry && (
                <button
                  onClick={onRetry}
                  className="inline-flex items-center gap-2 px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-accent-primary hover:bg-accent-hover transition-colors"
                >
                  <RefreshCw className="h-4 w-4" />
                  Try Again
                </button>
              )}
              
              {showHome && (
                <Link
                  to="/"
                  className="inline-flex items-center gap-2 px-4 py-2 border border-parchment-300 dark:border-slate-600 rounded-md shadow-sm text-sm font-medium text-ink-700 dark:text-slate-300 bg-white dark:bg-slate-700 hover:bg-parchment-50 dark:hover:bg-slate-600 transition-colors"
                >
                  <Home className="h-4 w-4" />
                  Go Home
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function NotFoundPage() {
  return (
    <div className="min-h-screen bg-parchment-50 dark:bg-slate-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white dark:bg-slate-800 py-8 px-4 shadow-lg sm:rounded-lg sm:px-10">
          <div className="text-center space-y-6">
            <div className="text-6xl font-bold text-accent-primary">404</div>
            <div>
              <h2 className="text-xl font-bold text-ink-900 dark:text-white">Page Not Found</h2>
              <p className="mt-2 text-ink-600 dark:text-slate-400">
                The page you're looking for doesn't exist or has been moved.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={() => window.history.back()}
                className="inline-flex items-center gap-2 px-4 py-2 border border-parchment-300 dark:border-slate-600 rounded-md shadow-sm text-sm font-medium text-ink-700 dark:text-slate-300 bg-white dark:bg-slate-700 hover:bg-parchment-50 dark:hover:bg-slate-600 transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                Go Back
              </button>
              
              <Link
                to="/"
                className="inline-flex items-center gap-2 px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-accent-primary hover:bg-accent-hover transition-colors"
              >
                <Home className="h-4 w-4" />
                Go Home
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function NetworkError({ onRetry }) {
  return (
    <div className="text-center py-8">
      <AlertTriangle className="mx-auto h-12 w-12 text-yellow-500 mb-4" />
      <h3 className="text-lg font-semibold text-ink-900 dark:text-white mb-2">
        Connection Problem
      </h3>
      <p className="text-ink-600 dark:text-slate-400 mb-4">
        Please check your internet connection and try again.
      </p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="inline-flex items-center gap-2 px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-accent-primary hover:bg-accent-hover transition-colors"
        >
          <RefreshCw className="h-4 w-4" />
          Retry
        </button>
      )}
    </div>
  );
}

export function FieldError({ error, className = '' }) {
  if (!error) return null;
  
  return (
    <p className={`text-sm text-red-600 dark:text-red-400 mt-1 ${className}`}>
      {error}
    </p>
  );
}