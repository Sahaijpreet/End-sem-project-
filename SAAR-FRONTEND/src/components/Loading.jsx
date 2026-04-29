import { Loader2, BookOpen } from 'lucide-react';

// Main loading spinner
export function LoadingSpinner({ size = 'md', className = '' }) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
    xl: 'h-12 w-12'
  };

  return (
    <Loader2 
      className={`animate-spin text-accent-primary ${sizeClasses[size]} ${className}`} 
    />
  );
}

// Button loading state
export function LoadingButton({ loading, children, className = '', ...props }) {
  return (
    <button
      {...props}
      disabled={loading || props.disabled}
      className={`
        inline-flex items-center justify-center gap-2 px-4 py-2 
        border border-transparent rounded-lg shadow-sm text-sm font-medium 
        text-white bg-accent-primary hover:bg-accent-hover 
        focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent-primary 
        disabled:opacity-60 disabled:cursor-not-allowed
        transition-all duration-200
        ${className}
      `}
    >
      {loading && <LoadingSpinner size="sm" className="text-white" />}
      {children}
    </button>
  );
}

// Page loading overlay
export function PageLoader({ message = 'Loading...' }) {
  return (
    <div className="fixed inset-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="text-center space-y-4">
        <div className="relative">
          <BookOpen className="h-16 w-16 text-accent-primary mx-auto animate-pulse" />
          <LoadingSpinner size="lg" className="absolute inset-0 m-auto" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-ink-900 dark:text-white">SAAR</h3>
          <p className="text-ink-600 dark:text-slate-400">{message}</p>
        </div>
      </div>
    </div>
  );
}

// Card skeleton loader
export function CardSkeleton({ count = 1 }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-white dark:bg-slate-800 rounded-xl border border-parchment-200 dark:border-slate-700 p-6 animate-pulse">
          <div className="space-y-4">
            <div className="h-4 bg-parchment-200 dark:bg-slate-700 rounded w-3/4"></div>
            <div className="space-y-2">
              <div className="h-3 bg-parchment-200 dark:bg-slate-700 rounded"></div>
              <div className="h-3 bg-parchment-200 dark:bg-slate-700 rounded w-5/6"></div>
            </div>
            <div className="flex space-x-2">
              <div className="h-6 bg-parchment-200 dark:bg-slate-700 rounded w-16"></div>
              <div className="h-6 bg-parchment-200 dark:bg-slate-700 rounded w-20"></div>
            </div>
          </div>
        </div>
      ))}
    </>
  );
}

// List item skeleton
export function ListSkeleton({ count = 5 }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex items-center space-x-4 p-4 bg-white dark:bg-slate-800 rounded-lg border border-parchment-200 dark:border-slate-700 animate-pulse">
          <div className="h-10 w-10 bg-parchment-200 dark:bg-slate-700 rounded-full"></div>
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-parchment-200 dark:bg-slate-700 rounded w-1/4"></div>
            <div className="h-3 bg-parchment-200 dark:bg-slate-700 rounded w-1/2"></div>
          </div>
          <div className="h-8 w-20 bg-parchment-200 dark:bg-slate-700 rounded"></div>
        </div>
      ))}
    </div>
  );
}

// Inline loading text
export function LoadingText({ text = 'Loading' }) {
  return (
    <div className="flex items-center gap-2 text-ink-600 dark:text-slate-400">
      <LoadingSpinner size="sm" />
      <span className="text-sm">{text}...</span>
    </div>
  );
}

// Progress bar
export function ProgressBar({ progress, className = '' }) {
  return (
    <div className={`w-full bg-parchment-200 dark:bg-slate-700 rounded-full h-2 ${className}`}>
      <div 
        className="bg-accent-primary h-2 rounded-full transition-all duration-300 ease-out"
        style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
      />
    </div>
  );
}