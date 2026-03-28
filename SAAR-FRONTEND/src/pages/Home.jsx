import { useEffect, useState } from 'react';
import { Search, FileText, Library, Sparkles, ArrowRight } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { apiFetch } from '../lib/api';

export default function Home() {
  const [stats, setStats] = useState(null);
  const [q, setQ] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    let cancelled = false;
    apiFetch('/api/public/stats', { skipAuth: true })
      .then((res) => {
        if (!cancelled && res.success && res.data) setStats(res.data);
      })
      .catch(() => {
        if (!cancelled) setStats(null);
      });
    return () => { cancelled = true; };
  }, []);

  function onSearch(e) {
    e.preventDefault();
    const query = q.trim();
    if (query) navigate(`/notes?q=${encodeURIComponent(query)}`);
    else navigate('/notes');
  }

  const nu = stats?.totalUsers ?? '—';
  const nn = stats?.totalNotes ?? '—';
  const nb = stats?.totalBooks ?? '—';

  return (
    <div className="flex flex-col min-h-screen">
      <section className="relative bg-white overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&q=80')] bg-cover bg-center opacity-5"></div>
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-slate-50 to-transparent"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-32 relative z-10 text-center">
          <h1 className="text-5xl md:text-6xl font-extrabold text-ink-900 tracking-tight leading-tight mb-6">
            Smarter Notes. <span className="text-accent-primary">Better Grades.</span>
          </h1>
          <p className="mt-4 text-xl text-ink-800 max-w-3xl mx-auto mb-10">
            The AI-enabled academic hub for university students. Find peer notes, get instant AI summaries, and exchange textbooks seamlessly.
          </p>

          <form onSubmit={onSearch} className="max-w-2xl mx-auto mb-10 relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="h-6 w-6 text-slate-400" />
            </div>
            <input
              type="text"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="block w-full pl-12 pr-36 py-4 border-2 border-parchment-200 rounded-full text-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 bg-white placeholder-slate-400 transition-shadow hover:shadow-md"
              placeholder="Search for subjects, topics, or books..."
            />
            <button type="submit" className="absolute inset-y-2 right-2 px-6 bg-accent-primary text-white rounded-full font-medium hover:bg-accent-hover transition-colors">
              Search
            </button>
          </form>

          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link to="/auth" className="inline-flex items-center justify-center px-8 py-4 border border-transparent text-base font-medium rounded-full text-white bg-accent-primary hover:bg-accent-hover md:text-lg shadow-lg hover:shadow-xl transition-all">
              Join the Community
            </Link>
            <Link to="/upload" className="inline-flex items-center justify-center px-8 py-4 border-2 border-parchment-200 text-base font-medium rounded-full text-ink-800 bg-white hover:bg-parchment-50 hover:border-parchment-300 md:text-lg transition-all">
              Upload Notes <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>

      <section className="py-20 bg-parchment-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-ink-900">Everything you need to succeed</h2>
            <p className="mt-4 text-lg text-ink-800">Built by students, for students. Powered by advanced AI.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-parchment-200 hover:shadow-md transition-shadow group relative overflow-hidden">
              <div className="w-14 h-14 bg-indigo-100 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Sparkles className="h-7 w-7 text-accent-primary" />
              </div>
              <h3 className="text-xl font-bold text-ink-900 mb-3">AI Summarization</h3>
              <p className="text-ink-800">
                Turn long lecture PDFs into concise, study-ready summaries. Save hours of reading time.
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-sm border border-parchment-200 hover:shadow-md transition-shadow group relative overflow-hidden">
              <div className="w-14 h-14 bg-emerald-100 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <FileText className="h-7 w-7 text-emerald-600" />
              </div>
              <h3 className="text-xl font-bold text-ink-900 mb-3">Notes Repository</h3>
              <p className="text-ink-800">
                Access peer-shared notes organized by semester and subject.
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-sm border border-parchment-200 hover:shadow-md transition-shadow group relative overflow-hidden">
              <div className="w-14 h-14 bg-amber-100 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Library className="h-7 w-7 text-amber-600" />
              </div>
              <h3 className="text-xl font-bold text-ink-900 mb-3">Book Exchange</h3>
              <p className="text-ink-800">
                Borrow, lend, or trade physical books with students on your campus.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-indigo-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-12">SAAR by the numbers</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div>
              <div className="text-4xl font-extrabold mb-2">{nu}</div>
              <div className="text-indigo-200">Registered students</div>
            </div>
            <div>
              <div className="text-4xl font-extrabold mb-2">{nn}</div>
              <div className="text-indigo-200">Notes in repository</div>
            </div>
            <div>
              <div className="text-4xl font-extrabold mb-2">{nb}</div>
              <div className="text-indigo-200">Books listed</div>
            </div>
            <div>
              <div className="text-4xl font-extrabold mb-2">AI</div>
              <div className="text-indigo-200">Summaries on demand</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
