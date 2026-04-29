import { useEffect, useState } from 'react';
import { Inbox, MessageCircle, Bell, ChevronRight, ExternalLink, Check, Clock, BookOpen } from 'lucide-react';
import { apiFetch } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

export default function UnifiedInbox() {
  const { isAuthenticated, user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);
  const [recentItems, setRecentItems] = useState([]);
  const [loading, setLoading] = useState(false);

  async function loadUnreadCounts() {
    if (!isAuthenticated) return;
    try {
      const [notifRes, chatRes] = await Promise.all([
        apiFetch('/api/notifications/unread-count'),
        apiFetch('/api/chat/conversations')
      ]);
      
      let totalUnread = 0;
      if (notifRes.success) totalUnread += notifRes.data.count;
      
      // Count unread chats (you might need to add unread message tracking)
      if (chatRes.success) {
        // For now, we'll just count conversations as a placeholder
        // You can enhance this to track actual unread messages
      }
      
      setUnreadCount(totalUnread);
    } catch (err) {
      console.error('Failed to load unread counts:', err.message);
    }
  }

  async function loadRecentItems() {
    if (!isAuthenticated || loading) return;
    setLoading(true);
    try {
      const [notifRes, chatRes] = await Promise.all([
        apiFetch('/api/notifications?limit=3'),
        apiFetch('/api/chat/conversations')
      ]);
      
      const items = [];
      
      // Add recent notifications
      if (notifRes.success) {
        notifRes.data.forEach(notif => {
          items.push({
            id: notif._id,
            type: 'notification',
            title: notif.Message,
            time: notif.createdAt,
            unread: !notif.Read,
            link: notif.Link,
            data: notif
          });
        });
        setUnreadCount(notifRes.unreadCount);
      }
      
      // Add recent chats
      if (chatRes.success) {
        chatRes.data.slice(0, 2).forEach(chat => {
          const other = chat.OwnerID?._id === user?._id ? chat.RequesterID : chat.OwnerID;
          items.push({
            id: chat._id,
            type: 'chat',
            title: `${other?.Name || 'User'}: ${chat.LastMessage || 'New conversation'}`,
            subtitle: chat.BookID?.Title,
            time: chat.LastMessageAt || chat.createdAt,
            unread: false, // You can enhance this with actual unread message tracking
            link: `/chat/${chat._id}`,
            data: chat
          });
        });
      }
      
      // Sort by time (most recent first)
      items.sort((a, b) => new Date(b.time) - new Date(a.time));
      setRecentItems(items.slice(0, 5));
      
    } catch (err) {
      console.error('Failed to load recent items:', err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadUnreadCounts();
    const interval = setInterval(loadUnreadCounts, 60000); // Check every minute
    return () => clearInterval(interval);
  }, [isAuthenticated]);

  async function markNotificationAsRead(id) {
    try {
      await apiFetch(`/api/notifications/${id}/read`, { method: 'PATCH' });
      setRecentItems(prev => prev.map(item => 
        item.id === id && item.type === 'notification' 
          ? { ...item, unread: false } 
          : item
      ));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Failed to mark as read:', err.message);
    }
  }

  function handleInboxClick() {
    if (!showDropdown) {
      loadRecentItems();
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
        onClick={handleInboxClick}
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
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setShowDropdown(false)}
          />
          <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-parchment-200 z-20 max-h-96 overflow-hidden">
            <div className="p-4 border-b border-parchment-200 flex items-center justify-between">
              <h3 className="font-semibold text-ink-900">Inbox</h3>
              <Link 
                to="/inbox" 
                onClick={() => setShowDropdown(false)}
                className="text-sm text-accent-primary hover:underline"
              >
                View all
              </Link>
            </div>
            
            <div className="max-h-80 overflow-y-auto">
              {loading ? (
                <div className="p-4 text-center text-sm text-ink-800">Loading...</div>
              ) : recentItems.length === 0 ? (
                <div className="p-4 text-center text-sm text-ink-800">No recent activity</div>
              ) : (
                recentItems.map((item) => (
                  <div
                    key={`${item.type}-${item.id}`}
                    className={`p-3 border-b border-parchment-100 hover:bg-parchment-50 ${item.unread ? 'bg-blue-50/30' : ''}`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="shrink-0 mt-0.5">
                        {item.type === 'notification' ? (
                          <Bell className="h-4 w-4 text-accent-primary" />
                        ) : (
                          <MessageCircle className="h-4 w-4 text-emerald-600" />
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm ${item.unread ? 'font-medium text-ink-900' : 'text-ink-800'}`}>
                          {item.title}
                        </p>
                        {item.subtitle && (
                          <p className="text-xs text-ink-600 flex items-center gap-1 mt-0.5">
                            <BookOpen className="h-3 w-3" />
                            {item.subtitle}
                          </p>
                        )}
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-ink-600 flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {formatTime(item.time)}
                          </span>
                          {item.unread && (
                            <span className="text-xs bg-accent-primary text-white px-2 py-0.5 rounded-full">
                              New
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-1 shrink-0">
                        {item.link && (
                          <Link
                            to={item.link}
                            onClick={() => {
                              setShowDropdown(false);
                              if (item.unread && item.type === 'notification') {
                                markNotificationAsRead(item.id);
                              }
                            }}
                            className="p-1 text-accent-primary hover:bg-indigo-50 rounded"
                          >
                            {item.type === 'chat' ? (
                              <MessageCircle className="h-3 w-3" />
                            ) : (
                              <ExternalLink className="h-3 w-3" />
                            )}
                          </Link>
                        )}
                        
                        {item.unread && item.type === 'notification' && (
                          <button
                            onClick={() => markNotificationAsRead(item.id)}
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
            
            <div className="p-3 border-t border-parchment-200 grid grid-cols-2 gap-2 text-center">
              <Link 
                to="/inbox" 
                onClick={() => setShowDropdown(false)}
                className="text-sm text-accent-primary hover:underline font-medium"
              >
                All Chats
              </Link>
              <Link 
                to="/notifications" 
                onClick={() => setShowDropdown(false)}
                className="text-sm text-accent-primary hover:underline font-medium"
              >
                All Notifications
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  );
}