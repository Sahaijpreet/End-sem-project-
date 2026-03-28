import { BookOpen } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-white border-t border-parchment-200 mt-auto">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-accent-primary" />
            <span className="text-xl font-bold text-ink-900 tracking-tight">SAAR</span>
          </div>
          <p className="text-ink-800 text-sm">
            &copy; {new Date().getFullYear()} SAAR - Smart Notes & Book Exchange. All rights reserved.
          </p>
          <div className="flex space-x-6">
            <a href="#" className="text-slate-400 hover:text-ink-800">
              Terms
            </a>
            <a href="#" className="text-slate-400 hover:text-ink-800">
              Privacy
            </a>
            <a href="#" className="text-slate-400 hover:text-ink-800">
              Contact
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
