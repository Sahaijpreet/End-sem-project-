import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Trophy, Upload, ThumbsUp, Download, UserCircle, Star, Zap } from 'lucide-react';
import { apiFetch, fileUrl } from '../lib/api';
import { useReveal } from '../hooks/useReveal';

const medals = ['🥇', '🥈', '🥉'];

const BG_ICONS = [
  { Icon: Trophy, top: '8%',  left: '4%',  size: 'h-16 w-16', delay: '0s',   dur: '4s'  },
  { Icon: Star,   top: '15%', left: '90%', size: 'h-10 w-10', delay: '1s',   dur: '5s'  },
  { Icon: Zap,    top: '50%', left: '92%', size: 'h-12 w-12', delay: '2s',   dur: '3.5s'},
  { Icon: Trophy, top: '75%', left: '5%',  size: 'h-8  w-8',  delay: '0.5s', dur: '6s'  },
  { Icon: Star,   top: '85%', left: '85%', size: 'h-14 w-14', delay: '1.5s', dur: '4.5s'},
  { Icon: Zap,    top: '35%', left: '2%',  size: 'h-10 w-10', delay: '3s',   dur: '5s'  },
];

export default function Leaderboard() {
  const [leaders, setLeaders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch('/api/leaderboard', { skipAuth: true })
      .then((r) => setLeaders(r.success ? r.data : []))
      .catch(() => setLeaders([]))
      .finally(() => setLoading(false));
  }, []);

  useReveal('.reveal, .reveal-left, .reveal-scale', [leaders]);

  return (
    <div className="flex-1 min-h-[calc(100vh-4rem)] relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #fbf8f1 0%, #f4ebd8 50%, #fbf8f1 100%)' }}>

      {/* animated gradient orbs */}
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-amber-200/30 rounded-full blur-3xl animate-float-slow pointer-events-none" />
      <div className="absolute -bottom-24 -right-24 w-80 h-80 bg-accent-primary/10 rounded-full blur-3xl animate-float pointer-events-none" style={{ animationDelay: '2s' }} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-100/20 rounded-full blur-3xl pointer-events-none" />

      {/* floating bg icons */}
      {BG_ICONS.map(({ Icon, top, left, size, delay, dur }, i) => (
        <div key={i} className="absolute pointer-events-none opacity-[0.06] animate-float" style={{ top, left, animationDelay: delay, animationDuration: dur }}>
          <Icon className={`${size} text-accent-primary`} />
        </div>
      ))}

      {/* spinning ring top-right */}
      <div className="absolute top-10 right-10 w-40 h-40 border-4 border-dashed border-amber-300/20 rounded-full animate-spin-slow pointer-events-none" />
      <div className="absolute bottom-20 left-10 w-24 h-24 border-2 border-dashed border-accent-primary/10 rounded-full animate-spin-slow pointer-events-none" style={{ animationDirection: 'reverse' }} />

      <div className="relative z-10 py-10 max-w-3xl mx-auto px-4 sm:px-6">

        {/* header */}
        <div className="animate-fade-up flex flex-col items-center text-center mb-10">
          <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mb-4 animate-float shadow-lg">
            <Trophy className="h-10 w-10 text-amber-500" />
          </div>
          <h1 className="text-4xl font-extrabold text-ink-900">Leaderboard</h1>
          <p className="text-ink-800 text-sm mt-2">Top contributors ranked by uploads, likes, and downloads.</p>
        </div>

        {/* top 3 podium */}
        {!loading && leaders.length >= 3 && (
          <div className="reveal flex items-end justify-center gap-4 mb-10">
            {[leaders[1], leaders[0], leaders[2]].map((u, podiumIdx) => {
              const rank = podiumIdx === 0 ? 2 : podiumIdx === 1 ? 1 : 3;
              const heights = { 1: 'h-28', 2: 'h-20', 3: 'h-16' };
              const colors  = { 1: 'bg-amber-400', 2: 'bg-slate-300', 3: 'bg-amber-600' };
              const sizes   = { 1: 'w-20 h-20', 2: 'w-16 h-16', 3: 'w-14 h-14' };
              return (
                <div key={u._id} className="flex flex-col items-center gap-2">
                  <div className={`${sizes[rank]} rounded-full overflow-hidden border-4 ${rank === 1 ? 'border-amber-400 animate-float' : 'border-parchment-200'} shadow-lg`}>
                    {u.Avatar ? (
                      <img src={fileUrl(u.Avatar)} alt={u.Name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-indigo-100 flex items-center justify-center">
                        <UserCircle className="h-8 w-8 text-accent-primary" />
                      </div>
                    )}
                  </div>
                  <Link to={`/user/${u._id}`} className="text-xs font-bold text-ink-900 truncate max-w-[80px] text-center hover:text-accent-primary hover:underline">{u.Name}</Link>
                  <p className="text-xs font-bold text-accent-primary">{u.score}pts</p>
                  <div className={`w-20 ${heights[rank]} ${colors[rank]} rounded-t-lg flex items-center justify-center text-white font-extrabold text-xl shadow-md`}>
                    {medals[rank - 1]}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* full list */}
        {loading ? (
          <p className="text-ink-800 text-center">Loading…</p>
        ) : leaders.length === 0 ? (
          <p className="text-ink-800 text-center">No data yet. Start uploading notes!</p>
        ) : (
          <div className="space-y-3">
            {leaders.map((u, i) => (
              <div key={u._id}
                className={`reveal delay-${Math.min(i * 100, 600)} card-hover bg-white/80 backdrop-blur rounded-xl border border-parchment-200 p-4 flex items-center gap-4 shadow-sm ${i < 3 ? 'ring-2 ring-amber-200' : ''}`}>
                <div className="w-10 text-center text-xl font-bold text-ink-900 shrink-0">
                  {medals[i] ?? <span className="text-slate-400 text-base">#{i + 1}</span>}
                </div>
                <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center shrink-0 overflow-hidden">
                  {u.Avatar ? (
                    <img src={fileUrl(u.Avatar)} alt={u.Name} className="w-full h-full object-cover" />
                  ) : (
                    <UserCircle className="h-7 w-7 text-accent-primary" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <Link to={`/user/${u._id}`} className="font-bold text-ink-900 truncate hover:text-accent-primary hover:underline block">{u.Name}</Link>
                  {(u.Branch || u.Year) && (
                    <p className="text-xs text-ink-800">{[u.Branch, u.Year ? `Year ${u.Year}` : ''].filter(Boolean).join(' · ')}</p>
                  )}
                </div>
                <div className="flex gap-3 text-sm text-ink-800 shrink-0">
                  <span className="flex items-center gap-1" title="Uploads"><Upload className="h-4 w-4 text-accent-primary" />{u.uploads}</span>
                  <span className="flex items-center gap-1" title="Likes"><ThumbsUp className="h-4 w-4 text-indigo-400" />{u.likes}</span>
                  <span className="flex items-center gap-1" title="Downloads"><Download className="h-4 w-4 text-emerald-500" />{u.downloads}</span>
                  <span className="font-bold text-accent-primary">{u.score}pts</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
