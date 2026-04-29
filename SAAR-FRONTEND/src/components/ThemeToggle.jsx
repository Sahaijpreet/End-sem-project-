import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export default function ThemeToggle({ className = '' }) {
  const { isDark, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className={`
        relative inline-flex h-10 w-10 items-center justify-center rounded-lg
        bg-parchment-100 hover:bg-parchment-200 
        dark:bg-slate-800 dark:hover:bg-slate-700
        border border-parchment-300 dark:border-slate-600
        transition-all duration-200 ease-in-out
        focus:outline-none focus:ring-2 focus:ring-accent-primary focus:ring-offset-2
        dark:focus:ring-offset-slate-900
        ${className}
      `}
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      <div className="relative">
        {/* Sun Icon */}
        <Sun 
          className={`
            h-5 w-5 text-amber-500 transition-all duration-300 ease-in-out
            ${isDark ? 'rotate-90 scale-0 opacity-0' : 'rotate-0 scale-100 opacity-100'}
          `}
        />
        
        {/* Moon Icon */}
        <Moon 
          className={`
            absolute inset-0 h-5 w-5 text-slate-400 transition-all duration-300 ease-in-out
            ${isDark ? 'rotate-0 scale-100 opacity-100' : '-rotate-90 scale-0 opacity-0'}
          `}
        />
      </div>
    </button>
  );
}

// Compact version for mobile
export function CompactThemeToggle({ className = '' }) {
  const { isDark, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className={`
        inline-flex h-8 w-8 items-center justify-center rounded-md
        bg-parchment-100 hover:bg-parchment-200 
        dark:bg-slate-800 dark:hover:bg-slate-700
        transition-colors duration-200
        ${className}
      `}
      title={isDark ? 'Light mode' : 'Dark mode'}
    >
      {isDark ? (
        <Sun className="h-4 w-4 text-amber-400" />
      ) : (
        <Moon className="h-4 w-4 text-slate-600" />
      )}
    </button>
  );
}