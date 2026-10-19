import type { BrowserSession } from './auth-session';
import { EMAIL_OTP_LENGTH, isCompleteEmailOtp } from './email-otp.ts';

interface EmailUser { id: string; email?: string; email_confirmed_at?: string }
type Result<T> = { data: T; error: unknown };
export interface EmailAuthProvider {
  resetPasswordForEmail(email: string): Promise<{ error: unknown }>;
  resend(options: { type: 'signup'; email: string }): Promise<{ error: unknown }>;
  verifyOtp(options: { type: 'email' | 'recovery'; email: string; token: string }): Promise<Result<{ user: EmailUser | null; session: BrowserSession | null }>>;
  getSession(): Promise<Result<{ session: BrowserSession | null }>>;
  getUser(token: string): Promise<Result<{ user: EmailUser | null }>>;
  onAuthStateChange(callback: (event: string, session: BrowserSession | null) => void): { data: { subscription: { unsubscribe(): void } } };
}

const newCode = 'Verify a new password reset code before changing your password.';
const invalidCode = 'The code is invalid or has expired. Request a new code and try again.';
const unavailable = 'Email authentication is not configured. Please contact your project administrator.';

// Supabase Auth's /user operation, with an explicit JWT instead of mutable
// browser-session selection. No application API, database, or admin key is used.
export function createPasswordUpdater(deps: { url: string; publishableKey: string; fetch: typeof fetch }) {
  return async (token: string, password: string): Promise<Result<{ user: EmailUser | null }>> => {
    const response = await deps.fetch(new URL('/auth/v1/user', deps.url), {
      method: 'PUT', cache: 'no-store', credentials: 'omit',
      headers: { apikey: deps.publishableKey, Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    });
    if (!response.ok) return { data: { user: null }, error: { status: response.status } };
    return { data: { user: await response.json() }, error: null };
  };
}

// Provider operations are injected: tests never send emails or change accounts.
export function createEmailAuth(deps: {
  auth: EmailAuthProvider | null;
  now(): number;
  updatePassword(token: string, password: string): Promise<Result<{ user: EmailUser | null }>>;
}) {
  let revision = 0;
  let recovery: { id: string; expiresAt: number } | null = null;
  const listeners = new Set<() => void>();
  function clearRecovery() {
    revision++;
    recovery = null;
    for (const listener of listeners) listener();
  }
  const subscription = deps.auth?.onAuthStateChange((event, session) => {
    if (event === 'SIGNED_OUT' || (recovery && session?.user.id !== recovery.id)) clearRecovery();
  }).data.subscription;

  function provider() {
    if (!deps.auth) throw new Error(unavailable);
    return deps.auth;
  }
  function emailAddress(email: string) {
    if (typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) throw new Error('Enter a valid email address.');
    return email.trim();
  }
  async function call<T extends { error: unknown }>(operation: () => Promise<T>, message: string): Promise<T> {
    let result: T;
    try { result = await operation(); }
    catch { throw new Error(message); }
    if (result.error) {
      const status = typeof result.error === 'object' && result.error !== null && 'status' in result.error ? result.error.status : undefined;
      throw new Error(status === 429 ? 'Too many authentication requests. Please try again later.' : message);
    }
    return result;
  }
  async function verify(email: string, code: string, type: 'email' | 'recovery') {
    const auth = provider();
    const address = emailAddress(email);
    if (!isCompleteEmailOtp(code)) throw new Error(`Enter the complete ${EMAIL_OTP_LENGTH}-digit code.`);
    const result = await call(() => auth.verifyOtp({ email: address, token: code, type }), invalidCode);
    const user = result.data?.user;
    if (typeof user?.id !== 'string' || !user.id || typeof user.email !== 'string' || user.email.toLowerCase() !== address.toLowerCase()) throw new Error(invalidCode);
    return { user, session: result.data.session };
  }
  function validRecovery() {
    if (!recovery || deps.now() >= recovery.expiresAt) { clearRecovery(); throw new Error(newCode); }
    return recovery;
  }

  return {
    getRecoverySnapshot: () => Boolean(recovery && deps.now() < recovery.expiresAt),
    subscribe(listener: () => void) { listeners.add(listener); return () => { listeners.delete(listener); }; },
    async requestRecovery(email: string) {
      const auth = provider();
      const address = emailAddress(email);
      clearRecovery();
      await call(() => auth.resetPasswordForEmail(address), 'Unable to request a reset code. Please try again later.');
    },
    async resendSignup(email: string) {
      const auth = provider();
      const address = emailAddress(email);
      await call(() => auth.resend({ type: 'signup', email: address }), 'Unable to request another verification code. Please try again later.');
    },
    async verifySignup(email: string, code: string) {
      const result = await verify(email, code, 'email');
      if (typeof result.user.email_confirmed_at !== 'string' || !result.user.email_confirmed_at) throw new Error(invalidCode);
    },
    async verifyRecovery(email: string, code: string) {
      clearRecovery();
      const ticket = revision;
      const result = await verify(email, code, 'recovery');
      const session = result.session;
      if (!session?.access_token || !session.refresh_token || session.user?.id !== result.user.id) throw new Error(invalidCode);
      const current = await call(() => provider().getSession(), newCode);
      if (ticket !== revision || current.data.session?.access_token !== session.access_token || current.data.session?.user?.id !== result.user.id) throw new Error(newCode);
      // A short-lived, memory-only grant; reloading this form requires a new code.
      recovery = { id: result.user.id, expiresAt: deps.now() + 10 * 60 * 1000 };
      for (const listener of listeners) listener();
    },
    async updatePassword(password: string) {
      const expected = validRecovery();
      const ticket = revision;
      if (typeof password !== 'string' || password.length < 8) throw new Error('Use at least 8 characters for your new password.');
      const auth = provider();
      let token: string;
      try {
        const current = await call(() => auth.getSession(), newCode);
        const currentToken = current.data.session?.access_token;
        if (!currentToken || current.data.session?.user?.id !== expected.id) throw new Error(newCode);
        // Validate the current token with Supabase, rather than trusting storage.
        const verified = await call(() => auth.getUser(currentToken), newCode);
        if (verified.data.user?.id !== expected.id || ticket !== revision || recovery !== expected || deps.now() >= expected.expiresAt) throw new Error(newCode);
        token = currentToken;
      } catch (error) {
        if (recovery === expected) clearRecovery();
        throw error;
      }
      // Bind the mutation to the verified recovery JWT. SDK updateUser() reads
      // the latest browser session, which could belong to a different account.
      const result = await call(() => deps.updatePassword(token, password), 'Unable to update your password. Please check its requirements and try again.');
      if (result.data.user?.id !== expected.id) throw new Error('The password update could not be confirmed. Please try signing in again.');
      if (recovery === expected) clearRecovery();
    },
    dispose() { clearRecovery(); subscription?.unsubscribe(); listeners.clear(); },
  };
}
