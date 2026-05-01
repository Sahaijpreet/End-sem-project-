import { useEffect, useState } from 'react';
import { Bell, Check, CheckCheck, Trash2, Filter, RefreshCw, ExternalLink, Clock, User, BookOpen, MessageCircle, Heart } from 'lucide-react';
import { apiFetch } from '../lib/api';
import { useToast } from '../context/ToastContext';
import { Link } from 'react-router-dom';

const NOTIFICATION_ICONS = {
  book_requested: BookOpen,
  request_accepted: Check,
  request_declined: Trash2,
  new_message: MessageCircle,
  exchange_confirmed: CheckCheck,
  new_answer: MessageCircle,
  new_follower: User,
};

const NOTIFICATION_COLORS = {
  book_requested: 'text-blue-600 bg-blue-100',
  request_accepted: 'text-emerald-600 bg-emerald-100',
  request_declined: 'text-rose-600 bg-rose-100',
  new_message: 'text-indigo-600 bg-indigo-100',
  exchange_confirmed: 'text-green-600 bg-green-100',
  new_answer: 'text-purple-600 bg-purple-100',
  new_follower: 'text-pink-600 bg-pink-100',
};

export default function Notifications() {
  const toast = useToast();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // 'all', 'unread', 'read'
  const [typeFilter, setTypeFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [actionLoading, setActionLoading] = useState(null);

  async function loadNotifications(pageNum = 1, reset = false) {
    try {
      setLoading(pageNum === 1);
      const res = await apiFetch(`/api/notifications?page=${pageNum}&limit=20`);
      if (res.success) {
        if (reset || pageNum === 1) {
          setNotifications(res.data);
        } else {
          setNotifications(prev => [...prev, ...res.data]);
        }
        setPagination(res.pagination);
        setUnreadCount(res.unreadCount);
        setPage(pageNum);
      }
    } catch (err) {
      toast(err.message || 'Failed to load notifications', 'error');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadNotifications();
    // Auto mark all as read when page opens
    apiFetch('/api/notifications/mark-all-read', { method: 'PATCH' }).catch(() => {});
  }, []);

  async function markAsRead(id) {
    setActionLoading(id);
    try {
      await apiFetch(`/api/notifications/${id}/read`, { method: 'PATCH' });
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, Read: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      toast(err.message || 'Failed to mark as read', 'error');
    } finally {
      setActionLoading(null);
    }
  }

  async function markAllRead() {
    setActionLoading('all');
    try {
      await apiFetch('/api/notifications/mark-all-read', { method: 'PATCH' });
      setNotifications(prev => prev.map(n => ({ ...n, Read: true })));
      setUnreadCount(0);
      toast('All notifications marked as read');
    } catch (err) {
      toast(err.message || 'Failed to mark all as read', 'error');
    } finally {
      setActionLoading(null);
    }
  }

  async function deleteNotification(id) {
    setActionLoading(id);
    try {
      await apiFetch(`/api/notifications/${id}`, { method: 'DELETE' });
      setNotifications(prev => prev.filter(n => n._id !== id));
      toast('Notification deleted');
    } catch (err) {
      toast(err.message || 'Failed to delete notification', 'error');
    } finally {
      setActionLoading(null);
    }
  }

  async function clearAll() {
    if (!window.confirm('Delete all notifications? This cannot be undone.')) return;
    setActionLoading('clear');
    try {
      await apiFetch('/api/notifications', { method: 'DELETE' });
      setNotifications([]);
      setUnreadCount(0);
      toast('All notifications cleared');
    } catch (err) {
      toast(err.message || 'Failed to clear notifications', 'error');
    } finally {
      setActionLoading(null);
    }
  }

  const filteredNotifications = notifications.filter(n => {
    if (filter === 'unread' && n.Read) return false;
    if (filter === 'read' && !n.Read) return false;
    if (typeFilter !== 'all' && n.Type !== typeFilter) return false;
    return true;
  });

  const hasMore = pagination && page < pagination.pages;

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
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-3">
            <Bell className="h-6 w-6 text-accent-primary" />
            <div>
              <h1 className="text-2xl font-bold text-ink-900">Notifications</h1>
              <p className="text-sm text-ink-800 mt-1">
                {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}` : 'All caught up!'}
              </p>
            </div>
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={() => loadNotifications(1, true)}
              disabled={loading}
              className="flex items-center gap-2 px-3 py-2 border border-parchment-300 rounded-lg text-sm bg-white hover:bg-parchment-50 disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            
            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                disabled={actionLoading === 'all'}
                className="flex items-center gap-2 px-3 py-2 bg-accent-primary text-white rounded-lg text-sm hover:bg-accent-hover disabled:opacity-50"
              >
                <CheckCheck className="h-4 w-4" />
                Mark all read
              </button>
            )}
            
            {notifications.length > 0 && (
              <button
                onClick={clearAll}
                disabled={actionLoading === 'clear'}
                className="flex items-center gap-2 px-3 py-2 border border-rose-300 text-rose-600 rounded-lg text-sm hover:bg-rose-50 disabled:opacity-50"
              >
                <Trash2 className="h-4 w-4" />
                Clear all
              </button>
            )}
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl border border-parchment-200 p-4 mb-6">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-ink-800" />
              <span className="text-sm font-medium text-ink-800">Filter:</span>
            </div>
            
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="border border-parchment-300 rounded-md px-3 py-1.5 text-sm"
            >
              <option value="all">All notifications</option>
              <option value="unread">Unread only</option>
              <option value="read">Read only</option>
            </select>
            
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="border border-parchment-300 rounded-md px-3 py-1.5 text-sm"
            >
              <option value="all">All types</option>
              <option value="book_requested">Book requests</option>
              <option value="request_accepted">Request accepted</option>
              <option value="request_declined">Request declined</option>
              <option value="new_message">Messages</option>
              <option value="exchange_confirmed">Exchanges</option>
              <option value="new_follower">New followers</option>
            </select>
            
            <div className="text-sm text-ink-800 ml-auto">
              {filteredNotifications.length} of {notifications.length} notifications
            </div>
          </div>
        </div>

        {/* Notifications List */}
        <div className="bg-white rounded-xl border border-parchment-200 overflow-hidden">
          {loading && notifications.length === 0 ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent-primary mx-auto mb-4"></div>
              <p className="text-ink-800">Loading notifications...</p>
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="p-8 text-center">
              <Bell className="h-12 w-12 text-slate-300 mx-auto mb-4" />
              <p className="text-ink-800 font-medium">No notifications found</p>
              <p className="text-sm text-ink-600 mt-1">
                {filter === 'unread' ? 'All notifications have been read' : 
                 typeFilter !== 'all' ? 'No notifications of this type' : 
                 'You\'ll see notifications here when you have activity'}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-parchment-100">
              {filteredNotifications.map((notification) => {
                const Icon = NOTIFICATION_ICONS[notification.Type] || Bell;
                const colorClass = NOTIFICATION_COLORS[notification.Type] || 'text-gray-600 bg-gray-100';
                
                return (
                  <div
                    key={notification._id}
                    className={`p-4 hover:bg-parchment-50 transition-colors ${!notification.Read ? 'bg-blue-50/30' : ''}`}
                  >
                    <div className="flex items-start gap-4">
                      <div className={`p-2 rounded-lg ${colorClass} shrink-0`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <p className={`text-sm ${!notification.Read ? 'font-semibold text-ink-900' : 'text-ink-800'}`}>
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
                          
                          <div className="flex items-center gap-1 shrink-0">
                            {notification.Link && (
                              <Link
                                to={notification.Link}
                                onClick={() => !notification.Read && markAsRead(notification._id)}
                                className="p-1.5 text-accent-primary hover:bg-indigo-50 rounded-md transition-colors"
                                title="View details"
                              >
                                <ExternalLink className="h-4 w-4" />
                              </Link>
                            )}
                            
                            {!notification.Read && (
                              <button
                                onClick={() => markAsRead(notification._id)}
                                disabled={actionLoading === notification._id}
                                className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-md transition-colors disabled:opacity-50"
                                title="Mark as read"
                              >
                                <Check className="h-4 w-4" />
                              </button>
                            )}
                            
                            <button
                              onClick={() => deleteNotification(notification._id)}
                              disabled={actionLoading === notification._id}
                              className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-md transition-colors disabled:opacity-50"
                              title="Delete notification"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          
          {/* Load More */}
          {hasMore && (
            <div className="p-4 border-t border-parchment-200 text-center">
              <button
                onClick={() => loadNotifications(page + 1)}
                disabled={loading}
                className="px-4 py-2 border border-parchment-300 rounded-lg text-sm hover:bg-parchment-50 disabled:opacity-50"
              >
                {loading ? 'Loading...' : 'Load more notifications'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}