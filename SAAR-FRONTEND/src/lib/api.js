const STORAGE_KEY = 'saar_auth';

export const API_BASE = import.meta.env.VITE_API_URL ?? '';

export function loadStoredAuth() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function saveAuth(auth) {
  if (auth) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(auth));
  } else {
    localStorage.removeItem(STORAGE_KEY);
  }
}

export function getAuthToken() {
  return loadStoredAuth()?.token ?? null;
}

export async function apiFetch(path, options = {}) {
  const { skipAuth, ...fetchOpts } = options;
  const url = path.startsWith('http') ? path : `${API_BASE}${path}`;
  const headers = { ...(fetchOpts.headers || {}) };
  if (fetchOpts.body && !(fetchOpts.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }
  const token = skipAuth ? null : getAuthToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  const res = await fetch(url, { ...fetchOpts, headers });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = data.message || data.error || res.statusText || 'Request failed';
    const err = new Error(msg);
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return data;
}

export function fileUrl(pathOrUrl) {
  if (!pathOrUrl) return '';
  if (pathOrUrl.startsWith('http')) return pathOrUrl;
  return `${API_BASE}${pathOrUrl}`;
}
