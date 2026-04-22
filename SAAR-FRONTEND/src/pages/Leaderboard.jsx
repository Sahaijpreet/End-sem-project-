import { useEffect, useState } from 'react';
import { Trophy, Upload, ThumbsUp, Download, UserCircle } from 'lucide-react';
import { apiFetch, fileUrl } from '../lib/api';
import { useReveal } from '../hooks/useReveal';

const medals = ['🥇', '🥈', '🥉'];

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
    <div className="flex-1 bg-parchment-50 py-10 min-h-[calc(100vh-4rem)]">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        <div className="flex items-center gap-3 mb-8">
          <Trophy className="h-8 w-8 text-amber-500" />
          <div>
            <h1 className="text-3xl font-bold text-ink-900">Leaderboard</h1>
            <p className="text-ink-800 text-sm mt-1">Top contributors ranked by uploads, likes, and downloads.</p>
          </div>
        </div>

        {loading ? (
          <p className="text-ink-800">Loading…</p>
        ) : leaders.length === 0 ? (
          <p className="text-ink-800">No data yet. Start uploading notes!</p>
        ) : (
          <div className="space-y-3">
            {leaders.map((u, i) => (
              <div
                key={u._id}
                className={`reveal delay-${Math.min(i * 100, 600)} card-hover bg-white rounded-xl border border-parchment-200 p-4 flex items-center gap-4 shadow-sm ${i < 3 ? 'ring-2 ring-amber-200' : ''}`}
              >
                <div className="w-10 text-center text-xl font-bold text-ink-900 shrink-0">
                  {medals[i] || <span className="text-slate-400 text-base">#{i + 1}</span>}
                </div>
                <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center shrink-0 overflow-hidden">
                  {u.Avatar ? (
                    <img src={fileUrl(u.Avatar)} alt={u.Name} className="w-full h-full object-cover" />
                  ) : (
                    <UserCircle className="h-7 w-7 text-accent-primary" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-ink-900 truncate">{u.Name}</p>
                  {(u.Branch || u.Year) && (
                    <p className="text-xs text-ink-800">{[u.Branch, u.Year ? `Year ${u.Year}` : ''].filter(Boolean).join(' · ')}</p>
                  )}
                </div>
                <div className="flex gap-4 text-sm text-ink-800 shrink-0">
                  <span className="flex items-center gap-1" title="Uploads">
                    <Upload className="h-4 w-4 text-accent-primary" /> {u.uploads}
                  </span>
                  <span className="flex items-center gap-1" title="Likes">
                    <ThumbsUp className="h-4 w-4 text-indigo-400" /> {u.likes}
                  </span>
                  <span className="flex items-center gap-1" title="Downloads">
                    <Download className="h-4 w-4 text-emerald-500" /> {u.downloads}
                  </span>
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
