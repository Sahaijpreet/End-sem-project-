import { createContext, useContext, useEffect, useState, useRef } from 'react';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';

const WebSocketContext = createContext();

export function WebSocketProvider({ children }) {
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const { user } = useAuth();
  const toast = useToast();
  const reconnectTimeoutRef = useRef();
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;

  const connect = () => {
    if (!user) return;

    try {
      const wsUrl = `${process.env.VITE_WS_URL || 'ws://localhost:5001'}/ws?token=${user.token}`;
      const ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        console.log('🔗 WebSocket connected');
        setConnected(true);
        setSocket(ws);
        reconnectAttempts.current = 0;
        
        ws.send(JSON.stringify({
          type: 'connect',
          userId: user._id
        }));
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          handleMessage(data);
        } catch (error) {
          console.error('WebSocket message parse error:', error);
        }
      };

      ws.onclose = (event) => {
        console.log('🔌 WebSocket disconnected:', event.code, event.reason);
        setConnected(false);
        setSocket(null);
        
        if (event.code !== 1000 && reconnectAttempts.current < maxReconnectAttempts) {
          const delay = Math.min(1000 * Math.pow(2, reconnectAttempts.current), 30000);
          console.log(`🔄 Reconnecting in ${delay}ms (attempt ${reconnectAttempts.current + 1})`);
          
          reconnectTimeoutRef.current = setTimeout(() => {
            reconnectAttempts.current++;
            connect();
          }, delay);
        }
      };

      ws.onerror = (error) => {
        console.error('🚨 WebSocket error:', error);
      };

    } catch (error) {
      console.error('WebSocket connection failed:', error);
    }
  };

  const disconnect = () => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    
    if (socket) {
      socket.close(1000, 'User disconnected');
    }
  };

  const sendMessage = (message) => {
    if (socket && connected) {
      socket.send(JSON.stringify(message));
      return true;
    }
    return false;
  };

  const handleMessage = (data) => {
    switch (data.type) {
      case 'notification':
        handleNotification(data.payload);
        break;
      case 'chat_message':
        handleChatMessage(data.payload);
        break;
      case 'user_online':
        handleUserOnline(data.payload);
        break;
      case 'user_offline':
        handleUserOffline(data.payload);
        break;
      case 'book_request':
        handleBookRequest(data.payload);
        break;
      case 'note_uploaded':
        handleNoteUploaded(data.payload);
        break;
      default:
        console.log('Unknown message type:', data.type);
    }
  };

  const handleNotification = (notification) => {
    setNotifications(prev => [notification, ...prev.slice(0, 49)]);
    
    if (notification.priority === 'high') {
      toast(notification.message, 'info');
    }
    
    if (Notification.permission === 'granted') {
      new Notification(notification.title || 'SAAR Notification', {
        body: notification.message,
        icon: '/favicon.svg',
        tag: notification.id
      });
    }
  };

  const handleChatMessage = (message) => {
    window.dispatchEvent(new CustomEvent('chat_message', { detail: message }));
    
    if (!window.location.pathname.includes('/chat/')) {
      toast(`New message from ${message.senderName}`, 'info');
    }
  };

  const handleUserOnline = (user) => {
    window.dispatchEvent(new CustomEvent('user_online', { detail: user }));
  };

  const handleUserOffline = (user) => {
    window.dispatchEvent(new CustomEvent('user_offline', { detail: user }));
  };

  const handleBookRequest = (request) => {
    toast(`${request.requesterName} wants to borrow "${request.bookTitle}"`, 'info');
    window.dispatchEvent(new CustomEvent('book_request', { detail: request }));
  };

  const handleNoteUploaded = (note) => {
    if (note.uploaderId !== user._id) {
      toast(`New ${note.subject} note uploaded by ${note.uploaderName}`, 'info');
    }
  };

  const requestNotificationPermission = async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }
    return Notification.permission === 'granted';
  };

  const markNotificationRead = (notificationId) => {
    setNotifications(prev => 
      prev.map(n => 
        n.id === notificationId ? { ...n, read: true } : n
      )
    );
    
    sendMessage({
      type: 'mark_notification_read',
      notificationId
    });
  };

  const clearNotifications = () => {
    setNotifications([]);
    sendMessage({ type: 'clear_notifications' });
  };

  useEffect(() => {
    if (user) {
      connect();
    } else {
      disconnect();
    }

    return () => {
      disconnect();
    };
  }, [user]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        console.log('📱 Page hidden, reducing WebSocket activity');
      } else {
        console.log('👁️ Page visible, resuming WebSocket activity');
        if (user && !connected) {
          connect();
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [user, connected]);

  const value = {
    socket,
    connected,
    notifications,
    sendMessage,
    markNotificationRead,
    clearNotifications,
    requestNotificationPermission,
    unreadCount: notifications.filter(n => !n.read).length
  };

  return (
    <WebSocketContext.Provider value={value}>
      {children}
    </WebSocketContext.Provider>
  );
}

export function useWebSocket() {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error('useWebSocket must be used within a WebSocketProvider');
  }
  return context;
}

export function useWebSocketEvent(eventType, callback) {
  const { socket } = useWebSocket();
  
  useEffect(() => {
    if (!socket) return;
    
    const handleMessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === eventType) {
          callback(data.payload);
        }
      } catch (error) {
        console.error('WebSocket event parse error:', error);
      }
    };
    
    socket.addEventListener('message', handleMessage);
    return () => socket.removeEventListener('message', handleMessage);
  }, [socket, eventType, callback]);
}

export function useOnlineUsers() {
  const [onlineUsers, setOnlineUsers] = useState([]);
  const { sendMessage } = useWebSocket();
  
  useEffect(() => {
    const handleUserOnline = (event) => {
      setOnlineUsers(prev => {
        if (!prev.find(u => u.id === event.detail.id)) {
          return [...prev, event.detail];
        }
        return prev;
      });
    };
    
    const handleUserOffline = (event) => {
      setOnlineUsers(prev => prev.filter(u => u.id !== event.detail.id));
    };
    
    window.addEventListener('user_online', handleUserOnline);
    window.addEventListener('user_offline', handleUserOffline);
    
    sendMessage({ type: 'get_online_users' });
    
    return () => {
      window.removeEventListener('user_online', handleUserOnline);
      window.removeEventListener('user_offline', handleUserOffline);
    };
  }, [sendMessage]);
  
  return onlineUsers;
}