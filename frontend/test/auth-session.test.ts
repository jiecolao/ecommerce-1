import assert from 'node:assert/strict';
import { test } from 'node:test';
import { QueryClient } from '@tanstack/react-query';
import { AccountAccessError, createSessionController, readOAuthRedirect } from '../src/lib/auth-session.ts';
import type { AccountContext, BrowserSession, SessionAuth } from '../src/lib/auth-session.ts';

// No .env, browser storage, network, real accounts, database or provider calls.
const buyer: BrowserSession = {
  access_token: 'synthetic-buyer-access', refresh_token: 'synthetic-buyer-refresh',
  user: { id: 'synthetic-buyer', email: 'buyer@example.invalid', user_metadata: { role: 'admin', first_name: 'Tester' } },
};
const admin: BrowserSession = {
  access_token: 'synthetic-admin-access', refresh_token: 'synthetic-admin-refresh',
  user: { id: 'synthetic-admin', email: 'admin@example.invalid', user_metadata: { role: 'buyer' } },
};
const buyerContext: AccountContext = { id: buyer.user.id, role: 'buyer', isAdmin: false, isBuyer: true };
const adminContext: AccountContext = { id: admin.user.id, role: 'admin', isAdmin: true, isBuyer: false };
const tick = () => new Promise<void>(resolve => setImmediate(resolve));
function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>(done => { resolve = done; });
  return { promise, resolve };
}

function fixture(initial: BrowserSession | null = null, read?: (token: string) => Promise<AccountContext>, provision?: (token: string) => Promise<void>) {
  let session = initial;
  let listener: ((event: string, session: BrowserSession | null) => void) | undefined;
  let next = buyer;
  let signOutFails = false;
  let retainSession = false;
  const calls: { operation: string; args?: unknown }[] = [];
  const storage = new Map<string, string>([['auth_user', '{"role":"admin"}'], ['auth_token', 'old-token-only']]);
  const cache = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const auth: SessionAuth = {
    async getSession() { return { data: { session }, error: null }; },
    async setSession(tokens) {
      calls.push({ operation: 'setSession', args: tokens });
      session = next;
      listener?.('SIGNED_IN', session);
      return { data: { session }, error: null };
    },
    async exchangeCodeForSession(code, options) {
      calls.push({ operation: 'exchangeCodeForSession', args: { code, options } });
      session = next;
      listener?.('SIGNED_IN', session);
      return { data: { session }, error: null };
    },
    async signInWithOAuth(options) {
      calls.push({ operation: 'signInWithOAuth', args: options });
      return { data: { url: 'https://auth.example.invalid/authorize' }, error: null };
    },
    async signOut(options) {
      calls.push({ operation: 'signOut', args: options });
      if (!retainSession) { session = null; listener?.('SIGNED_OUT', null); }
      return { error: signOutFails ? new Error('synthetic-private-provider-detail') : null };
    },
    onAuthStateChange(callback) {
      listener = callback;
      return { data: { subscription: { unsubscribe() { listener = undefined; } } } };
    },
  };
  const reads: string[] = [];
  const provisions: string[] = [];
  const controller = createSessionController({
    auth, cache,
    storage: { getItem: key => storage.get(key) ?? null, setItem: (key, value) => { storage.set(key, value); }, removeItem: key => { storage.delete(key); } },
    async readAccount(token) {
      reads.push(token);
      return read ? read(token) : token === admin.access_token ? adminContext : buyerContext;
    },
    async provisionBuyer(token) { provisions.push(token); await provision?.(token); },
    notify() {},
  });
  return {
    controller, cache, storage, auth, calls, reads, provisions,
    setNext(value: BrowserSession) { next = value; },
    failSignOut(keepSession = false) { signOutFails = true; retainSession = keepSession; },
    emit(event: string, value: BrowserSession | null) { session = value; listener?.(event, value); },
  };
}

test('old token-only and forged local roles do not create a managed login', async () => {
  const f = fixture();
  await f.controller.start();
  assert.deepEqual(f.controller.getSnapshot(), { user: null, loading: false, error: null });
  assert.equal(f.storage.size, 0);
  assert.equal(await f.controller.getAccessToken(), null);
  assert.deepEqual(f.reads, []);
});

test('restoration waits for server membership and ignores editable metadata roles', async () => {
  const account = deferred<AccountContext>();
  const f = fixture(buyer, () => account.promise);
  const starting = f.controller.start();
  await tick();
  assert.equal(f.controller.getSnapshot().loading, true);
  assert.equal(f.controller.getSnapshot().user, null);
  assert.equal(f.storage.size, 0);
  account.resolve(buyerContext);
  await starting;
  assert.equal(f.controller.getSnapshot().user?.role, 'buyer');
  assert.equal(f.controller.getSnapshot().user?.isAdmin, false);
  assert.equal(f.controller.getSnapshot().user?.firstName, 'Tester');
  assert.equal(f.storage.get('auth_token'), buyer.access_token);
  assert.ok(![...f.storage.values()].join('').includes(buyer.refresh_token));
});

test('password login adopts both SDK tokens and derives the admin landing role from server membership', async () => {
  const f = fixture();
  f.setNext(admin);
  const user = await f.controller.adopt(admin);
  assert.equal(user.isAdmin, true);
  assert.equal(user.isBuyer, false);
  assert.deepEqual(f.calls[0], { operation: 'setSession', args: { access_token: admin.access_token, refresh_token: admin.refresh_token } });
  assert.equal(f.reads.length, 1);
});

test('missing session fields fail without fabricating a user or calling setSession', async () => {
  const f = fixture();
  for (const tokens of [undefined, {}, { access_token: 'test' }, { access_token: '', refresh_token: 'test' }]) {
    await assert.rejects(f.controller.adopt(tokens as never), /Unable to establish/);
  }
  assert.equal(f.calls.length, 0);
  assert.equal(f.controller.getSnapshot().user, null);
});

test('mismatched, missing and inconsistent server roles fail closed', async () => {
  for (const account of [
    { ...buyerContext, id: 'someone-else' },
    { ...buyerContext, isBuyer: false },
    { ...buyerContext, role: 'admin' },
    { ...buyerContext, isAdmin: 'true' },
  ]) {
    const f = fixture(null, async () => account as AccountContext);
    await assert.rejects(f.controller.adopt(buyer), /Unable to verify account access/);
    assert.equal(f.controller.getSnapshot().user, null);
    assert.equal(f.storage.size, 0);
  }
});

test('membership outages reveal no raw provider details and expose no cached account', async () => {
  const f = fixture(null, async () => { throw new Error('synthetic-private-provider-detail'); });
  await assert.rejects(f.controller.adopt(buyer), error => {
    assert.ok(error instanceof Error);
    assert.ok(!error.message.includes('synthetic-private-provider-detail'));
    return true;
  });
  assert.equal(f.controller.getSnapshot().user, null);
  assert.equal(f.storage.size, 0);
});

test('missing profiles and service outages explain the next step without granting access or exposing error details', async () => {
  for (const [status, message] of [
    [403, 'Your MystiKeys profile is not set up for access. Please contact your project administrator.'],
    [503, 'Account verification is temporarily unavailable. Please try again later.'],
    [401, 'Unable to verify account access. Please sign in again or contact your project administrator.'],
    [500, 'Unable to verify account access. Please sign in again or contact your project administrator.'],
  ] as const) {
    const failure = new AccountAccessError(status);
    failure.message = 'synthetic-private-provider-detail';
    const f = fixture(null, async () => { throw failure; });
    await assert.rejects(f.controller.adopt(buyer), { message });
    assert.deepEqual(f.controller.getSnapshot(), { user: null, loading: false, error: message });
    assert.equal(f.storage.size, 0);
    assert.equal(f.calls.filter(call => call.operation === 'signOut').length, 0);
  }
});

test('session restoration retains a safe missing-profile or temporary-outage explanation', async () => {
  for (const [status, message] of [
    [403, 'Your MystiKeys profile is not set up for access. Please contact your project administrator.'],
    [503, 'Account verification is temporarily unavailable. Please try again later.'],
  ] as const) {
    const f = fixture(buyer, async () => { throw new AccountAccessError(status); });
    await f.controller.start();
    await tick();
    assert.deepEqual(f.controller.getSnapshot(), { user: null, loading: false, error: message });
    assert.equal(f.storage.size, 0);
    assert.equal(f.provisions.length, 0);
  }
});

test('explicit sign-in provisions a missing buyer once, then requires server membership again', async () => {
  let exists = false;
  const f = fixture(null, async () => { if (!exists) throw new AccountAccessError(403); return buyerContext; }, async () => { exists = true; });
  const user = await f.controller.adopt(buyer);
  assert.equal(user.id, buyer.user.id);
  assert.deepEqual(f.provisions, [buyer.access_token]);
  assert.equal(f.storage.get('auth_token'), buyer.access_token);
  await f.controller.adopt(buyer);
  assert.equal(f.provisions.length, 1);
});

test('Google completion shares the verified-session buyer provisioning path', async () => {
  let exists = false;
  const f = fixture(null, async () => { if (!exists) throw new AccountAccessError(403); return buyerContext; }, async () => { exists = true; });
  assert.equal((await f.controller.exchangeGoogleCode('synthetic-code')).isBuyer, true);
  assert.deepEqual(f.provisions, [buyer.access_token]);
});

test('existing accounts, read outages, and invalid sessions do not trigger provisioning', async () => {
  const existing = fixture();
  await existing.controller.adopt(buyer);
  assert.deepEqual(existing.provisions, []);
  const unavailable = fixture(null, async () => { throw new AccountAccessError(503); });
  await assert.rejects(unavailable.controller.adopt(buyer), /temporarily unavailable/);
  assert.deepEqual(unavailable.provisions, []);
});

test('provisioning conflicts and network failures stay private and cannot grant access', async () => {
  for (const failure of [new AccountAccessError(409), new Error('synthetic-private-provider-detail')]) {
    const f = fixture(null, async () => { throw new AccountAccessError(403); }, async () => { throw failure; });
    await assert.rejects(f.controller.adopt(buyer), error => {
      assert.ok(error instanceof Error);
      assert.equal(error.message.includes('synthetic-private'), false);
      assert.match(error.message, failure instanceof AccountAccessError ? /could not be set up/ : /temporarily unavailable/);
      return true;
    });
    assert.equal(f.controller.getSnapshot().user, null);
    assert.equal(f.storage.size, 0);
  }
});

test('a successful provisioning response alone cannot establish application access', async () => {
  let inserted = false;
  const f = fixture(null, async () => { throw new AccountAccessError(inserted ? 503 : 403); }, async () => { inserted = true; });
  await assert.rejects(f.controller.adopt(buyer), /temporarily unavailable/);
  assert.equal(f.controller.getSnapshot().user, null);
  assert.equal(f.storage.size, 0);
});

test('logout during provisioning stays effective without waiting for the request', async () => {
  const slow = deferred<void>();
  const f = fixture(null, async () => { throw new AccountAccessError(403); }, () => slow.promise);
  const login = f.controller.adopt(buyer);
  const rejected = assert.rejects(login, /Unable to establish/);
  await tick();
  assert.equal(f.provisions.length, 1);
  assert.equal((await f.controller.logout()).serverConfirmed, true);
  slow.resolve();
  await rejected;
  assert.equal(f.controller.getSnapshot().user, null);
  assert.equal(f.storage.size, 0);
});

test('another account signing in during provisioning cannot be replaced by the old response', async () => {
  const slow = deferred<void>();
  const f = fixture(null, async token => { if (token === buyer.access_token) throw new AccountAccessError(403); return adminContext; }, () => slow.promise);
  const login = f.controller.adopt(buyer);
  const rejected = assert.rejects(login, /Unable to establish/);
  await tick();
  f.emit('SIGNED_IN', admin);
  await tick();
  slow.resolve();
  await rejected;
  assert.equal(f.controller.getSnapshot().user?.id, admin.user.id);
  assert.equal(f.storage.get('auth_token'), admin.access_token);
});

test('an SDK identity mismatch blocks the provisioning request', async () => {
  const f = fixture(null, async () => { throw new AccountAccessError(403); });
  await f.controller.start();
  f.auth.getSession = async () => ({ data: { session: admin }, error: null });
  await assert.rejects(f.controller.adopt(buyer), /Unable to establish/);
  assert.equal(f.provisions.length, 0);
  assert.equal(f.storage.size, 0);
});

test('an older missing-profile response cannot clear a buyer after provisioning completes', async () => {
  const slowProvision = deferred<void>();
  const slowRead = deferred<AccountContext>();
  let reads = 0;
  const f = fixture(null, async () => {
    reads++;
    if (reads === 1) throw new AccountAccessError(403);
    if (reads === 2) return slowRead.promise;
    return buyerContext;
  }, () => slowProvision.promise);
  const login = f.controller.adopt(buyer);
  await tick();
  f.emit('SIGNED_IN', buyer);
  await tick();
  slowProvision.resolve();
  assert.equal((await login).id, buyer.user.id);
  // The background listener catches this stale rejection; it cannot publish it.
  slowRead.resolve({ ...buyerContext, isBuyer: false });
  await tick();
  assert.equal(f.controller.getSnapshot().user?.id, buyer.user.id);
});

test('token refresh updates transport and mirrors while preserving the same account cache', async () => {
  const f = fixture(buyer);
  await f.controller.start();
  f.cache.setQueryData(['profile'], { synthetic: 'same-account-data' });
  const refreshed = { ...buyer, access_token: 'synthetic-refreshed-access' };
  f.emit('TOKEN_REFRESHED', refreshed);
  await tick();
  assert.equal(await f.controller.getAccessToken(), refreshed.access_token);
  assert.equal(f.storage.get('auth_token'), refreshed.access_token);
  assert.deepEqual(f.cache.getQueryData(['profile']), { synthetic: 'same-account-data' });
  f.emit('SIGNED_IN', refreshed);
  await tick();
  assert.equal(f.reads.length, 2);
  assert.deepEqual(f.cache.getQueryData(['profile']), { synthetic: 'same-account-data' });
});

test('an account switch clears private queries and cancels old in-flight results', async () => {
  const f = fixture(buyer);
  await f.controller.start();
  f.cache.setQueryData(['profile'], { synthetic: 'buyer-private-data' });
  const slow = deferred<string>();
  const oldRequest = f.cache.fetchQuery({ queryKey: ['orders'], queryFn: () => slow.promise }).catch(() => 'cancelled');
  f.emit('SIGNED_IN', admin);
  await tick();
  assert.equal(f.controller.getSnapshot().user?.id, admin.user.id);
  assert.equal(f.cache.getQueryData(['profile']), undefined);
  slow.resolve('old-private-orders');
  await oldRequest;
  assert.equal(f.cache.getQueryData(['orders']), undefined);
});

test('switching between two buyers isolates private data even when their capabilities are identical', async () => {
  const secondBuyer: BrowserSession = {
    access_token: 'synthetic-second-buyer-access', refresh_token: 'synthetic-second-buyer-refresh',
    user: { id: 'synthetic-second-buyer', email: 'second-buyer@example.invalid', user_metadata: { role: 'admin' } },
  };
  const secondContext: AccountContext = { ...buyerContext, id: secondBuyer.user.id };
  const f = fixture(buyer, async token => token === secondBuyer.access_token ? secondContext : buyerContext);
  await f.controller.start();
  f.cache.setQueryData(['profile'], { owner: buyer.user.id });
  f.cache.setQueryData(['cart'], { owner: buyer.user.id });
  const slow = deferred<{ owner: string }>();
  const oldRequest = f.cache.fetchQuery({ queryKey: ['orders'], queryFn: () => slow.promise }).catch(() => 'cancelled');

  f.emit('SIGNED_IN', secondBuyer);
  await tick();
  assert.equal(f.controller.getSnapshot().user?.id, secondBuyer.user.id);
  assert.equal(f.controller.getSnapshot().user?.role, 'buyer');
  assert.equal(f.controller.getSnapshot().user?.isAdmin, false);
  assert.equal(f.cache.getQueryData(['profile']), undefined);
  assert.equal(f.cache.getQueryData(['cart']), undefined);
  assert.equal(f.storage.get('auth_token'), secondBuyer.access_token);
  assert.equal(JSON.parse(f.storage.get('auth_user')!).id, secondBuyer.user.id);

  f.cache.setQueryData(['profile'], { owner: secondBuyer.user.id });
  f.controller.rejectToken(buyer.access_token);
  slow.resolve({ owner: buyer.user.id });
  await oldRequest;
  assert.equal(f.controller.getSnapshot().user?.id, secondBuyer.user.id);
  assert.deepEqual(f.cache.getQueryData(['profile']), { owner: secondBuyer.user.id });
  assert.equal(f.cache.getQueryData(['orders']), undefined);
  assert.equal(await f.controller.getAccessToken(), secondBuyer.access_token);

  await f.controller.logout();
  assert.equal(f.controller.getSnapshot().user, null);
  assert.equal(f.cache.getQueryCache().getAll().length, 0);
  assert.equal(f.storage.size, 0);
  assert.equal(await f.controller.getAccessToken(), null);
});

test('capability changes clear cached data even when the user ID is unchanged', async () => {
  let context = buyerContext;
  const f = fixture(buyer, async () => context);
  await f.controller.start();
  f.cache.setQueryData(['profile'], 'private-data');
  context = { ...buyerContext, role: 'admin', isAdmin: true };
  f.emit('TOKEN_REFRESHED', { ...buyer, access_token: 'synthetic-new-capabilities' });
  await tick();
  assert.equal(f.controller.getSnapshot().user?.isAdmin, true);
  assert.equal(f.controller.getSnapshot().user?.isBuyer, true);
  assert.equal(f.cache.getQueryData(['profile']), undefined);
});

test('a slow initial account lookup cannot block logout or restore the previous login', async () => {
  const account = deferred<AccountContext>();
  const f = fixture(buyer, () => account.promise);
  const starting = f.controller.start();
  await tick();
  const result = await f.controller.logout();
  assert.equal(result.serverConfirmed, true);
  account.resolve(buyerContext);
  await starting;
  assert.equal(f.controller.getSnapshot().user, null);
  assert.equal(f.storage.size, 0);
  assert.equal(await f.controller.getAccessToken(), null);
});

test('a slow lookup from a previous account cannot replace the new account', async () => {
  const slow = deferred<AccountContext>();
  const f = fixture(null, token => token === buyer.access_token ? slow.promise : Promise.resolve(adminContext));
  await f.controller.start();
  const oldLogin = f.controller.adopt(buyer).catch(() => null);
  await tick();
  f.emit('SIGNED_IN', admin);
  await tick();
  slow.resolve(buyerContext);
  await oldLogin;
  assert.equal(f.controller.getSnapshot().user?.id, admin.user.id);
  assert.equal(f.storage.get('auth_token'), admin.access_token);
});

test('an initial SDK read cannot undo a newer sign-out or account-switch event', async () => {
  for (const newer of [null, admin]) {
    const initial = deferred<{ data: { session: BrowserSession | null }; error: null }>();
    const f = fixture();
    f.auth.getSession = () => initial.promise;
    const starting = f.controller.start();
    f.emit(newer ? 'SIGNED_IN' : 'SIGNED_OUT', newer);
    await tick();
    initial.resolve({ data: { session: buyer }, error: null });
    await starting;
    assert.equal(f.controller.getSnapshot().user?.id ?? null, newer?.user.id ?? null);
    assert.equal(f.storage.get('auth_token') ?? null, newer?.access_token ?? null);
  }
});

test('an old request 401 cannot sign out a newer session; a current 401 clears private state', async () => {
  const f = fixture(buyer);
  await f.controller.start();
  f.emit('SIGNED_IN', admin);
  await tick();
  f.controller.rejectToken(buyer.access_token);
  assert.equal(f.controller.getSnapshot().user?.id, admin.user.id);
  f.cache.setQueryData(['profile'], 'private-data');
  f.controller.rejectToken(admin.access_token);
  assert.equal(f.controller.getSnapshot().user, null);
  assert.equal(f.cache.getQueryData(['profile']), undefined);
  assert.equal(await f.controller.getAccessToken(), null);
  f.emit('SIGNED_IN', admin);
  await tick();
  assert.equal(f.controller.getSnapshot().user, null);
});

test('logout clears private state and stops token transport before provider sign-out completes', async () => {
  const f = fixture(buyer);
  await f.controller.start();
  f.cache.setQueryData(['profile'], 'private-data');
  const slow = deferred<void>();
  const signOut = f.auth.signOut;
  f.auth.signOut = async options => { await slow.promise; return signOut(options); };
  const logout = f.controller.logout();
  try {
    assert.equal(f.controller.getSnapshot().user, null);
    assert.equal(f.storage.size, 0);
    assert.equal(f.cache.getQueryCache().getAll().length, 0);
    assert.equal(await f.controller.getAccessToken(), null);
  } finally {
    slow.resolve();
    assert.deepEqual(await logout, { serverConfirmed: true });
  }
});

test('refresh events during provider sign-out cannot restore private state or send a token', async () => {
  const f = fixture(buyer);
  await f.controller.start();
  const slow = deferred<void>();
  const signOut = f.auth.signOut;
  f.auth.signOut = async options => { await slow.promise; return signOut(options); };
  const logout = f.controller.logout();
  try {
    f.emit('TOKEN_REFRESHED', { ...buyer, access_token: 'synthetic-refresh-during-logout' });
    await tick();
    assert.equal(f.controller.getSnapshot().user, null);
    assert.equal(f.storage.size, 0);
    assert.equal(await f.controller.getAccessToken(), null);
  } finally { slow.resolve(); await logout; }
});

test('a token read started before logout cannot return the old token after logout', async () => {
  const f = fixture(buyer);
  await f.controller.start();
  const slow = deferred<{ data: { session: BrowserSession | null }; error: null }>();
  const getSession = f.auth.getSession;
  f.auth.getSession = () => slow.promise;
  const token = f.controller.getAccessToken();
  await tick();
  f.auth.getSession = getSession;
  await f.controller.logout();
  slow.resolve({ data: { session: buyer }, error: null });
  assert.equal(await token, null);
});

test('logout uses current-session scope and removes both mirrors and private caches', async () => {
  const f = fixture(buyer);
  await f.controller.start();
  f.cache.setQueryData(['profile'], 'private-data');
  assert.deepEqual(await f.controller.logout(), { serverConfirmed: true });
  assert.deepEqual(f.calls, [{ operation: 'signOut', args: { scope: 'local' } }]);
  assert.equal(f.storage.size, 0);
  assert.equal(f.cache.getQueryCache().getAll().length, 0);
  assert.equal(await f.controller.getAccessToken(), null);
});

test('repeated logout clicks share one operation and new sign-in waits for its completion', async () => {
  const f = fixture(buyer);
  await f.controller.start();
  const slow = deferred<void>();
  const signOut = f.auth.signOut;
  let requests = 0;
  f.auth.signOut = async options => { requests++; await slow.promise; return signOut(options); };
  const first = f.controller.logout();
  const second = f.controller.logout();
  try {
    assert.equal(first, second);
    await assert.rejects(f.controller.adopt(admin), /Sign out is still in progress/);
    await assert.rejects(f.controller.beginGoogle('http://127.0.0.1:5173'), /Sign out is still in progress/);
    await assert.rejects(f.controller.exchangeGoogleCode('synthetic-code'), /Sign out is still in progress/);
    assert.equal(requests, 1);
    assert.equal(f.calls.length, 0);
  } finally { slow.resolve(); await first; await second; }
  assert.equal((await f.controller.adopt(buyer)).id, buyer.user.id);
});

test('a failed logout cannot expose the SDK-retained token and explicit sign-in can recover', async () => {
  const f = fixture(buyer);
  await f.controller.start();
  f.failSignOut(true);
  await assert.rejects(f.controller.logout(), /Sign out could not be completed/);
  assert.equal(f.controller.getSnapshot().user, null);
  assert.equal(f.storage.size, 0);
  assert.equal(await f.controller.getAccessToken(), null);
  f.emit('SIGNED_IN', buyer);
  await tick();
  assert.equal(f.controller.getSnapshot().user, null);
  assert.equal((await f.controller.adopt(buyer)).id, buyer.user.id);
});

test('logout distinguishes local removal from unconfirmed server revocation', async () => {
  const f = fixture(buyer);
  await f.controller.start();
  f.failSignOut();
  assert.deepEqual(await f.controller.logout(), { serverConfirmed: false });
  assert.equal(f.controller.getSnapshot().user, null);
  assert.equal(f.storage.size, 0);
});

test('logout never reports success if the SDK still has a session', async () => {
  const f = fixture(buyer);
  await f.controller.start();
  f.failSignOut(true);
  await assert.rejects(f.controller.logout(), /Sign out could not be completed/);
});

test('SDK sign-out events from another tab clear this tab private state', async () => {
  const f = fixture(buyer);
  await f.controller.start();
  f.cache.setQueryData(['profile'], 'private-data');
  f.emit('SIGNED_OUT', null);
  assert.equal(f.controller.getSnapshot().user, null);
  assert.equal(f.cache.getQueryData(['profile']), undefined);
  assert.equal(f.storage.size, 0);
});

test('a disposed controller cannot restore stale mirrors after a development reload', async () => {
  const account = deferred<AccountContext>();
  const f = fixture(buyer, () => account.promise);
  const starting = f.controller.start();
  await tick();
  f.controller.dispose();
  account.resolve(buyerContext);
  await starting;
  f.emit('SIGNED_IN', admin);
  await tick();
  assert.equal(f.storage.size, 0);
  assert.equal(f.controller.getSnapshot().user, null);
});

test('missing public configuration allows signed-out browsing and gives a safe login error', async () => {
  const f = createSessionController({ auth: null, storage: { getItem: () => null, setItem() {}, removeItem() {} }, cache: { clear() {} }, readAccount: async () => { throw new Error('Must not run'); }, notify() {} });
  await f.start();
  assert.equal(f.getSnapshot().loading, false);
  assert.equal(await f.getAccessToken(), null);
  await assert.rejects(f.adopt(buyer), /Sign in is not configured/);
  await assert.rejects(f.beginGoogle('http://127.0.0.1:5173'), /Sign in is not configured/);
});

test('Google starts through the SDK with a fixed same-origin login callback', async () => {
  const f = fixture();
  assert.equal(await f.controller.beginGoogle('http://127.0.0.1:5173'), 'https://auth.example.invalid/authorize');
  assert.deepEqual(f.calls[0], { operation: 'signInWithOAuth', args: { provider: 'google', options: { redirectTo: 'http://127.0.0.1:5173/login', skipBrowserRedirect: true } } });
});

test('Google callback uses SDK code exchange with flow binding and server membership', async () => {
  const f = fixture();
  const user = await f.controller.exchangeGoogleCode('synthetic-code', 'synthetic-flow-id');
  assert.equal(user.role, 'buyer');
  assert.deepEqual(f.calls[0], { operation: 'exchangeCodeForSession', args: { code: 'synthetic-code', options: { flowId: 'synthetic-flow-id' } } });
  assert.deepEqual(f.reads, [buyer.access_token]);
});

test('provider startup and exchange failures expose only fixed generic errors', async () => {
  const f = fixture();
  f.auth.signInWithOAuth = async () => { throw new Error('synthetic-private-provider-detail'); };
  f.auth.exchangeCodeForSession = async () => ({ data: { session: null }, error: new Error('synthetic-private-provider-detail') });
  await assert.rejects(f.controller.beginGoogle('http://127.0.0.1:5173'), { message: 'Unable to start Google sign in. Please try again.' });
  await assert.rejects(f.controller.exchangeGoogleCode('synthetic-code'), { message: 'Google sign in could not be completed. Please try again.' });
  assert.equal(f.controller.getSnapshot().user, null);
});

test('OAuth URL parsing removes codes, flow IDs and error details while preserving unrelated navigation', () => {
  assert.deepEqual(readOAuthRedirect('http://127.0.0.1:5173/login?code=synthetic-code&sb_flow_id=flow&keep=1#anchor'), {
    code: 'synthetic-code', flowId: 'flow', failed: false, cleanPath: '/login?keep=1#anchor',
  });
  assert.deepEqual(readOAuthRedirect('http://127.0.0.1:5173/login?error=denied&error_description=synthetic-detail&error_code=123'), {
    code: null, flowId: undefined, failed: true, cleanPath: '/login',
  });
  assert.equal(readOAuthRedirect('http://127.0.0.1:5173/login?keep=1'), null);
});

test('Google callback refuses URL token fragments rather than treating them as a verified session', () => {
  assert.deepEqual(readOAuthRedirect('http://127.0.0.1:5173/login#access_token=synthetic-access&refresh_token=synthetic-refresh&type=signup'), {
    code: null, flowId: undefined, failed: true, cleanPath: '/login',
  });
});
