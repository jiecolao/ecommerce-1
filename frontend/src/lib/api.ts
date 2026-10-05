import axios from 'axios';

export const API_URL = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? '/api' : 'http://localhost:3000/api');

export interface StoredUser {
  id: string;
  email: string;
  role?: string;
  firstName?: string;
  lastName?: string;
  [key: string]: any;
}

export function getStoredUser(): StoredUser | null {
  try {
    const raw = localStorage.getItem('auth_user');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function getStoredToken(): string | null {
  return localStorage.getItem('auth_token');
}

export function setStoredAuth(token: string, user: StoredUser) {
  localStorage.setItem('auth_token', token);
  localStorage.setItem('auth_user', JSON.stringify(user));
  window.dispatchEvent(new Event('auth-state-change'));
}

export function clearStoredAuth() {
  localStorage.removeItem('auth_token');
  localStorage.removeItem('auth_user');
  window.dispatchEvent(new Event('auth-state-change'));
}

export const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use((config) => {
  const token = getStoredToken();
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }

  const user = getStoredUser();
  const isAdminRequest = config.url?.startsWith('/admin');

  // Provide fallback actor IDs expected by the backend controllers
  if (isAdminRequest) {
    config.headers['x-actor-id'] = user?.role === 'admin' && user?.id ? user.id : '22222222-2222-2222-2222-222222222222';
  } else {
    config.headers['x-actor-id'] = user?.id || '11111111-1111-1111-1111-111111111111';
  }

  return config;
});

export default api;
