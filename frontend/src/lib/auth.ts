import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { useSyncExternalStore } from 'react';
import { API_URL } from './api-url';
import { AccountAccessError, createSessionController, readOAuthRedirect } from './auth-session';
import type { AccountContext, StoredUser } from './auth-session';
import { queryClient } from './query-client';
import { createEmailAuth, createPasswordUpdater } from './auth-email';

const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
const supabase: SupabaseClient | null = import.meta.hot?.data.supabase ?? (url && key ? createClient(url, key, {
  auth: { flowType: 'pkce', persistSession: true, autoRefreshToken: true, detectSessionInUrl: false },
}) : null);

export const authSession = createSessionController({
  auth: supabase?.auth ?? null,
  storage: window.localStorage,
  cache: queryClient,
  async readAccount(token): Promise<AccountContext> {
    const response = await fetch(`${API_URL}/auth/me`, { headers: { Authorization: `Bearer ${token}` }, cache: 'no-store' });
    if (!response.ok) throw new AccountAccessError(response.status);
    return response.json();
  },
  async provisionBuyer(token) {
    const response = await fetch(`${API_URL}/auth/buyer-profile`, {
      method: 'POST', headers: { Authorization: `Bearer ${token}` }, cache: 'no-store',
    });
    if (!response.ok) throw new AccountAccessError(response.status);
  },
  notify() { window.dispatchEvent(new Event('auth-state-change')); },
});

export function useAuthSession() {
  return useSyncExternalStore(authSession.subscribe, authSession.getSnapshot);
}
export const emailAuth = createEmailAuth({
  auth: supabase?.auth ?? null,
  now: () => Date.now(),
  updatePassword: createPasswordUpdater({ url, publishableKey: key, fetch: window.fetch.bind(window) }),
});
export function useRecoverySession() {
  return useSyncExternalStore(emailAuth.subscribe, emailAuth.getRecoverySnapshot);
}
export function getStoredUser(): StoredUser | null { return authSession.getSnapshot().user; }
export function getStoredToken(): string | null { return getStoredUser() ? localStorage.getItem('auth_token') : null; }
export const clearStoredAuth = () => authSession.logout();

let callback: Promise<StoredUser> | null = null;
export function completeGoogleRedirect(): Promise<StoredUser> | null {
  if (callback) return callback;
  const redirect = readOAuthRedirect(window.location.href);
  if (!redirect) return null;
  window.history.replaceState(null, '', redirect.cleanPath);
  const operation = redirect.failed || !redirect.code
    ? Promise.reject(new Error('Google sign in could not be completed. Please try again.'))
    : authSession.exchangeGoogleCode(redirect.code, redirect.flowId);
  callback = operation;
  void operation.then(() => { callback = null; }, () => { callback = null; });
  return operation;
}

if (import.meta.hot) {
  import.meta.hot.data.supabase = supabase;
  import.meta.hot.dispose(() => { authSession.dispose(); emailAuth.dispose(); });
}
