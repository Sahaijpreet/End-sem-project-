import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { API_BASE, getAuthToken } from '../lib/api';

let socketInstance = null;

export function getSocket() {
  if (!socketInstance) {
    socketInstance = io(API_BASE || 'http://localhost:5001', {
      auth: { token: getAuthToken() },
      autoConnect: false,
    });
  }
  return socketInstance;
}

export function useSocket() {
  const socket = getSocket();
  const socketRef = useRef(socket);
  useEffect(() => {
    socketRef.current.connect();
    return () => {
      socketRef.current.disconnect();
      socketInstance = null;
    };
  }, []);
  return socketRef.current;
}
