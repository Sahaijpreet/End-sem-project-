import { BookOpen } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-white border-t border-parchment-200 mt-auto">
      <div className="max-w-7xl mx-auto py-3 px-4 sm:px-6 flex flex-col sm:flex-row justify-between items-center gap-2">
        <div className="flex items-center gap-1.5">
          <BookOpen className="h-4 w-4 text-accent-primary" />
          <span className="text-sm font-bold text-ink-900 tracking-tight">SAAR</span>
        </div>
        <p className="text-ink-800 text-xs">&copy; {new Date().getFullYear()} SAAR. All rights reserved.</p>
        <div className="flex gap-4 text-xs text-slate-400">
          <a href="#" className="hover:text-ink-800 transition-colors">Terms</a>
          <a href="#" className="hover:text-ink-800 transition-colors">Privacy</a>
          <a href="#" className="hover:text-ink-800 transition-colors">Contact</a>
        </div>
      </div>
    </footer>
  );
}
