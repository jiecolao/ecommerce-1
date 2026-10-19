// Session orchestration is separate from browser setup so it can be tested
// against fake providers without loading .env or contacting an auth server.
export interface BrowserSession {
  access_token: string;
  refresh_token: string;
  user: { id: string; email?: string; user_metadata?: Record<string, unknown> };
}
export interface StoredUser {
  id: string;
  email: string;
  role: 'admin' | 'buyer';
  isAdmin: boolean;
  isBuyer: boolean;
  firstName?: string;
  lastName?: string;
}
export interface AccountContext {
  id: string;
  role: 'admin' | 'buyer';
  isAdmin: boolean;
  isBuyer: boolean;
}
type SessionResult = { data: { session: BrowserSession | null }; error: unknown };
export interface SessionAuth {
  getSession(): Promise<SessionResult>;
  setSession(tokens: { access_token: string; refresh_token: string }): Promise<SessionResult>;
  exchangeCodeForSession(code: string, options?: { flowId?: string }): Promise<SessionResult>;
  signInWithOAuth(options: { provider: 'google'; options: { redirectTo: string; skipBrowserRedirect: true } }): Promise<{ data: { url: string | null }; error: unknown }>;
  signOut(options: { scope: 'local' }): Promise<{ error: unknown }>;
  onAuthStateChange(callback: (event: string, session: BrowserSession | null) => void): { data: { subscription: { unsubscribe(): void } } };
}
export interface AuthSnapshot { user: StoredUser | null; loading: boolean; error: string | null }
const unavailable = 'Sign in is not configured. Please contact your project administrator.';
const invalidSession = 'Unable to establish your session. Please sign in again.';

function accountAccessMessage(status?: number) {
  if (status === 403) return 'Your MystiKeys profile is not set up for access. Please contact your project administrator.';
  if (status === 503) return 'Account verification is temporarily unavailable. Please try again later.';
  if (status === 409) return 'Your MystiKeys profile could not be set up. Please contact your project administrator.';
  return 'Unable to verify account access. Please sign in again or contact your project administrator.';
}

// Only the account endpoint's status selects these fixed messages. Never use
// its response body or a raw provider/network error as customer-facing text.
export class AccountAccessError extends Error {
  readonly status: number;
  constructor(status: number) {
    super(accountAccessMessage(status));
    this.status = status;
  }
}

export function createSessionController(deps: {
  auth: SessionAuth | null;
  storage: Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>;
  cache: { clear(): void };
  readAccount(token: string): Promise<AccountContext>;
  provisionBuyer?(token: string): Promise<void>;
  notify(): void;
}) {
  let snapshot: AuthSnapshot = { user: null, loading: true, error: null };
  let version = 0;
  let eventVersion = 0;
  let loginVersion = 0;
  let pendingLogin: { version: number; id: string } | null = null;
  let activeToken: string | null = null;
  let rejectedToken: string | null = null;
  let pending: { token: string; result: Promise<StoredUser | null> } | null = null;
  let starting: Promise<void> | null = null;
  let signingOut = false;
  let logoutTask: Promise<{ serverConfirmed: boolean }> | null = null;
  let subscription: { unsubscribe(): void } | undefined;
  const listeners = new Set<() => void>();

  function publish(next: AuthSnapshot) {
    snapshot = next;
    for (const listener of listeners) listener();
    deps.notify();
  }
  function clearMirrors() {
    deps.storage.removeItem('auth_token');
    deps.storage.removeItem('auth_user');
    deps.cache.clear();
  }
  function clear(error: string | null = null) {
    version++;
    activeToken = null;
    pending = null;
    clearMirrors();
    publish({ user: null, loading: false, error });
  }
  function sync(session: BrowserSession | null): Promise<StoredUser | null> {
    if (signingOut) return Promise.resolve(null);
    if (!session) { clear(); return Promise.resolve(null); }
    if (!session.access_token || !session.user?.id || !session.user.email) {
      clear(invalidSession);
      return Promise.reject(new Error(invalidSession));
    }
    if (session.access_token === rejectedToken) return Promise.resolve(null);
    if (pending?.token === session.access_token) return pending.result;
    if (activeToken === session.access_token && snapshot.user) return Promise.resolve(snapshot.user);
    const ticket = ++version;
    activeToken = session.access_token;
    const previous = snapshot.user;
    if (previous?.id !== session.user.id) {
      clearMirrors();
      publish({ user: null, loading: true, error: null });
    }
    const result = (async () => {
      try {
        const account = await deps.readAccount(session.access_token);
        if (ticket !== version) return null;
        if (account.id !== session.user.id || typeof account.isAdmin !== 'boolean' || typeof account.isBuyer !== 'boolean'
          || (!account.isAdmin && !account.isBuyer) || account.role !== (account.isAdmin ? 'admin' : 'buyer')) {
          throw new Error(invalidSession);
        }
        const metadata = session.user.user_metadata;
        const user: StoredUser = {
          ...account, email: session.user.email!,
          firstName: typeof metadata?.first_name === 'string' ? metadata.first_name : '',
          lastName: typeof metadata?.last_name === 'string' ? metadata.last_name : '',
        };
        if (previous?.id !== user.id || previous?.isAdmin !== user.isAdmin || previous?.isBuyer !== user.isBuyer) deps.cache.clear();
        deps.storage.setItem('auth_token', session.access_token);
        deps.storage.setItem('auth_user', JSON.stringify(user));
        publish({ user, loading: false, error: null });
        return user;
      } catch (error) {
        const failure = new AccountAccessError(error instanceof AccountAccessError ? error.status : 0);
        if (ticket === version) {
          clearMirrors();
          publish({ user: null, loading: false, error: failure.message });
        }
        throw failure;
      } finally {
        if (ticket === version) pending = null;
      }
    })();
    pending = { token: session.access_token, result };
    return result;
  }

  function start(): Promise<void> {
    if (starting) return starting;
    // Older access-token-only logins cannot supply a refresh token. A fresh
    // login establishes the SDK-managed session; no fabricated migration.
    clearMirrors();
    if (!deps.auth) {
      clear();
      starting = Promise.resolve();
      return starting;
    }
    subscription = deps.auth.onAuthStateChange((_event, session) => {
      const event = ++eventVersion;
      if (!session) { loginVersion++; pendingLogin = null; clear(); return; }
      if (pendingLogin && session.user.id !== pendingLogin.id) { loginVersion++; pendingLogin = null; }
      // Leave the SDK callback before performing any asynchronous auth work.
      queueMicrotask(() => {
        if (event === eventVersion) void sync(session).catch(() => {});
      });
    }).data.subscription;
    const observedEvent = eventVersion;
    starting = (async () => {
      try {
        const result = await deps.auth!.getSession();
        if (observedEvent === eventVersion) {
          if (result.error) throw new Error(invalidSession);
          await sync(result.data.session);
        }
      } catch (error) {
        if (observedEvent === eventVersion) clear(error instanceof AccountAccessError ? accountAccessMessage(error.status) : invalidSession);
      }
    })();
    return starting;
  }

  async function finishSignIn(session: BrowserSession, attempt: number): Promise<StoredUser> {
    if (attempt !== loginVersion || !session.access_token || !session.refresh_token || !session.user?.id) throw new Error(invalidSession);
    pendingLogin = { version: attempt, id: session.user.id };
    try {
      let user: StoredUser | null;
      try { user = await sync(session); }
      catch (error) {
        if (!(error instanceof AccountAccessError) || error.status !== 403 || !deps.provisionBuyer) throw error;
        if (attempt !== loginVersion) throw new Error(invalidSession);
        const before = await deps.auth!.getSession();
        if (before.error || before.data.session?.user.id !== session.user.id || attempt !== loginVersion) throw new Error(invalidSession);
        try { await deps.provisionBuyer(before.data.session.access_token); }
        catch (error) {
          const failure = new AccountAccessError(error instanceof AccountAccessError ? error.status : 503);
          if (attempt === loginVersion) clear(failure.message);
          throw failure;
        }
        const current = await deps.auth!.getSession();
        if (current.error || current.data.session?.user.id !== session.user.id || attempt !== loginVersion) throw new Error(invalidSession);
        // Discard any missing-profile lookup started before the insert finished.
        version++; pending = null; activeToken = null;
        user = await sync(current.data.session);
      }
      if (!user || attempt !== loginVersion) throw new Error(invalidSession);
      return user;
    } finally { if (pendingLogin?.version === attempt) pendingLogin = null; }
  }

  async function adopt(tokens: { access_token?: unknown; refresh_token?: unknown }): Promise<StoredUser> {
    if (signingOut) throw new Error('Sign out is still in progress. Please try again.');
    await start();
    if (signingOut) throw new Error('Sign out is still in progress. Please try again.');
    if (!deps.auth) throw new Error(unavailable);
    if (typeof tokens?.access_token !== 'string' || !tokens.access_token || typeof tokens.refresh_token !== 'string' || !tokens.refresh_token) {
      throw new Error(invalidSession);
    }
    const attempt = ++loginVersion;
    pendingLogin = null;
    rejectedToken = null;
    let result: SessionResult;
    try { result = await deps.auth.setSession({ access_token: tokens.access_token, refresh_token: tokens.refresh_token }); }
    catch { throw new Error(invalidSession); }
    if (result.error || !result.data.session) throw new Error(invalidSession);
    return finishSignIn(result.data.session, attempt);
  }

  return {
    start,
    adopt,
    getSnapshot: () => snapshot,
    subscribe(listener: () => void) { listeners.add(listener); return () => { listeners.delete(listener); }; },
    async getAccessToken(): Promise<string | null> {
      if (signingOut) return null;
      await start();
      if (!deps.auth || signingOut) return null;
      const attempt = loginVersion;
      try {
        const result = await deps.auth.getSession();
        if (signingOut || attempt !== loginVersion || result.error || !result.data.session) return null;
        const token = result.data.session.access_token;
        return token === rejectedToken ? null : token;
      } catch { return null; }
    },
    rejectToken(token: string) {
      if (token === activeToken) { rejectedToken = token; clear('Your session has expired. Please sign in again.'); }
    },
    async beginGoogle(origin: string): Promise<string> {
      if (signingOut) throw new Error('Sign out is still in progress. Please try again.');
      await start();
      if (signingOut) throw new Error('Sign out is still in progress. Please try again.');
      if (!deps.auth) throw new Error(unavailable);
      let result: { data: { url: string | null }; error: unknown };
      try {
        result = await deps.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: new URL('/login', origin).href, skipBrowserRedirect: true } });
      } catch { throw new Error('Unable to start Google sign in. Please try again.'); }
      if (result.error || !result.data.url) throw new Error('Unable to start Google sign in. Please try again.');
      return result.data.url;
    },
    async exchangeGoogleCode(code: string, flowId?: string): Promise<StoredUser> {
      if (signingOut) throw new Error('Sign out is still in progress. Please try again.');
      await start();
      if (signingOut) throw new Error('Sign out is still in progress. Please try again.');
      if (!deps.auth) throw new Error(unavailable);
      const attempt = ++loginVersion;
      pendingLogin = null;
      rejectedToken = null;
      let result: SessionResult;
      try { result = await deps.auth.exchangeCodeForSession(code, flowId ? { flowId } : undefined); }
      catch { throw new Error('Google sign in could not be completed. Please try again.'); }
      if (result.error || !result.data.session) throw new Error('Google sign in could not be completed. Please try again.');
      return finishSignIn(result.data.session, attempt);
    },
    logout(): Promise<{ serverConfirmed: boolean }> {
      if (logoutTask) return logoutTask;
      void start();
      loginVersion++;
      pendingLogin = null;
      eventVersion++;
      rejectedToken = activeToken;
      // Hide private data and stop transport before waiting for the provider.
      // Refresh events cannot restore the account while sign-out is pending.
      signingOut = true;
      clear();
      if (!deps.auth) { signingOut = false; return Promise.resolve({ serverConfirmed: true }); }
      logoutTask = Promise.resolve().then(async () => {
        try {
          let failed = false;
          try { failed = Boolean((await deps.auth!.signOut({ scope: 'local' })).error); }
          catch { failed = true; }
          // Keep local removal distinct from confirmed server revocation.
          const remaining = await deps.auth!.getSession().catch(() => null);
          if (remaining?.data.session) rejectedToken = remaining.data.session.access_token;
          if (!remaining || remaining.error || remaining.data.session) throw new Error('Sign out could not be completed. Please try again.');
          return { serverConfirmed: !failed };
        } finally { signingOut = false; logoutTask = null; }
      });
      return logoutTask;
    },
    dispose() { version++; eventVersion++; loginVersion++; pendingLogin = null; subscription?.unsubscribe(); listeners.clear(); },
  };
}

export function readOAuthRedirect(href: string) {
  const url = new URL(href);
  const hash = new URLSearchParams(url.hash.slice(1));
  const authFragment = ['access_token', 'refresh_token', 'error'].some(name => hash.has(name));
  if (!url.searchParams.has('code') && !url.searchParams.has('error') && !authFragment) return null;
  const result = {
    code: url.searchParams.get('code'),
    flowId: url.searchParams.get('sb_flow_id') || undefined,
    failed: url.searchParams.has('error') || authFragment,
  };
  for (const name of ['code', 'sb_flow_id', 'error', 'error_code', 'error_description']) url.searchParams.delete(name);
  if (authFragment) url.hash = '';
  return { ...result, cleanPath: `${url.pathname}${url.search}${url.hash}` };
}
