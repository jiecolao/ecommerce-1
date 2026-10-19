import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createEmailAuth, createPasswordUpdater } from '../src/lib/auth-email.ts';
import type { EmailAuthProvider } from '../src/lib/auth-email.ts';
import type { BrowserSession } from '../src/lib/auth-session.ts';
import { EMAIL_OTP_LENGTH, updateEmailOtp } from '../src/lib/email-otp.ts';

// Synthetic provider adapters only: no .env, mail, accounts, passwords or DB writes.
const a = { id: 'synthetic-a', email: 'a@example.invalid', email_confirmed_at: '2026-01-01T00:00:00Z' };
const b = { id: 'synthetic-b', email: 'b@example.invalid', email_confirmed_at: '2026-01-01T00:00:00Z' };
const sessionA: BrowserSession = { access_token: 'synthetic-access-a', refresh_token: 'synthetic-refresh-a', user: a };
const sessionB: BrowserSession = { access_token: 'synthetic-access-b', refresh_token: 'synthetic-refresh-b', user: b };
function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>(done => { resolve = done; });
  return { promise, resolve };
}
const tick = () => new Promise<void>(resolve => setImmediate(resolve));
function fixture(configured = true) {
  let now = 1;
  let session: BrowserSession | null = null;
  let listener: ((event: string, session: BrowserSession | null) => void) | undefined;
  const calls: { operation: string; args?: unknown }[] = [];
  const updates: { token: string; password: string }[] = [];
  const auth: EmailAuthProvider = {
    async resetPasswordForEmail(email) { calls.push({ operation: 'request', args: email }); return { error: null }; },
    async resend(options) { calls.push({ operation: 'resend', args: options }); return { error: null }; },
    async verifyOtp(options) {
      calls.push({ operation: 'verify', args: options });
      session = sessionA;
      listener?.(options.type === 'recovery' ? 'PASSWORD_RECOVERY' : 'SIGNED_IN', session);
      return { data: { user: a, session }, error: null };
    },
    async getSession() { calls.push({ operation: 'getSession' }); return { data: { session }, error: null }; },
    async getUser(token) { calls.push({ operation: 'getUser', args: token }); return { data: { user: token === sessionB.access_token ? b : a }, error: null }; },
    onAuthStateChange(callback) { listener = callback; return { data: { subscription: { unsubscribe() { listener = undefined; } } } }; },
  };
  const mutation = { async update(token: string, password: string) { updates.push({ token, password }); return { data: { user: a }, error: null as unknown }; } };
  const controller = createEmailAuth({ auth: configured ? auth : null, now: () => now, updatePassword: (token, password) => mutation.update(token, password) });
  return {
    auth, controller, calls, updates, mutation,
    advance(ms: number) { now += ms; },
    emit(event: string, value: BrowserSession | null) { session = value; listener?.(event, value); },
    setSessionSilently(value: BrowserSession | null) { session = value; },
  };
}

test('missing configuration cannot send emails, verify codes, or change passwords', async () => {
  const f = fixture(false);
  await assert.rejects(f.controller.requestRecovery(a.email), /not configured/);
  await assert.rejects(f.controller.resendSignup(a.email), /not configured/);
  await assert.rejects(f.controller.verifySignup(a.email, '01234567'), /not configured/);
  await assert.rejects(f.controller.verifyRecovery(a.email, '01234567'), /not configured/);
  await assert.rejects(f.controller.updatePassword('synthetic-password'), /Verify a new/);
  assert.deepEqual(f.calls, []);
  assert.deepEqual(f.updates, []);
});

test('invalid email, six-digit, incomplete, excess, and non-numeric codes fail before provider calls', async () => {
  const f = fixture();
  await assert.rejects(f.controller.requestRecovery('invalid'), /valid email/);
  await assert.rejects(f.controller.resendSignup(''), /valid email/);
  for (const code of ['', '12345', '123456', '1234567', '123456789', 'abcdefgh', '0123456 ']) {
    await assert.rejects(f.controller.verifySignup(a.email, code), /complete 8-digit/);
    await assert.rejects(f.controller.verifyRecovery(a.email, code), /complete 8-digit/);
  }
  assert.equal(f.calls.length, 0);
});

test('all eight digits, including a leading zero, reach each provider verification unchanged', async () => {
  const f = fixture();
  await f.controller.verifySignup(a.email, '01234567');
  await f.controller.verifyRecovery(a.email, '01234567');
  assert.deepEqual(f.calls.filter(call => call.operation === 'verify'), [
    { operation: 'verify', args: { email: a.email, token: '01234567', type: 'email' } },
    { operation: 'verify', args: { email: a.email, token: '01234567', type: 'recovery' } },
  ]);
});

test('a full pasted code fills all eight boxes from any focused box without truncation', () => {
  const blank = Array<string>(EMAIL_OTP_LENGTH).fill('');
  for (let index = 0; index < EMAIL_OTP_LENGTH; index++) {
    const result = updateEmailOtp(blank, index, '01234567');
    assert.equal(result?.digits.join(''), '01234567');
    assert.equal(result?.focus, EMAIL_OTP_LENGTH - 1);
  }
  assert.deepEqual(blank, Array<string>(EMAIL_OTP_LENGTH).fill(''));
  assert.equal(updateEmailOtp(blank, 0, '012345678'), null);
  assert.equal(updateEmailOtp(blank, 7, '12'), null);
  assert.equal(updateEmailOtp(blank, 0, '0123x567'), null);
});

test('typing, partial paste, and erasing preserve the other code boxes and focus', () => {
  const otp = '01234567'.split('');
  assert.deepEqual(updateEmailOtp(otp, 2, '9'), { digits: '01934567'.split(''), focus: 3 });
  assert.deepEqual(updateEmailOtp(otp, 3, '98'), { digits: '01298567'.split(''), focus: 5 });
  assert.deepEqual(updateEmailOtp(otp, 7, '9'), { digits: '01234569'.split(''), focus: 7 });
  assert.deepEqual(updateEmailOtp(otp, 2, ''), { digits: ['0', '1', '', '3', '4', '5', '6', '7'], focus: 2 });
});

test('recovery requests and signup resends use distinct existing provider operations', async () => {
  const f = fixture();
  await f.controller.requestRecovery(` ${a.email} `);
  await f.controller.resendSignup(a.email);
  assert.deepEqual(f.calls, [{ operation: 'request', args: a.email }, { operation: 'resend', args: { type: 'signup', email: a.email } }]);
  assert.equal(f.controller.getRecoverySnapshot(), false);
  assert.equal(f.updates.length, 0);
});

test('signup confirmation uses email OTP and only reports a provider-confirmed matching email', async () => {
  const f = fixture();
  await f.controller.verifySignup(a.email.toUpperCase(), '01234567');
  assert.deepEqual(f.calls[0], { operation: 'verify', args: { type: 'email', email: a.email.toUpperCase(), token: '01234567' } });
  assert.equal(f.controller.getRecoverySnapshot(), false);
  assert.equal(f.updates.length, 0);
  for (const user of [null, { ...a, email_confirmed_at: undefined }, { ...a, email: undefined }, b]) {
    f.auth.verifyOtp = async () => ({ data: { user, session: sessionA }, error: null });
    await assert.rejects(f.controller.verifySignup(a.email, '01234567'), /invalid or has expired/);
  }
});

test('invalid, expired, and reused code responses cannot grant recovery access', async () => {
  const f = fixture();
  f.auth.verifyOtp = async () => ({ data: { user: null, session: null }, error: { status: 403, message: 'synthetic-private-provider-detail' } });
  await assert.rejects(f.controller.verifySignup(a.email, '01234567'), { message: 'The code is invalid or has expired. Request a new code and try again.' });
  await assert.rejects(f.controller.verifyRecovery(a.email, '01234567'), /invalid or has expired/);
  assert.equal(f.controller.getRecoverySnapshot(), false);
  await assert.rejects(f.controller.updatePassword('synthetic-password'), /Verify a new/);
  assert.equal(f.updates.length, 0);
});

test('successful recovery verification requires its own purpose and the same SDK session', async () => {
  const f = fixture();
  await f.controller.verifyRecovery(a.email, '01234567');
  assert.deepEqual(f.calls[0], { operation: 'verify', args: { type: 'recovery', email: a.email, token: '01234567' } });
  assert.equal(f.controller.getRecoverySnapshot(), true);
  assert.equal(f.updates.length, 0);
});

test('mismatched or missing provider sessions cannot enable the password form', async () => {
  for (const session of [null, { ...sessionA, refresh_token: '' }, sessionB, sessionA]) {
    const f = fixture();
    f.auth.verifyOtp = async () => ({ data: { user: a, session }, error: null });
    // The fake SDK has no matching persisted session, even for the final case.
    await assert.rejects(f.controller.verifyRecovery(a.email, '01234567'));
    assert.equal(f.controller.getRecoverySnapshot(), false);
    assert.equal(f.updates.length, 0);
  }
});

test('ordinary sign-in cannot grant password-recovery access', async () => {
  const f = fixture();
  f.emit('SIGNED_IN', sessionA);
  await assert.rejects(f.controller.updatePassword('synthetic-password'), /Verify a new/);
  assert.equal(f.calls.length, 0);
  assert.equal(f.updates.length, 0);
});

test('password updates validate the JWT server-side and preserve exact password bytes', async () => {
  const f = fixture();
  await f.controller.verifyRecovery(a.email, '01234567');
  const password = ' synthetic-password-with-spaces ';
  await f.controller.updatePassword(password);
  assert.ok(f.calls.some(call => call.operation === 'getUser' && call.args === sessionA.access_token));
  assert.deepEqual(f.updates, [{ token: sessionA.access_token, password }]);
  assert.equal(f.controller.getRecoverySnapshot(), false);
  await assert.rejects(f.controller.updatePassword(password), /Verify a new/);
  assert.equal(f.updates.length, 1);
});

test('the existing eight-character minimum is enforced before any password mutation', async () => {
  const f = fixture();
  await f.controller.verifyRecovery(a.email, '01234567');
  await assert.rejects(f.controller.updatePassword('short'), /at least 8/);
  assert.equal(f.controller.getRecoverySnapshot(), true);
  assert.equal(f.updates.length, 0);
});

test('recovery permission expires after ten minutes without extending provider token expiry', async () => {
  const f = fixture();
  await f.controller.verifyRecovery(a.email, '01234567');
  f.advance(10 * 60 * 1000);
  assert.equal(f.controller.getRecoverySnapshot(), false);
  await assert.rejects(f.controller.updatePassword('synthetic-password'), /Verify a new/);
  assert.equal(f.updates.length, 0);
});

test('requesting another recovery code invalidates the previous form grant', async () => {
  const f = fixture();
  await f.controller.verifyRecovery(a.email, '01234567');
  await f.controller.requestRecovery(a.email);
  assert.equal(f.controller.getRecoverySnapshot(), false);
  assert.equal(f.updates.length, 0);
});

test('logout and another account signing in both invalidate recovery permission', async () => {
  for (const [event, session] of [['SIGNED_OUT', null], ['SIGNED_IN', sessionB]] as const) {
    const f = fixture();
    await f.controller.verifyRecovery(a.email, '01234567');
    f.emit(event, session);
    await assert.rejects(f.controller.updatePassword('synthetic-password'), /Verify a new/);
    assert.equal(f.updates.length, 0);
  }
});

test('same-account focus/sign-in and refresh events retain a valid recovery grant', async () => {
  const f = fixture();
  await f.controller.verifyRecovery(a.email, '01234567');
  f.emit('SIGNED_IN', sessionA);
  f.emit('TOKEN_REFRESHED', { ...sessionA, access_token: 'synthetic-refreshed-a' });
  await f.controller.updatePassword('synthetic-password');
  assert.equal(f.updates[0].token, 'synthetic-refreshed-a');
});

test('a forged or stale browser session cannot change another user password', async () => {
  const f = fixture();
  await f.controller.verifyRecovery(a.email, '01234567');
  f.setSessionSilently(sessionB);
  await assert.rejects(f.controller.updatePassword('synthetic-password'), /Verify a new/);
  assert.equal(f.updates.length, 0);
  assert.equal(f.controller.getRecoverySnapshot(), false);
});

test('server identity mismatch or verification failure blocks the password request', async () => {
  for (const outcome of ['mismatch', 'failure']) {
    const f = fixture();
    await f.controller.verifyRecovery(a.email, '01234567');
    f.auth.getUser = async () => ({ data: { user: outcome === 'mismatch' ? b : null }, error: outcome === 'failure' ? { status: 401 } : null });
    await assert.rejects(f.controller.updatePassword('synthetic-password'), /Verify a new/);
    assert.equal(f.updates.length, 0);
    assert.equal(f.controller.getRecoverySnapshot(), false);
  }
});

test('logout during an identity lookup prevents a later password mutation', async () => {
  const f = fixture();
  await f.controller.verifyRecovery(a.email, '01234567');
  const slow = deferred<{ data: { user: typeof a }; error: null }>();
  f.auth.getUser = () => slow.promise;
  const result = f.controller.updatePassword('synthetic-password');
  const rejected = assert.rejects(result, /Verify a new/);
  await tick();
  f.emit('SIGNED_OUT', null);
  slow.resolve({ data: { user: a }, error: null });
  await rejected;
  assert.equal(f.updates.length, 0);
});

test('an in-flight password request remains bound to the intended recovery identity during an account switch', async () => {
  const f = fixture();
  await f.controller.verifyRecovery(a.email, '01234567');
  const slow = deferred<{ data: { user: typeof a }; error: unknown }>();
  f.mutation.update = async (token, password) => { f.updates.push({ token, password }); return slow.promise; };
  const result = f.controller.updatePassword('synthetic-password');
  await tick();
  f.emit('SIGNED_IN', sessionB);
  slow.resolve({ data: { user: a }, error: null });
  await result;
  assert.equal(f.updates.length, 1);
  assert.equal(f.updates[0].token, sessionA.access_token);
});

test('a successful HTTP response with a missing or different user cannot report password-update success', async () => {
  const f = fixture();
  await f.controller.verifyRecovery(a.email, '01234567');
  f.mutation.update = async () => ({ data: { user: b }, error: null });
  await assert.rejects(f.controller.updatePassword('synthetic-password'), /could not be confirmed/);
});

test('rate limits, network errors and password-policy failures use generic messages', async () => {
  const f = fixture();
  f.auth.resetPasswordForEmail = async () => ({ error: { status: 429, message: 'synthetic-private-provider-detail' } });
  await assert.rejects(f.controller.requestRecovery(a.email), { message: 'Too many authentication requests. Please try again later.' });
  f.auth.resend = async () => { throw new Error('synthetic-private-provider-detail'); };
  await assert.rejects(f.controller.resendSignup(a.email), { message: 'Unable to request another verification code. Please try again later.' });
  await f.controller.verifyRecovery(a.email, '01234567');
  f.mutation.update = async () => ({ data: { user: null as never }, error: { status: 422, message: 'synthetic-private-provider-detail' } });
  await assert.rejects(f.controller.updatePassword('synthetic-password'), { message: 'Unable to update your password. Please check its requirements and try again.' });
  assert.equal(f.controller.getRecoverySnapshot(), true);
});

test('a late verification result after logout cannot restore recovery permission', async () => {
  const f = fixture();
  const slow = deferred<{ data: { user: typeof a; session: BrowserSession }; error: null }>();
  f.auth.verifyOtp = () => slow.promise;
  const result = f.controller.verifyRecovery(a.email, '01234567');
  const rejected = assert.rejects(result, /Verify a new/);
  f.emit('SIGNED_OUT', null);
  f.setSessionSilently(sessionA);
  slow.resolve({ data: { user: a, session: sessionA }, error: null });
  await rejected;
  assert.equal(f.controller.getRecoverySnapshot(), false);
});

test('a disposed controller cannot retain recovery permission across reloads', async () => {
  const f = fixture();
  await f.controller.verifyRecovery(a.email, '01234567');
  f.controller.dispose();
  assert.equal(f.controller.getRecoverySnapshot(), false);
  assert.equal(f.updates.length, 0);
});

test('password transport uses only the explicitly verified JWT, publishable key, and password attribute', async () => {
  let request: { url: string; options?: RequestInit } | undefined;
  const update = createPasswordUpdater({
    url: 'https://auth.example.invalid/', publishableKey: 'synthetic-public-key',
    async fetch(url, options) { request = { url: String(url), options }; return new Response(JSON.stringify(a), { status: 200 }); },
  });
  const result = await update(sessionA.access_token, ' synthetic-password ');
  assert.equal(result.data.user?.id, a.id);
  assert.deepEqual(request, {
    url: 'https://auth.example.invalid/auth/v1/user',
    options: {
      method: 'PUT', cache: 'no-store', credentials: 'omit',
      headers: { apikey: 'synthetic-public-key', Authorization: `Bearer ${sessionA.access_token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: ' synthetic-password ' }),
    },
  });
});

test('password transport never reads or forwards an upstream error body', async () => {
  let reads = 0;
  const update = createPasswordUpdater({
    url: 'https://auth.example.invalid', publishableKey: 'synthetic-public-key',
    async fetch() {
      const response = new Response('synthetic-private-provider-detail', { status: 422 });
      response.json = async () => { reads++; throw new Error('Must not read private error bodies'); };
      return response;
    },
  });
  assert.deepEqual(await update(sessionA.access_token, 'synthetic-password'), { data: { user: null }, error: { status: 422 } });
  assert.equal(reads, 0);
});
