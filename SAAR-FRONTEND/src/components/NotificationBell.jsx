import { useEffect, useState } from 'react';
import { Bell, Check, ExternalLink } from 'lucide-react';
import { apiFetch } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

export default function NotificationBell() {
  const { isAuthenticated } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);

  async function loadUnreadCount() {
    if (!isAuthenticated) return;
    try {
      const res = await apiFetch('/api/notifications/unread-count');
      if (res.success) setUnreadCount(res.data.count);
    } catch (err) {
      console.error('Failed to load unread count:', err.message);
    }
  }

  async function loadRecentNotifications() {
    if (!isAuthenticated || loading) return;
    setLoading(true);
    try {
      const res = await apiFetch('/api/notifications?limit=5');
      if (res.success) {
        setNotifications(res.data);
        setUnreadCount(res.unreadCount);
      }
    } catch (err) {
      console.error('Failed to load notifications:', err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadUnreadCount();
    const interval = setInterval(loadUnreadCount, 60000);
    return () => clearInterval(interval);
  }, [isAuthenticated]);

  async function markAsRead(id) {
    try {
      await apiFetch(`/api/notifications/${id}/read`, { method: 'PATCH' });
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, Read: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Failed to mark as read:', err.message);
    }
  }

  function handleBellClick() {
    if (!showDropdown) {
      loadRecentNotifications();
    }
    setShowDropdown(!showDropdown);
  }

  function formatTime(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return date.toLocaleDateString();
  }

  if (!isAuthenticated) return null;

  return (
    <div className="relative">
      <button
        onClick={handleBellClick}
        className="relative p-1.5 rounded-full text-ink-800 hover:text-accent-primary hover:bg-parchment-100 transition-colors"
      >
        <Bell className="h-4 w-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center font-medium">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {showDropdown && (
        <>
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setShowDropdown(false)}
          />
          <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-parchment-200 z-20 max-h-96 overflow-hidden">
            <div className="p-4 border-b border-parchment-200 flex items-center justify-between">
              <h3 className="font-semibold text-ink-900">Notifications</h3>
              <Link 
                to="/notifications" 
                onClick={() => setShowDropdown(false)}
                className="text-sm text-accent-primary hover:underline"
              >
                View all
              </Link>
            </div>
            
            <div className="max-h-80 overflow-y-auto">
              {loading ? (
                <div className="p-4 text-center text-sm text-ink-800">Loading...</div>
              ) : notifications.length === 0 ? (
                <div className="p-4 text-center text-sm text-ink-800">No notifications</div>
              ) : (
                notifications.map((notification) => (
                  <div
                    key={notification._id}
                    className={`p-3 border-b border-parchment-100 hover:bg-parchment-50 ${!notification.Read ? 'bg-blue-50/30' : ''}`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm ${!notification.Read ? 'font-medium text-ink-900' : 'text-ink-800'}`}>
                          {notification.Message}
                        </p>
                        <p className="text-xs text-ink-600 mt-1">
                          {formatTime(notification.createdAt)}
                        </p>
                      </div>
                      
                      <div className="flex items-center gap-1 shrink-0">
                        {notification.Link && (
                          <Link
                            to={notification.Link}
                            onClick={() => {
                              setShowDropdown(false);
                              if (!notification.Read) markAsRead(notification._id);
                            }}
                            className="p-1 text-accent-primary hover:bg-indigo-50 rounded"
                          >
                            <ExternalLink className="h-3 w-3" />
                          </Link>
                        )}
                        
                        {!notification.Read && (
                          <button
                            onClick={() => markAsRead(notification._id)}
                            className="p-1 text-emerald-600 hover:bg-emerald-50 rounded"
                            title="Mark as read"
                          >
                            <Check className="h-3 w-3" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
            
            {notifications.length > 0 && (
              <div className="p-3 border-t border-parchment-200 text-center">
                <Link 
                  to="/notifications" 
                  onClick={() => setShowDropdown(false)}
                  className="text-sm text-accent-primary hover:underline font-medium"
                >
                  View all notifications
                </Link>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
