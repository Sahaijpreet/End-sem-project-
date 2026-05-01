import { useEffect, useState } from 'react';
import { Inbox } from 'lucide-react';
import { apiFetch } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';

export default function UnifiedInbox() {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);
  const [recentItems, setRecentItems] = useState([]);
  const [loading, setLoading] = useState(false);

  async function loadUnreadCounts() {
    if (!isAuthenticated) return;
    try {
      const res = await apiFetch('/api/notifications/unread-count');
      if (res.success) setUnreadCount(res.data.count);
    } catch {}
  }

  async function loadRecentItems() {
    if (!isAuthenticated || loading) return;
    setLoading(true);
    try {
      const [notifRes, chatRes] = await Promise.all([
        apiFetch('/api/notifications?limit=3'),
        apiFetch('/api/chat/conversations'),
      ]);

      const items = [];

      if (notifRes.success) {
        notifRes.data.forEach((notif) => {
          items.push({
            id: notif._id,
            type: 'notification',
            title: notif.Message,
            time: notif.createdAt,
            unread: !notif.Read,
            link: notif.Link || null,
          });
        });
      }

      if (chatRes.success) {
        chatRes.data.slice(0, 2).forEach((chat) => {
          const other = chat.OwnerID?._id === user?._id ? chat.RequesterID : chat.OwnerID;
          items.push({
            id: chat._id,
            type: 'chat',
            title: `${other?.Name || 'User'}: ${chat.LastMessage || 'New conversation'}`,
            subtitle: chat.BookID?.Title,
            time: chat.LastMessageAt || chat.createdAt,
            unread: false,
            link: `/chat/${chat._id}`,
          });
        });
      }

      items.sort((a, b) => new Date(b.time) - new Date(a.time));
      setRecentItems(items.slice(0, 5));
    } catch {}
    finally { setLoading(false); }
  }

  useEffect(() => {
    loadUnreadCounts();
    const interval = setInterval(loadUnreadCounts, 60000);
    return () => clearInterval(interval);
  }, [isAuthenticated]);

  function handleItemClick(item) {
    setShowDropdown(false);
    if (item.link) navigate(item.link);
  }

  function formatTime(dateString) {
    const date = new Date(dateString);
    const diff = Date.now() - date;
    const m = Math.floor(diff / 60000);
    const h = Math.floor(diff / 3600000);
    if (m < 1) return 'Just now';
    if (m < 60) return `${m}m ago`;
    if (h < 24) return `${h}h ago`;
    return date.toLocaleDateString();
  }

  if (!isAuthenticated) return null;

  return (
    <div className="relative">
      <button
        onClick={() => { if (!showDropdown) loadRecentItems(); setShowDropdown((o) => !o); }}
        className="relative p-1.5 rounded-full text-ink-800 hover:text-accent-primary hover:bg-parchment-100 transition-colors"
        title="Inbox"
      >
        <Inbox className="h-4 w-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-1 bg-red-500 text-white text-xs rounded-full h-3.5 w-3.5 flex items-center justify-center font-medium">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {showDropdown && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setShowDropdown(false)} />
          <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-parchment-200 z-20 overflow-hidden">
            <div className="px-4 py-3 border-b border-parchment-200 flex items-center justify-between">
              <h3 className="font-semibold text-ink-900 text-sm">Inbox</h3>
              <Link to="/inbox" onClick={() => setShowDropdown(false)} className="text-xs text-accent-primary hover:underline">
                View all
              </Link>
            </div>

            <div className="max-h-72 overflow-y-auto divide-y divide-parchment-100">
              {loading ? (
                <p className="p-4 text-center text-sm text-ink-800">Loading…</p>
              ) : recentItems.length === 0 ? (
                <p className="p-4 text-center text-sm text-ink-800">No recent activity</p>
              ) : recentItems.map((item) => (
                <button
                  key={`${item.type}-${item.id}`}
                  type="button"
                  onClick={() => handleItemClick(item)}
                  className={`w-full text-left px-4 py-3 hover:bg-parchment-50 transition-colors ${item.unread ? 'bg-blue-50/30' : ''}`}
                >
                  <p className={`text-sm leading-snug ${item.unread ? 'font-semibold text-ink-900' : 'text-ink-800'}`}>
                    {item.title}
                  </p>
                  {item.subtitle && (
                    <p className="text-xs text-ink-600 mt-0.5 truncate">{item.subtitle}</p>
                  )}
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-slate-400">{formatTime(item.time)}</span>
                    {item.unread && <span className="text-xs bg-accent-primary text-white px-1.5 py-0.5 rounded-full">New</span>}
                  </div>
                </button>
              ))}
            </div>

            <div className="px-4 py-2.5 border-t border-parchment-200 flex justify-between">
              <Link to="/inbox" onClick={() => setShowDropdown(false)} className="text-xs text-accent-primary hover:underline font-medium">All Chats</Link>
              <Link to="/inbox" onClick={() => setShowDropdown(false)} className="text-xs text-accent-primary hover:underline font-medium">All Notifications</Link>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
