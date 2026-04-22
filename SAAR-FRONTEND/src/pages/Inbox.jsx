import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { MessageCircle, BookOpen, ChevronRight } from 'lucide-react';
import { apiFetch } from '../lib/api';
import { useAuth } from '../context/AuthContext';

export default function Inbox() {
  const { user } = useAuth();
  const [convos, setConvos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch('/api/chat/conversations')
      .then((res) => { if (res.success) setConvos(res.data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="flex-1 bg-parchment-50 py-8 min-h-[calc(100vh-4rem)]">
      <div className="max-w-2xl mx-auto px-4">
        <div className="flex items-center gap-3 mb-6">
          <MessageCircle className="h-6 w-6 text-accent-primary" />
          <h1 className="text-2xl font-bold text-ink-900">Inbox</h1>
        </div>

        <div className="bg-white rounded-xl border border-parchment-200 overflow-hidden shadow-sm">
          {loading ? (
            <p className="p-6 text-sm text-ink-800">Loading…</p>
          ) : convos.length === 0 ? (
            <div className="p-10 text-center">
              <MessageCircle className="h-10 w-10 text-slate-300 mx-auto mb-3" />
              <p className="text-ink-800 text-sm">No conversations yet.</p>
              <p className="text-ink-800 text-xs mt-1">Accept a book exchange request to start chatting.</p>
            </div>
          ) : (
            <div className="divide-y divide-parchment-100">
              {convos.map((c) => {
                const other = c.OwnerID?._id === user?._id ? c.RequesterID : c.OwnerID;
                return (
                  <Link
                    key={c._id}
                    to={`/chat/${c._id}`}
                    className="flex items-center gap-4 px-5 py-4 hover:bg-parchment-50 transition-colors group"
                  >
                    <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-accent-primary font-bold text-sm shrink-0">
                      {other?.Name?.charAt(0) || '?'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-ink-900 truncate">{other?.Name || 'User'}</p>
                      <p className="text-xs text-ink-800 flex items-center gap-1 truncate">
                        <BookOpen className="h-3 w-3 shrink-0" /> {c.BookID?.Title}
                      </p>
                      {c.LastMessage && (
                        <p className="text-xs text-slate-400 truncate mt-0.5">{c.LastMessage}</p>
                      )}
                    </div>
                    <div className="flex flex-col items-end gap-1 shrink-0">
                      <p className="text-xs text-slate-400">
                        {new Date(c.LastMessageAt).toLocaleDateString()}
                      </p>
                      <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-accent-primary transition-colors" />
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
