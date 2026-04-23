import { useEffect, useRef, useState } from 'react';
import { Search, FileText, Library, Sparkles, ArrowRight, BookOpen, Trophy, Users, Clock, HelpCircle, ChevronRight } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { apiFetch } from '../lib/api';
import { useReveal } from '../hooks/useReveal';

const WORDS = ['Better Grades.', 'Smarter Study.', 'Real Results.', 'Your Future.'];

function Typewriter() {
  const [idx, setIdx] = useState(0);
  const [displayed, setDisplayed] = useState('');
  const [deleting, setDeleting] = useState(false);
  useEffect(() => {
    const word = WORDS[idx];
    if (!deleting && displayed.length < word.length) {
      const t = setTimeout(() => setDisplayed(word.slice(0, displayed.length + 1)), 80);
      return () => clearTimeout(t);
    }
    if (!deleting && displayed.length === word.length) {
      const t = setTimeout(() => setDeleting(true), 1800);
      return () => clearTimeout(t);
    }
    if (deleting && displayed.length > 0) {
      const t = setTimeout(() => setDisplayed(displayed.slice(0, -1)), 45);
      return () => clearTimeout(t);
    }
    if (deleting && displayed.length === 0) { setDeleting(false); setIdx((i) => (i + 1) % WORDS.length); }
  }, [displayed, deleting, idx]);
  return (
    <span style={{ background: 'linear-gradient(90deg,#6b7c3a,#8a9a4a,#b5c26a,#6b7c3a)', backgroundSize: '200% auto', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', animation: 'shimmer 3s linear infinite' }}>
      {displayed}<span className="border-r-2 border-green-600 ml-0.5 animate-pulse" style={{ WebkitTextFillColor: 'transparent' }} />
    </span>
  );
}

function Counter({ target, duration = 1800 }) {
  const [val, setVal] = useState(0);
  const ref = useRef(null);
  useEffect(() => {
    if (typeof target !== 'number') { setVal(target); return; }
    const observer = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      observer.disconnect();
      let start = 0;
      const step = Math.ceil(target / (duration / 16));
      const timer = setInterval(() => { start += step; if (start >= target) { setVal(target); clearInterval(timer); } else setVal(start); }, 16);
    }, { threshold: 0.5 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target, duration]);
  return <span ref={ref}>{typeof target === 'number' ? val.toLocaleString() : target}</span>;
}

const FEATURES = [
  { icon: <Sparkles className="h-6 w-6" />, title: 'AI Summaries',  desc: 'Instant PDF summaries powered by Gemini AI', from: '#6b7c3a', to: '#8a9a4a', link: '/ai-summary',    span: 'md:col-span-2' },
  { icon: <FileText  className="h-6 w-6" />, title: 'Notes Repo',   desc: 'Peer-shared notes by subject & semester',   from: '#556130', to: '#6b7c3a', link: '/notes',          span: '' },
  { icon: <Library   className="h-6 w-6" />, title: 'Book Exchange',desc: 'Trade textbooks with campus students',       from: '#556130', to: '#8a9a4a', link: '/book-exchange',  span: '' },
  { icon: <HelpCircle className="h-6 w-6"/>, title: 'Doubt Forum',  desc: 'Ask questions, get peer answers',           from: '#3d5228', to: '#7a8f3a', link: '/forum',          span: '' },
  { icon: <Users     className="h-6 w-6" />, title: 'Study Groups', desc: 'Real-time group chats by subject',          from: '#3d5228', to: '#6b7c3a', link: '/groups',         span: '' },
  { icon: <Trophy    className="h-6 w-6" />, title: 'Leaderboard',  desc: 'Compete with top contributors',             from: '#713f12', to: '#a16207', link: '/leaderboard',    span: '' },
  { icon: <Clock     className="h-6 w-6" />, title: 'Timetable',    desc: 'Manage your weekly schedule',               from: '#3d5228', to: '#4a5c2a', link: '/timetable',      span: '' },
  { icon: <BookOpen  className="h-6 w-6" />, title: 'PYQ Papers',   desc: 'Past year question papers archive',         from: '#556130', to: '#6b7c3a', link: '/pyqs',           span: '' },
];

export default function Home() {
  const [stats, setStats] = useState(null);
  const [q, setQ] = useState('');
  const navigate = useNavigate();
  useReveal();

  useEffect(() => {
    apiFetch('/api/public/stats', { skipAuth: true }).then((r) => r.success && setStats(r.data)).catch(() => {});
  }, []);

  return (
    <div className="flex flex-col min-h-screen overflow-x-hidden">

      {/* ── HERO ── */}
      <section className="relative min-h-screen flex items-center overflow-hidden" style={{ background: 'linear-gradient(160deg, #f7f7e8 0%, #f0f0d8 40%, #f7f7e8 100%)' }}>

        {/* forest blobs */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-40 -left-40 w-[550px] h-[550px] rounded-full blur-3xl opacity-30 animate-float-slow" style={{ background: 'radial-gradient(circle, #8a9a4a, #6b7c3a)' }} />
          <div className="absolute top-10 right-[-80px] w-[400px] h-[400px] rounded-full blur-3xl opacity-20 animate-float" style={{ background: 'radial-gradient(circle, #8a9a4a, #b5c26a)', animationDelay: '2s' }} />
          <div className="absolute bottom-[-60px] left-[25%] w-[380px] h-[380px] rounded-full blur-3xl opacity-20 animate-float-slow" style={{ background: 'radial-gradient(circle, #7a8f3a, #556130)', animationDelay: '4s' }} />
          <div className="absolute bottom-10 right-10 w-[220px] h-[220px] rounded-full blur-3xl opacity-15 animate-float" style={{ background: 'radial-gradient(circle, #a16207, #713f12)', animationDelay: '1s' }} />
          {/* leaf dot pattern */}
          <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: 'radial-gradient(circle, #6b7c3a 1px, transparent 1px)', backgroundSize: '28px 28px' }} />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10 w-full">
          <div className="grid lg:grid-cols-2 gap-16 items-center">

            {/* Left */}
            <div>
              <div className="animate-fade-up inline-flex items-center gap-2 bg-yellow-100 border border-yellow-600/30 rounded-full px-4 py-1.5 text-sm font-semibold text-stone-700 mb-8">
                <span className="w-2 h-2 rounded-full bg-green-600 animate-pulse inline-block" />
                AI-Powered Academic Hub
              </div>

              <h1 className="animate-fade-up delay-100 text-5xl md:text-6xl lg:text-7xl font-extrabold text-stone-900 tracking-tight leading-[1.1] mb-6">
                Smarter Notes.<br />
                <Typewriter />
              </h1>

              <p className="animate-fade-up delay-200 text-lg text-gray-600 max-w-lg mb-10 leading-relaxed">
                The all-in-one academic platform — AI summaries, peer notes, book exchange, study groups, and more. Built for students, by students.
              </p>

              <form onSubmit={(e) => { e.preventDefault(); navigate(q.trim() ? `/notes?q=${encodeURIComponent(q.trim())}` : '/notes'); }}
                className="animate-fade-up delay-300 relative mb-8 group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-yellow-700/50 group-focus-within:text-green-700 transition-colors" />
                </div>
                <input type="text" value={q} onChange={(e) => setQ(e.target.value)}
                  className="w-full pl-12 pr-32 py-4 bg-white border-2 border-yellow-700/20 rounded-2xl text-gray-900 placeholder-gray-400 focus:outline-none focus:border-yellow-700 focus:bg-white text-base transition-all shadow-sm hover:shadow-md"
                  placeholder="Search notes, subjects, books…" />
                <button type="submit"
                  className="absolute inset-y-2 right-2 px-5 rounded-xl font-semibold text-sm text-white transition-all btn-glow"
                  style={{ background: 'linear-gradient(135deg, #6b7c3a, #8a9a4a)' }}>
                  Search
                </button>
              </form>

              <div className="animate-fade-up delay-400 flex flex-wrap gap-3">
                <Link to="/auth"
                  className="inline-flex items-center gap-2 px-7 py-3.5 text-white rounded-2xl font-bold text-base shadow-lg btn-glow"
                  style={{ background: 'linear-gradient(135deg, #556130, #8a9a4a)' }}>
                  Get Started Free <ArrowRight className="h-4 w-4" />
                </Link>
                <Link to="/notes"
                  className="inline-flex items-center gap-2 px-7 py-3.5 bg-white text-stone-700 rounded-2xl font-semibold text-base border border-yellow-700/20 hover:bg-yellow-50 transition-all shadow-sm">
                  Browse Notes
                </Link>
              </div>

              <div className="animate-fade-up delay-500 flex gap-8 mt-10">
                {[
                  { val: stats?.totalUsers ?? '—', label: 'Students', color: '#6b7c3a' },
                  { val: stats?.totalNotes ?? '—', label: 'Notes',    color: '#6b7c3a' },
                  { val: stats?.totalBooks ?? '—', label: 'Books',    color: '#a16207' },
                ].map(({ val, label, color }) => (
                  <div key={label}>
                    <div className="text-2xl font-extrabold" style={{ color }}>
                      <Counter target={typeof val === 'number' ? val : val} />
                    </div>
                    <div className="text-xs text-gray-500 mt-0.5">{label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right — floating cards */}
            <div className="hidden lg:block relative h-[520px]">
              {[
                { icon: <Sparkles className="h-5 w-5" />, title: 'AI Summary',   sub: 'Gemini-powered',    top: '0%',  left: '10%', delay: '0s',   from: '#6b7c3a', to: '#8a9a4a' },
                { icon: <FileText  className="h-5 w-5" />, title: 'Notes Repo',  sub: 'Peer-shared notes', top: '18%', left: '55%', delay: '0.6s', from: '#556130', to: '#6b7c3a' },
                { icon: <Trophy    className="h-5 w-5" />, title: 'Leaderboard', sub: 'Top contributors',  top: '45%', left: '0%',  delay: '1.2s', from: '#713f12', to: '#a16207' },
                { icon: <Users     className="h-5 w-5" />, title: 'Study Groups',sub: 'Real-time chat',    top: '58%', left: '52%', delay: '1.8s', from: '#3d5228', to: '#7a8f3a' },
                { icon: <HelpCircle className="h-5 w-5"/>, title: 'Doubt Forum', sub: 'Get answers fast',  top: '80%', left: '22%', delay: '2.4s', from: '#556130', to: '#8a9a4a' },
              ].map(({ icon, title, sub, top, left, delay, from, to }) => (
                <div key={title} className="absolute bg-white/90 backdrop-blur rounded-2xl p-4 w-44 shadow-xl border border-yellow-100 animate-float bento-card"
                  style={{ top, left, animationDelay: delay }}>
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white mb-2" style={{ background: `linear-gradient(135deg, ${from}, ${to})` }}>
                    {icon}
                  </div>
                  <p className="font-bold text-stone-900 text-sm">{title}</p>
                  <p className="text-gray-500 text-xs mt-0.5">{sub}</p>
                </div>
              ))}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-56 h-56 rounded-full blur-3xl opacity-25 animate-glow-pulse"
                style={{ background: 'radial-gradient(circle, #8a9a4a, #6b7c3a)' }} />
            </div>
          </div>
        </div>

        {/* bottom wave */}
        <div className="absolute bottom-0 left-0 right-0 overflow-hidden leading-none">
          <svg viewBox="0 0 1440 60" className="w-full" preserveAspectRatio="none" style={{ height: 60 }}>
            <path d="M0,30 C360,60 1080,0 1440,30 L1440,60 L0,60 Z" fill="#f7f7e8" />
          </svg>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section className="py-12 relative overflow-hidden" style={{ background: '#f7f7e8' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <span className="inline-block text-xs font-bold tracking-widest uppercase mb-3 px-3 py-1 rounded-full bg-yellow-200/60 text-stone-700">Everything in one place</span>
            <h2 className="text-4xl md:text-5xl font-extrabold text-stone-900 mt-3">Your academic toolkit</h2>
            <p className="mt-4 text-gray-500 text-lg max-w-2xl mx-auto">8 powerful features to make university life easier.</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {FEATURES.map(({ icon, title, desc, from, to, link, span }, i) => (
              <Link key={title} to={link}
                className={`${span} bento-card bg-white rounded-2xl p-6 group relative overflow-hidden border border-yellow-100 shadow-sm hover:shadow-lg transition-all`}>
                <div className="absolute inset-0 opacity-0 group-hover:opacity-[0.04] transition-opacity duration-500 rounded-2xl"
                  style={{ background: `linear-gradient(135deg, ${from}, ${to})` }} />
                <div className="w-11 h-11 rounded-xl flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform duration-300"
                  style={{ background: `linear-gradient(135deg, ${from}, ${to})` }}>
                  {icon}
                </div>
                <h3 className="font-bold text-stone-900 text-base mb-1">{title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
                <div className="mt-4 flex items-center gap-1 text-xs font-semibold opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: from }}>
                  Open <ChevronRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="py-12 bg-white relative overflow-hidden">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <span className="inline-block text-xs font-bold tracking-widest uppercase mb-3 px-3 py-1 rounded-full bg-yellow-100 text-yellow-800">Simple as 1-2-3</span>
            <h2 className="text-4xl font-extrabold text-stone-900 mt-3">How SAAR works</h2>
          </div>
          <div className="flex flex-col md:flex-row gap-6 items-stretch">
            {[
              { step: '01', title: 'Sign up free',   desc: 'Create your account in seconds. No credit card needed.',                 icon: <Users    className="h-8 w-8" />, from: '#6b7c3a', to: '#8a9a4a' },
              { step: '02', title: 'Find or upload', desc: 'Browse notes, PYQs, and books — or contribute your own.',                icon: <FileText className="h-8 w-8" />, from: '#556130', to: '#8a9a4a' },
              { step: '03', title: 'Study smarter',  desc: 'Use AI summaries, join study groups, and track your syllabus progress.', icon: <Sparkles className="h-8 w-8" />, from: '#3d5228', to: '#7a8f3a' },
            ].map(({ step, title, desc, icon, from, to }, i) => (
              <>
                <div key={step} className="relative rounded-2xl p-6 border border-yellow-100 shadow-sm hover:shadow-md transition-all md:col-span-1 overflow-hidden" style={{ background: '#f7f7e8' }}>
                  <div className="text-5xl font-black absolute top-3 right-4 select-none opacity-[0.07] text-green-900 leading-none">{step}</div>
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white mb-4"
                    style={{ background: `linear-gradient(135deg, ${from}, ${to})` }}>
                    {icon}
                  </div>
                  <h3 className="text-base font-bold text-stone-900 mb-2">{title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
                </div>
                {i < 2 && (
                  <div key={`arrow-${i}`} className="hidden md:flex items-center justify-center">
                    <div className="flex flex-col items-center gap-1">
                      <div className="w-8 h-px bg-yellow-600/30" />
                      <ArrowRight className="h-6 w-6 text-yellow-700/50" />
                      <div className="w-8 h-px bg-yellow-600/30" />
                    </div>
                  </div>
                )}
              </>
            ))}
          </div>
        </div>
      </section>

      {/* ── STATS ── */}
      <section className="py-10 relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #556130 0%, #6b7c3a 40%, #6b7c3a 70%, #556130 100%)' }}>
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle, #b5c26a 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { val: stats?.totalUsers, label: 'Students',    icon: '🌿' },
              { val: stats?.totalNotes, label: 'Notes shared',icon: '📄' },
              { val: stats?.totalBooks, label: 'Books listed', icon: '📚' },
              { val: '∞',               label: 'AI Summaries', icon: '✨' },
            ].map(({ val, label, icon }, i) => (
              <div key={label}>
                <div className="text-3xl mb-2">{icon}</div>
                <div className="text-4xl md:text-5xl font-extrabold text-white mb-1">
                  <Counter target={typeof val === 'number' ? val : (val ?? '—')} />
                </div>
                <div className="text-green-200/70 text-sm">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── QUOTE ── */}
      <section className="py-12 bg-white">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <div className="">
            <div className="text-5xl mb-6">🌱</div>
            <blockquote className="text-2xl md:text-3xl font-bold text-stone-900 leading-relaxed mb-6">
              "SAAR saved me 3 hours before my end-sem exam. The AI summary was spot on."
            </blockquote>
            <p className="text-gray-500">— A student who aced their semester</p>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-14 relative overflow-hidden" style={{ background: 'linear-gradient(160deg, #f7f7e8 0%, #f0f0d8 50%, #f7f7e8 100%)' }}>
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-20 -left-20 w-80 h-80 rounded-full blur-3xl opacity-20 animate-float-slow" style={{ background: 'radial-gradient(circle, #8a9a4a, #6b7c3a)' }} />
          <div className="absolute -bottom-20 -right-20 w-80 h-80 rounded-full blur-3xl opacity-20 animate-float" style={{ background: 'radial-gradient(circle, #8a9a4a, #556130)', animationDelay: '2s' }} />
        </div>
        <div className="max-w-3xl mx-auto px-4 text-center relative z-10">
          <div className="">
            <span className="inline-block text-xs font-bold tracking-widest uppercase mb-4 px-3 py-1 rounded-full bg-yellow-200/60 text-stone-700">Start today</span>
            <h2 className="text-5xl md:text-6xl font-extrabold text-stone-900 mb-6 leading-tight mt-3">
              Ready to grow<br />
              <span style={{ background: 'linear-gradient(90deg,#6b7c3a,#8a9a4a,#b5c26a,#6b7c3a)', backgroundSize: '200% auto', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', animation: 'shimmer 3s linear infinite', display: 'inline-block' }}>
                smarter?
              </span>
            </h2>
            <p className="text-gray-500 text-lg mb-10 max-w-xl mx-auto">Join your peers on SAAR. Free forever. No credit card required.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/auth"
                className="inline-flex items-center justify-center gap-2 px-10 py-4 text-white rounded-2xl text-lg font-bold shadow-xl btn-glow"
                style={{ background: 'linear-gradient(135deg, #556130, #8a9a4a)' }}>
                Get Started Free <ArrowRight className="h-5 w-5" />
              </Link>
              <Link to="/notes"
                className="inline-flex items-center justify-center gap-2 px-10 py-4 bg-white text-stone-700 rounded-2xl text-lg font-semibold border border-yellow-700/20 hover:bg-yellow-50 transition-all shadow-sm">
                Browse Notes
              </Link>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
