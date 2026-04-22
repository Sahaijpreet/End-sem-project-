import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { apiFetch, loadStoredAuth, saveAuth } from '../lib/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [auth, setAuth] = useState(() => loadStoredAuth());

  const user = auth?.user ?? null;
  const token = auth?.token ?? null;

  const login = useCallback(async (Email, Password) => {
    const res = await apiFetch('/api/auth/login', {
      skipAuth: true,
      method: 'POST',
      body: JSON.stringify({ Email, Password }),
    });
    if (!res.success || !res.data?.token) throw new Error(res.message || 'Login failed');
    const next = {
      token: res.data.token,
      user: {
        _id: res.data._id,
        Name: res.data.Name,
        Email: res.data.Email,
        Role: res.data.Role,
        Avatar: res.data.Avatar || '',
        Bio: res.data.Bio || '',
        Branch: res.data.Branch || '',
        Year: res.data.Year || null,
        CollegeID: res.data.CollegeID || '',
      },
    };
    saveAuth(next);
    setAuth(next);
    return next.user;
  }, []);

  const register = useCallback(async (payload) => {
    const res = await apiFetch('/api/auth/register', {
      skipAuth: true,
      method: 'POST',
      body: JSON.stringify(payload),
    });
    if (!res.success || !res.data?.token) throw new Error(res.message || 'Registration failed');
    const next = {
      token: res.data.token,
      user: {
        _id: res.data._id,
        Name: res.data.Name,
        Email: res.data.Email,
        Role: res.data.Role,
        Avatar: res.data.Avatar || '',
        Bio: res.data.Bio || '',
        Branch: res.data.Branch || '',
        Year: res.data.Year || null,
        CollegeID: res.data.CollegeID || '',
      },
    };
    saveAuth(next);
    setAuth(next);
    return next.user;
  }, []);

  const updateUser = useCallback((updatedUser) => {
    setAuth((prev) => {
      if (!prev) return prev;
      const next = { ...prev, user: { ...prev.user, ...updatedUser } };
      saveAuth(next);
      return next;
    });
  }, []);

  const logout = useCallback(() => {
    saveAuth(null);
    setAuth(null);
  }, []);

  const value = useMemo(
    () => ({
      user,
      token,
      isAuthenticated: Boolean(token && user),
      isAdmin: user?.Role === 'Admin',
      login,
      register,
      logout,
      updateUser,
    }),
    [user, token, login, register, logout, updateUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
