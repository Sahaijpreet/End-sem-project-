import { useEffect, useRef, useState } from 'react';
import { Bell, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { apiFetch } from '../lib/api';
import { useAuth } from '../context/AuthContext';

export default function NotificationBell() {
  const { isAuthenticated } = useAuth();
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unread, setUnread] = useState(0);
  const ref = useRef(null);

  useEffect(() => {
    if (!isAuthenticated) return;
    const load = () => {
      apiFetch('/api/notifications').then((r) => {
        if (r.success) {
          setNotifications(r.data);
          setUnread(r.data.filter((n) => !n.Read).length);
        }
      }).catch(() => {});
    };
    load();
    const interval = setInterval(load, 30000);
    return () => clearInterval(interval);
  }, [isAuthenticated]);

  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  function handleOpen() {
    setOpen((o) => !o);
    if (!open && unread > 0) {
      apiFetch('/api/notifications/read-all', { method: 'PATCH', body: JSON.stringify({}) })
        .then(() => setUnread(0)).catch(() => {});
    }
  }

  if (!isAuthenticated) return null;

  return (
    <div ref={ref} className="relative">
      <button onClick={handleOpen} className="relative p-1.5 rounded-full text-ink-800 hover:text-accent-primary hover:bg-parchment-100 transition-colors">
        <Bell className="h-4 w-4" />
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-white border border-parchment-200 rounded-xl shadow-xl z-50 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-parchment-100">
            <h3 className="font-bold text-ink-900 text-sm">Notifications</h3>
            <button onClick={() => setOpen(false)} className="text-slate-400 hover:text-ink-900"><X className="h-4 w-4" /></button>
          </div>
          <div className="max-h-80 overflow-y-auto divide-y divide-parchment-100">
            {notifications.length === 0 ? (
              <p className="p-4 text-sm text-ink-800 text-center">No notifications yet.</p>
            ) : notifications.map((n) => (
              <Link key={n._id} to={n.Link || '#'} onClick={() => setOpen(false)}
                className={`block px-4 py-3 hover:bg-parchment-50 transition-colors ${!n.Read ? 'bg-indigo-50/50' : ''}`}>
                <p className="text-sm text-ink-900">{n.Message}</p>
                <p className="text-xs text-slate-400 mt-0.5">{new Date(n.createdAt).toLocaleDateString()}</p>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
