import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { MessageCircle, BookOpen, ChevronRight, Bell, Clock } from 'lucide-react';
import { apiFetch } from '../lib/api';
import { useAuth } from '../context/AuthContext';

export default function Inbox() {
  const { user } = useAuth();
  const [tab, setTab] = useState('chats'); // 'chats' | 'notifications'
  const [convos, setConvos] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    Promise.all([
      apiFetch('/api/chat/conversations'),
      apiFetch('/api/notifications?limit=10')
    ])
      .then(([chatRes, notifRes]) => {
        if (chatRes.success) setConvos(chatRes.data);
        if (notifRes.success) {
          setNotifications(notifRes.data);
          setUnreadCount(notifRes.unreadCount);
          // Auto mark all as read after fetching
          if (notifRes.unreadCount > 0) {
            apiFetch('/api/notifications/mark-all-read', { method: 'PATCH' }).catch(() => {});
            setUnreadCount(0);
          }
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  function formatTime(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  }

  return (
    <div className="flex-1 bg-parchment-50 py-8 min-h-[calc(100vh-4rem)]">
      <div className="max-w-2xl mx-auto px-4">
        <div className="flex items-center gap-3 mb-6">
          <MessageCircle className="h-6 w-6 text-accent-primary" />
          <h1 className="text-2xl font-bold text-ink-900">Inbox</h1>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 border-b border-parchment-200 mb-6">
          <button
            onClick={() => setTab('chats')}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              tab === 'chats' ? 'border-accent-primary text-accent-primary' : 'border-transparent text-ink-800 hover:text-ink-900'
            }`}
          >
            <MessageCircle className="h-4 w-4 inline mr-2" />
            Chats
          </button>
          <button
            onClick={() => setTab('notifications')}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors relative ${
              tab === 'notifications' ? 'border-accent-primary text-accent-primary' : 'border-transparent text-ink-800 hover:text-ink-900'
            }`}
          >
            <Bell className="h-4 w-4 inline mr-2" />
            Notifications
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>
        </div>

        <div className="bg-white rounded-xl border border-parchment-200 overflow-hidden shadow-sm">
          {tab === 'chats' ? (
            loading ? (
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
            )
          ) : (
            loading ? (
              <p className="p-6 text-sm text-ink-800">Loading…</p>
            ) : notifications.length === 0 ? (
              <div className="p-10 text-center">
                <Bell className="h-10 w-10 text-slate-300 mx-auto mb-3" />
                <p className="text-ink-800 text-sm">No notifications yet.</p>
                <p className="text-ink-800 text-xs mt-1">You'll see notifications here when you have activity.</p>
              </div>
            ) : (
              <>
                <div className="divide-y divide-parchment-100">
                  {notifications.map((notification) => {
                    const inner = (
                      <>
                        <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center shrink-0">
                          <Bell className="h-4 w-4 text-accent-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm ${
                            !notification.Read ? 'font-semibold text-ink-900' : 'text-ink-800'
                          }`}>
                            {notification.Message}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs text-ink-600 flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {formatTime(notification.createdAt)}
                            </span>
                            {!notification.Read && (
                              <span className="text-xs bg-accent-primary text-white px-2 py-0.5 rounded-full">
                                New
                              </span>
                            )}
                          </div>
                        </div>
                      </>
                    );
                    return notification.Link ? (
                      <Link
                        key={notification._id}
                        to={notification.Link}
                        className={`flex items-start gap-3 p-4 hover:bg-parchment-50 transition-colors ${
                          !notification.Read ? 'bg-blue-50/30' : ''
                        }`}
                      >
                        {inner}
                      </Link>
                    ) : (
                      <div
                        key={notification._id}
                        className={`flex items-start gap-3 p-4 ${
                          !notification.Read ? 'bg-blue-50/30' : ''
                        }`}
                      >
                        {inner}
                      </div>
                    );
                  })}
                </div>
                <div className="p-4 border-t border-parchment-200 text-center">
                  <Link
                    to="/notifications"
                    className="text-sm text-accent-primary hover:underline font-medium"
                  >
                    View all notifications
                  </Link>
                </div>
              </>
            )
          )}
        </div>
      </div>
    </div>
  );
}
