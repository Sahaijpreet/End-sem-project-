import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { API_BASE } from '../lib/api';
import { getAuthToken } from '../lib/api';

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
  useEffect(() => {
    socket.connect();
    return () => { socket.disconnect(); socketInstance = null; };
  }, []);
  return socket;
}
