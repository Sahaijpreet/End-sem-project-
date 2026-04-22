import { useEffect, useRef, useState } from 'react';
import { Search, FileText, Library, Sparkles, ArrowRight, BookOpen, Trophy, Zap, Users, Star } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { apiFetch } from '../lib/api';
import { useReveal } from '../hooks/useReveal';

/* ── animated counter ── */
function Counter({ target, duration = 1800 }) {
  const [val, setVal] = useState(0);
  const ref = useRef(null);
  useEffect(() => {
    if (typeof target !== 'number') { setVal(target); return; }
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      observer.disconnect();
      let start = 0;
      const step = Math.ceil(target / (duration / 16));
      const timer = setInterval(() => {
        start += step;
        if (start >= target) { setVal(target); clearInterval(timer); }
        else setVal(start);
      }, 16);
    }, { threshold: 0.5 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target, duration]);
  return <span ref={ref}>{typeof target === 'number' ? val.toLocaleString() : target}</span>;
}

/* ── floating particles ── */
const PARTICLES = Array.from({ length: 18 }, (_, i) => ({
  id: i,
  size: 4 + Math.random() * 10,
  left: Math.random() * 100,
  delay: Math.random() * 8,
  duration: 6 + Math.random() * 8,
}));

export default function Home() {
  const [stats, setStats] = useState(null);
  const [q, setQ] = useState('');
  const navigate = useNavigate();
  useReveal();

  useEffect(() => {
    apiFetch('/api/public/stats', { skipAuth: true })
      .then((r) => r.success && setStats(r.data))
      .catch(() => {});
  }, []);

  function onSearch(e) {
    e.preventDefault();
    const query = q.trim();
    navigate(query ? `/notes?q=${encodeURIComponent(query)}` : '/notes');
  }

  return (
    <div className="flex flex-col min-h-screen overflow-x-hidden">

      {/* ── HERO ── */}
      <section className="relative bg-white overflow-hidden min-h-[92vh] flex items-center">

        {/* animated gradient bg */}
        <div className="absolute inset-0 gradient-animate opacity-60" />

        {/* particles */}
        <div className="particles-bg">
          {PARTICLES.map((p) => (
            <div
              key={p.id}
              className="particle"
              style={{
                width: p.size,
                height: p.size,
                left: `${p.left}%`,
                bottom: '-20px',
                animationDuration: `${p.duration}s`,
                animationDelay: `${p.delay}s`,
              }}
            />
          ))}
        </div>

        {/* big blurred circles */}
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-accent-primary/10 rounded-full blur-3xl animate-float-slow" />
        <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-indigo-300/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-amber-100/20 rounded-full blur-3xl" />

        {/* floating icons */}
        <div className="absolute top-20 left-10 animate-float opacity-20 hidden lg:block" style={{ animationDelay: '0s' }}>
          <BookOpen className="h-16 w-16 text-accent-primary" />
        </div>
        <div className="absolute top-32 right-16 animate-float opacity-15 hidden lg:block" style={{ animationDelay: '1.5s' }}>
          <Sparkles className="h-12 w-12 text-indigo-400" />
        </div>
        <div className="absolute bottom-32 left-20 animate-float opacity-15 hidden lg:block" style={{ animationDelay: '3s' }}>
          <Star className="h-10 w-10 text-amber-400" />
        </div>
        <div className="absolute bottom-24 right-24 animate-float-slow opacity-20 hidden lg:block" style={{ animationDelay: '1s' }}>
          <Trophy className="h-14 w-14 text-accent-primary" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 relative z-10 text-center w-full">

          {/* badge */}
          <div className="animate-fade-up inline-flex items-center gap-2 bg-white/80 backdrop-blur border border-parchment-200 rounded-full px-4 py-1.5 text-sm font-medium text-accent-primary shadow-sm mb-8">
            <span className="w-2 h-2 rounded-full bg-accent-primary animate-pulse inline-block" />
            AI-Powered Academic Hub
          </div>

          <h1 className="animate-fade-up delay-100 text-5xl md:text-7xl font-extrabold text-ink-900 tracking-tight leading-tight mb-6">
            Smarter Notes.{' '}
            <span className="shimmer-text">Better Grades.</span>
          </h1>

          <p className="animate-fade-up delay-200 mt-4 text-xl text-ink-800 max-w-3xl mx-auto mb-10">
            The AI-enabled academic hub for university students. Find peer notes, get instant AI summaries, and exchange textbooks seamlessly.
          </p>

          <form onSubmit={onSearch} className="animate-fade-up delay-300 max-w-2xl mx-auto mb-10 relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="h-6 w-6 text-slate-400 group-focus-within:text-accent-primary transition-colors" />
            </div>
            <input
              type="text"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="block w-full pl-12 pr-36 py-4 border-2 border-parchment-200 rounded-full text-lg shadow-sm focus:ring-2 focus:ring-accent-primary focus:border-accent-primary bg-white/90 backdrop-blur placeholder-slate-400 transition-all hover:shadow-lg focus:shadow-xl"
              placeholder="Search for subjects, topics, or books..."
            />
            <button type="submit" className="absolute inset-y-2 right-2 px-6 bg-accent-primary text-white rounded-full font-medium hover:bg-accent-hover transition-all btn-glow">
              Search
            </button>
          </form>

          <div className="animate-fade-up delay-400 flex flex-col sm:flex-row justify-center gap-4">
            <Link to="/auth" className="inline-flex items-center justify-center px-8 py-4 text-base font-medium rounded-full text-white bg-accent-primary hover:bg-accent-hover md:text-lg shadow-lg btn-glow animate-pulse-glow">
              Join the Community
            </Link>
            <Link to="/upload" className="inline-flex items-center justify-center px-8 py-4 border-2 border-parchment-200 text-base font-medium rounded-full text-ink-800 bg-white/80 hover:bg-parchment-50 hover:border-parchment-300 md:text-lg transition-all btn-glow">
              Upload Notes <ArrowRight className="ml-2 h-5 w-5 animate-bounce-subtle" />
            </Link>
          </div>

          {/* scroll indicator */}
          <div className="animate-fade-up delay-600 mt-16 flex flex-col items-center gap-2 opacity-50">
            <span className="text-xs text-ink-800 tracking-widest uppercase">Scroll to explore</span>
            <div className="w-5 h-8 border-2 border-ink-800 rounded-full flex items-start justify-center p-1">
              <div className="w-1 h-2 bg-ink-800 rounded-full animate-bounce" />
            </div>
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section className="py-24 bg-parchment-50 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-accent-primary/30 to-transparent" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 reveal">
            <h2 className="text-4xl font-bold text-ink-900">Everything you need to succeed</h2>
            <p className="mt-4 text-lg text-ink-800">Built by students, for students. Powered by advanced AI.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: <Sparkles className="h-7 w-7 text-accent-primary" />,
                bg: 'bg-indigo-100',
                title: 'AI Summarization',
                desc: 'Turn long lecture PDFs into concise, study-ready summaries. Save hours of reading time.',
                delay: 'delay-100',
                link: '/ai-summary',
              },
              {
                icon: <FileText className="h-7 w-7 text-emerald-600" />,
                bg: 'bg-emerald-100',
                title: 'Notes Repository',
                desc: 'Access peer-shared notes organized by semester and subject. Rate, comment, and bookmark.',
                delay: 'delay-200',
                link: '/notes',
              },
              {
                icon: <Library className="h-7 w-7 text-amber-600" />,
                bg: 'bg-amber-100',
                title: 'Book Exchange',
                desc: 'Borrow, lend, or trade physical books with students on your campus.',
                delay: 'delay-300',
                link: '/book-exchange',
              },
            ].map(({ icon, bg, title, desc, delay, link }) => (
              <Link key={title} to={link} className={`reveal ${delay} card-hover bg-white p-8 rounded-2xl shadow-sm border border-parchment-200 group relative overflow-hidden block`}>
                {/* animated corner glow */}
                <div className="absolute -top-10 -right-10 w-32 h-32 bg-accent-primary/5 rounded-full group-hover:scale-150 transition-transform duration-500" />
                <div className={`w-14 h-14 ${bg} rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300`}>
                  {icon}
                </div>
                <h3 className="text-xl font-bold text-ink-900 mb-3">{title}</h3>
                <p className="text-ink-800">{desc}</p>
                <div className="mt-4 flex items-center gap-1 text-accent-primary text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                  Explore <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── EXTRA FEATURES ── */}
      <section className="py-20 bg-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="reveal-left space-y-6">
              <h2 className="text-4xl font-bold text-ink-900">More than just notes</h2>
              <p className="text-ink-800 text-lg">SAAR brings your entire academic life into one place.</p>
              <div className="space-y-4">
                {[
                  { icon: <Trophy className="h-5 w-5 text-amber-500" />, text: 'Leaderboard — compete with top contributors' },
                  { icon: <Zap className="h-5 w-5 text-indigo-500" />, text: 'PYQ Repository — past year question papers' },
                  { icon: <Users className="h-5 w-5 text-emerald-500" />, text: 'Real-time chat for book exchanges' },
                  { icon: <Star className="h-5 w-5 text-accent-primary" />, text: 'Rate & comment on notes and PYQs' },
                ].map(({ icon, text }, i) => (
                  <div key={i} className={`reveal delay-${(i + 1) * 100} flex items-center gap-3 p-3 rounded-xl hover:bg-parchment-50 transition-colors`}>
                    <div className="w-9 h-9 bg-parchment-100 rounded-lg flex items-center justify-center shrink-0">{icon}</div>
                    <span className="text-ink-800 font-medium">{text}</span>
                  </div>
                ))}
              </div>
              <Link to="/auth" className="inline-flex items-center gap-2 px-6 py-3 bg-accent-primary text-white rounded-full font-medium btn-glow">
                Get started free <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            {/* animated visual */}
            <div className="reveal relative flex items-center justify-center h-80">
              <div className="absolute w-64 h-64 bg-parchment-100 rounded-full animate-spin-slow opacity-30" />
              <div className="absolute w-48 h-48 bg-indigo-100 rounded-full animate-spin-slow opacity-20" style={{ animationDirection: 'reverse', animationDuration: '8s' }} />
              <div className="relative z-10 grid grid-cols-2 gap-4">
                {[
                  { icon: <Sparkles className="h-8 w-8 text-accent-primary" />, label: 'AI Summary', bg: 'bg-white' },
                  { icon: <FileText className="h-8 w-8 text-emerald-600" />, label: 'Notes', bg: 'bg-white' },
                  { icon: <Trophy className="h-8 w-8 text-amber-500" />, label: 'Leaderboard', bg: 'bg-white' },
                  { icon: <Library className="h-8 w-8 text-indigo-500" />, label: 'Books', bg: 'bg-white' },
                ].map(({ icon, label, bg }, i) => (
                  <div key={label} className={`${bg} rounded-2xl shadow-md border border-parchment-200 p-4 flex flex-col items-center gap-2 card-hover animate-float`}
                    style={{ animationDelay: `${i * 0.7}s` }}>
                    {icon}
                    <span className="text-xs font-semibold text-ink-900">{label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── STATS ── */}
      <section className="py-20 relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #1e1b4b 100%)' }}>
        <div className="absolute inset-0 opacity-10">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="absolute rounded-full bg-white animate-float"
              style={{ width: 80 + i * 30, height: 80 + i * 30, left: `${i * 18}%`, top: `${20 + (i % 3) * 20}%`, animationDelay: `${i * 0.8}s`, opacity: 0.05 }} />
          ))}
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h2 className="reveal text-3xl font-bold text-white mb-12">SAAR by the numbers</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { val: stats?.totalUsers, label: 'Registered students', icon: <Users className="h-6 w-6" /> },
              { val: stats?.totalNotes, label: 'Notes in repository', icon: <FileText className="h-6 w-6" /> },
              { val: stats?.totalBooks, label: 'Books listed', icon: <Library className="h-6 w-6" /> },
              { val: '∞', label: 'AI Summaries on demand', icon: <Sparkles className="h-6 w-6" /> },
            ].map(({ val, label, icon }, i) => (
              <div key={label} className={`reveal delay-${i * 100} group`}>
                <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center mx-auto mb-3 text-white group-hover:scale-110 transition-transform">
                  {icon}
                </div>
                <div className="text-5xl font-extrabold text-white mb-2">
                  <Counter target={typeof val === 'number' ? val : (val ?? '—')} />
                </div>
                <div className="text-indigo-200 text-sm">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-24 bg-parchment-50 relative overflow-hidden">
        <div className="absolute inset-0 gradient-animate opacity-40" />
        <div className="max-w-3xl mx-auto px-4 text-center relative z-10">
          <div className="reveal">
            <h2 className="text-4xl font-extrabold text-ink-900 mb-4">Ready to ace your semester?</h2>
            <p className="text-ink-800 text-lg mb-8">Join thousands of students already using SAAR to study smarter.</p>
            <Link to="/auth" className="inline-flex items-center gap-2 px-10 py-4 bg-accent-primary text-white rounded-full text-lg font-bold shadow-xl btn-glow animate-pulse-glow">
              Get Started — It's Free <ArrowRight className="h-5 w-5 animate-bounce-subtle" />
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
