import axios from 'axios';
import { authSession, getStoredUser } from './auth';
export { API_URL } from './api-url';
import { API_URL } from './api-url';
export { getStoredUser, getStoredToken, clearStoredAuth } from './auth';
export type { StoredUser } from './auth-session';

export const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use(async (config) => {
  const token = await authSession.getAccessToken();
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

api.interceptors.response.use(response => response, error => {
  const authorization = error.config?.headers?.Authorization;
  if (error.response?.status === 401 && typeof authorization === 'string' && authorization.startsWith('Bearer ')) {
    authSession.rejectToken(authorization.slice(7));
  }
  return Promise.reject(error);
});

export default api;
