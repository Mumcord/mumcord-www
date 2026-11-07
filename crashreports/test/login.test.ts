import { test } from 'node:test';
import assert from 'node:assert/strict';
import { DatabaseSync } from 'node:sqlite';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { hashToken, LOGIN_FAILED } from '../src/auth.ts';
import { Store } from '../src/db.ts';
import { totpCode } from '../src/totp.ts';
import { makeApp } from './helpers.ts';

const KEY = Buffer.alloc(32, 7);
const H = { 'x-crashreports-csrf': '1', 'content-type': 'application/json' };
const PW = 'Correct-Horse-9';

type Json = Record<string, unknown>;

function setup(opts: { key?: Buffer | null; rateLimit?: number } = {}) {
  const clock = { t: Date.now() };
  const logs: string[] = [];
  const ctx = makeApp(
    { totpEncryptionKey: opts.key === undefined ? KEY : opts.key, rateLimitPerMinute: opts.rateLimit ?? 1000 },
    { now: () => clock.t, authLog: (m) => logs.push(m) },
  );
  const call = async (method: string, path: string, body?: unknown, extra: Record<string, string> = {}) => {
    const res = await ctx.app.request(path, { method, headers: { ...H, ...extra }, body: body === undefined ? undefined : JSON.stringify(body) });
    const json = (await res.json().catch(() => ({}))) as Json;
    const cookie = /cr_session=([^;]+)/.exec(res.headers.get('set-cookie') ?? '')?.[1];
    return { status: res.status, json, cookie: cookie ? `cr_session=${cookie}` : undefined };
  };
  const as = (cookie: string) => (method: string, path: string, body?: unknown) => call(method, path, body, { cookie });
  /** Enrolls via start + finish; returns the session cookie, the secret and the recovery codes. */
  const enroll = async (start: Json, finishPath = '/api/auth/enroll/finish', startPath = '/api/auth/enroll/start', cookie?: string) => {
    const s = await call('POST', startPath, start, cookie ? { cookie } : {});
    assert.equal(s.status, 200, JSON.stringify(s.json));
    const secret = s.json.secret as string;
    const f = await call('POST', finishPath, { enroll_id: s.json.enroll_id, code: totpCode(secret, clock.t) }, cookie ? { cookie } : {});
    assert.equal(f.status, 200, JSON.stringify(f.json));
    return { cookie: f.cookie, secret, codes: f.json.recovery_codes as string[], start: s.json };
  };
  const setupAlice = () => enroll({ setup_token: 'setup-secret', username: 'alice', password: PW });
  /** Password step then code step. */
  const login = async (username: string, password: string, code: string) => {
    const p = await call('POST', '/api/auth/password/login', { username, password });
    if (p.status !== 200) return p;
    return call('POST', '/api/auth/password/verify', { pending: p.json.pending, code });
  };
  const tick = (ms = 30_000) => (clock.t += ms);
  return { ...ctx, clock, logs, call, as, enroll, setupAlice, login, tick };
}

test('setup with password + TOTP: QR, encrypted secret, recovery codes, session', async () => {
  const t = setup();
  const s = await t.call('POST', '/api/auth/enroll/start', { setup_token: 'setup-secret', username: 'alice', password: PW });
  assert.equal(s.status, 200);
  assert.match(s.json.qr as string, /^data:image\/svg\+xml;base64,/);
  assert.match(s.json.secret as string, /^[A-Z2-7]{32}$/);
  assert.equal(
    s.json.otpauth,
    `otpauth://totp/Mumcord%20Crash%20Reports:alice?secret=${s.json.secret}&issuer=Mumcord%20Crash%20Reports&algorithm=SHA1&digits=6&period=30`,
  );
  assert.equal(t.store.getUserByName('alice'), null, 'not active before the first code');

  const wrong = await t.call('POST', '/api/auth/enroll/finish', { enroll_id: s.json.enroll_id, code: '000000' });
  assert.equal(wrong.status, 400);
  const ok = await t.call('POST', '/api/auth/enroll/finish', { enroll_id: s.json.enroll_id, code: totpCode(s.json.secret as string, t.clock.t) });
  assert.equal(ok.status, 200);
  assert.equal((ok.json.recovery_codes as string[]).length, 10);
  assert.ok(ok.cookie);
  assert.equal((await t.as(ok.cookie!)('GET', '/api/admin/groups')).status, 200);

  const u = t.store.getUserByName('ALICE')!;
  assert.match(u.password_hash!, /^scrypt\$32768\$8\$1\$/);
  assert.ok(!u.totp_secret_enc!.includes(s.json.secret as string));
  assert.equal(t.store.recoveryCodesLeft(u.id), 10);
  assert.equal(t.store.sessionUser(hashToken(ok.cookie!.split('=')[1])), u.id);
  // The enrollment is gone, and setup is closed now.
  assert.equal((await t.call('POST', '/api/auth/enroll/finish', { enroll_id: s.json.enroll_id, code: '123456' })).status, 410);
  assert.equal((await t.call('POST', '/api/auth/enroll/start', { setup_token: 'setup-secret', username: 'eve', password: PW })).status, 403);
  assert.equal((await t.app.request('/setup?token=setup-secret')).status, 302);
});

test('enrollment enforces the policy and the setup token server-side', async () => {
  const t = setup();
  const start = (b: Json) => t.call('POST', '/api/auth/enroll/start', { setup_token: 'setup-secret', username: 'alice', ...b });
  const short = await start({ password: 'short1!A' });
  assert.equal(short.status, 400);
  assert.deepEqual(short.json.rules, ['length']);
  assert.deepEqual((await start({ password: 'Alice-Rocks-2026' })).json.rules, ['username']);
  assert.deepEqual((await start({ password: 'Password1234!' })).json.rules, ['common']);
  assert.equal((await start({ password: PW, username: 'a b' })).status, 400, 'bad username');
  assert.equal((await start({ password: PW, setup_token: 'wrong' })).status, 403);
});

test('password login: password, then code, then a session; wrong paths are generic', async () => {
  const t = setup();
  const { secret } = await t.setupAlice();
  t.tick();

  const unknown = await t.call('POST', '/api/auth/password/login', { username: 'mallory', password: PW });
  const wrongPw = await t.call('POST', '/api/auth/password/login', { username: 'alice', password: 'Wrong-Horse-99' });
  assert.equal(unknown.status, 401);
  assert.equal(wrongPw.status, 401);
  assert.deepEqual(unknown.json, { error: LOGIN_FAILED });
  assert.deepEqual(wrongPw.json, { error: LOGIN_FAILED }, 'same message for unknown user and wrong password');
  assert.ok(t.logs.some((l) => l.includes('"mallory"')));
  assert.ok(!t.logs.some((l) => l.includes(PW) || l.includes('Wrong-Horse-99')), 'passwords are never logged');

  const p = await t.call('POST', '/api/auth/password/login', { username: 'Alice', password: PW });
  assert.equal(p.status, 200, 'usernames are case-insensitive');
  assert.equal(p.cookie, undefined, 'no session after the password alone');
  const bad = await t.call('POST', '/api/auth/password/verify', { pending: p.json.pending, code: '000000' });
  assert.equal(bad.status, 401);
  assert.equal(bad.cookie, undefined);
  const code = totpCode(secret, t.clock.t);
  const good = await t.call('POST', '/api/auth/password/verify', { pending: p.json.pending, code });
  assert.equal(good.status, 200);
  assert.ok(good.cookie);
  assert.equal((await t.as(good.cookie!)('GET', '/api/admin/groups')).status, 200);
  assert.equal((await t.call('POST', '/api/auth/password/verify', { pending: p.json.pending, code })).status, 401, 'pending is single-use');

  // Replay: the same code does not open a second session.
  assert.equal((await t.login('alice', PW, code)).status, 401);
  t.tick();
  assert.equal((await t.login('alice', PW, totpCode(secret, t.clock.t))).status, 200);
  assert.equal(t.store.getUserByName('alice')!.failed_attempts, 0, 'a full sign-in resets the counter');
});

test('the code step expires after 5 minutes and allows 5 attempts', async () => {
  const t = setup();
  const { secret } = await t.setupAlice();
  t.tick();
  const p = await t.call('POST', '/api/auth/password/login', { username: 'alice', password: PW });
  t.tick(5 * 60_000 + 1);
  const late = await t.call('POST', '/api/auth/password/verify', { pending: p.json.pending, code: totpCode(secret, t.clock.t) });
  assert.equal(late.status, 401);
  assert.equal(late.json.restart, true);

  t.store.resetFailures(t.store.getUserByName('alice')!.id);
  const p2 = await t.call('POST', '/api/auth/password/login', { username: 'alice', password: PW });
  for (let i = 0; i < 4; i++) {
    const r = await t.call('POST', '/api/auth/password/verify', { pending: p2.json.pending, code: '000000' });
    assert.equal(r.status, 401);
  }
  const fifth = await t.call('POST', '/api/auth/password/verify', { pending: p2.json.pending, code: '000000' });
  assert.equal(fifth.json.restart, true);
  t.store.resetFailures(t.store.getUserByName('alice')!.id);
  const after = await t.call('POST', '/api/auth/password/verify', { pending: p2.json.pending, code: totpCode(secret, t.clock.t) });
  assert.equal(after.status, 401, 'the pending sign-in is gone after 5 wrong codes');
});

test('a recovery code signs in once', async () => {
  const t = setup();
  const { codes } = await t.setupAlice();
  assert.equal((await t.login('alice', PW, codes[3])).status, 200);
  assert.equal((await t.login('alice', PW, codes[3])).status, 401);
  assert.equal(t.store.recoveryCodesLeft(t.store.getUserByName('alice')!.id), 9);
});

test('lockout with exponential backoff counts password and code failures (fake clock)', async () => {
  const t = setup();
  const { secret } = await t.setupAlice();
  const uid = t.store.getUserByName('alice')!.id;
  for (let i = 1; i <= 4; i++) assert.equal((await t.call('POST', '/api/auth/password/login', { username: 'alice', password: 'Wrong-Horse-99' })).status, 401);
  const fifth = await t.call('POST', '/api/auth/password/login', { username: 'alice', password: 'Wrong-Horse-99' });
  assert.equal(fifth.status, 429);
  assert.match(fifth.json.error as string, /1 min/);
  // Locked: even the right password is refused.
  assert.equal((await t.call('POST', '/api/auth/password/login', { username: 'alice', password: PW })).status, 429);
  t.tick(61_000);
  // Unlocked; a wrong code is failure 6: locked for 2 minutes.
  const p = await t.call('POST', '/api/auth/password/login', { username: 'alice', password: PW });
  assert.equal(p.status, 200);
  const wrong = await t.call('POST', '/api/auth/password/verify', { pending: p.json.pending, code: '000000' });
  assert.equal(wrong.status, 429);
  assert.match(wrong.json.error as string, /2 min/);
  assert.equal(t.store.getUser(uid)!.failed_attempts, 6);
  t.tick(61_000);
  assert.equal((await t.call('POST', '/api/auth/password/login', { username: 'alice', password: PW })).status, 429, 'still locked');
  t.tick(60_000);
  assert.equal((await t.login('alice', PW, totpCode(secret, t.clock.t))).status, 200);
  assert.equal(t.store.getUser(uid)!.failed_attempts, 0);
});

test('login routes are rate limited per IP', async () => {
  const t = setup({ rateLimit: 3 });
  let last = 0;
  for (let i = 0; i < 5; i++) last = (await t.call('POST', '/api/auth/password/login', { username: 'x', password: 'y' })).status;
  assert.equal(last, 429);
  assert.equal((await t.call('POST', '/api/auth/password/login', { username: 'x', password: 'y' }, { 'x-test-ip': 'other' })).status, 401);
});

test('without TOTP_ENCRYPTION_KEY password sign-in is off', async () => {
  const t = setup({ key: null });
  const state = await t.call('GET', '/api/auth/state');
  assert.equal(state.json.passwordLogin, false);
  assert.equal((await t.call('POST', '/api/auth/password/login', { username: 'a', password: 'b' })).status, 403);
  assert.equal((await t.call('POST', '/api/auth/enroll/start', { setup_token: 'setup-secret', username: 'alice', password: PW })).status, 403);
});

test('invite → password enrollment; the invite works once', async () => {
  const t = setup();
  const alice = await t.setupAlice();
  const inv = await t.as(alice.cookie!)('POST', '/api/admin/invites', { label: 'Bob' });
  assert.equal(inv.status, 201);
  const token = (inv.json.url as string).split('#')[1];
  const bob = await t.enroll({ invite_token: token, username: 'bob', password: 'Second-Secret-Pass1' });
  assert.ok(bob.cookie);
  assert.equal(bob.codes.length, 10);
  const u = t.store.getUserByName('bob')!;
  assert.equal(u.invited_by, 'alice');
  assert.equal(t.store.sessionUser(hashToken(bob.cookie!.split('=')[1])), u.id);
  const again = await t.call('POST', '/api/auth/enroll/start', { invite_token: token, username: 'bob2', password: 'Second-Secret-Pass1' });
  assert.equal(again.status, 410);
  // Taken usernames are refused (case-insensitive).
  const inv2 = await t.as(alice.cookie!)('POST', '/api/admin/invites', {});
  const taken = await t.call('POST', '/api/auth/enroll/start', { invite_token: (inv2.json.url as string).split('#')[1], username: 'BOB', password: 'Second-Secret-Pass1' });
  assert.equal(taken.status, 409);
  t.tick();
  assert.equal((await t.login('bob', 'Second-Secret-Pass1', totpCode(bob.secret, t.clock.t))).status, 200);
});

test('account: change password, regenerate codes, reset TOTP; other sessions end', async () => {
  const t = setup();
  const a = await t.setupAlice();
  t.tick();
  const other = await t.login('alice', PW, totpCode(a.secret, t.clock.t));
  assert.ok(other.cookie);
  const me = t.as(a.cookie!);
  t.tick();

  const NEW = 'Brand-New-Pass-77';
  assert.equal((await me('POST', '/api/admin/account/password/change', { current_password: 'nope', code: totpCode(a.secret, t.clock.t), new_password: NEW })).status, 401);
  assert.equal((await me('POST', '/api/admin/account/password/change', { current_password: PW, code: '000000', new_password: NEW })).status, 401);
  assert.equal((await me('POST', '/api/admin/account/password/change', { current_password: PW, code: totpCode(a.secret, t.clock.t), new_password: 'short1!A' })).status, 400);
  const ch = await me('POST', '/api/admin/account/password/change', { current_password: PW, code: totpCode(a.secret, t.clock.t), new_password: NEW });
  assert.equal(ch.status, 200);
  assert.equal(ch.json.sessions_ended, 1);
  assert.equal((await t.as(other.cookie!)('GET', '/api/admin/groups')).status, 401, 'other session ended');
  assert.equal((await me('GET', '/api/admin/groups')).status, 200, 'own session stays');
  t.tick();

  const rc = await me('POST', '/api/admin/account/recovery-codes', { code: totpCode(a.secret, t.clock.t) });
  assert.equal(rc.status, 200);
  assert.equal((rc.json.recovery_codes as string[]).length, 10);
  assert.equal((await t.login('alice', NEW, a.codes[0])).status, 401, 'old codes are gone');
  t.store.resetFailures(t.store.getUserByName('alice')!.id);

  // Reset TOTP: needs a current code; the new secret becomes active after its first code.
  assert.equal((await me('POST', '/api/admin/account/totp/reset', { code: '000000' })).status, 401);
  t.tick();
  const second = await t.login('alice', NEW, totpCode(a.secret, t.clock.t));
  t.tick();
  const reset = await me('POST', '/api/admin/account/totp/reset', { code: totpCode(a.secret, t.clock.t) });
  assert.equal(reset.status, 200);
  const newSecret = reset.json.secret as string;
  const fin = await me('POST', '/api/admin/account/enroll/finish', { enroll_id: reset.json.enroll_id, code: totpCode(newSecret, t.clock.t) });
  assert.equal(fin.status, 200);
  assert.equal((await t.as(second.cookie!)('GET', '/api/admin/groups')).status, 401, 'a 2FA reset ends other sessions');
  t.tick();
  assert.equal((await t.login('alice', NEW, totpCode(a.secret, t.clock.t))).status, 401, 'old secret no longer works');
  t.tick();
  assert.equal((await t.login('alice', NEW, totpCode(newSecret, t.clock.t))).status, 200);
});

test('a passkey-only user can add password + 2FA', async () => {
  const t = setup();
  t.store.addCredential({ id: 'pk', publicKey: new Uint8Array([1]), counter: 0, transports: [], name: 'Carol laptop' });
  const uid = t.store.getCredential('pk')!.user_id!;
  t.store.createSession(hashToken('carol'), new Date(Date.now() + 3600_000), 'pk');
  const me = t.as('cr_session=carol');
  const acct = await me('GET', '/api/admin/account');
  assert.equal(acct.json.username, 'Carol-laptop');
  assert.equal(acct.json.password_2fa, false);
  assert.equal((await me('POST', '/api/admin/account/password/setup', { password: 'short1!A' })).status, 400);
  const r = await t.enroll({ password: 'Carols-Pass-1234' }, '/api/admin/account/enroll/finish', '/api/admin/account/password/setup', 'cr_session=carol');
  assert.equal(r.codes.length, 10);
  assert.equal(t.store.getUser(uid)!.password_hash !== null, true);
  t.tick();
  assert.equal((await t.login('carol-laptop', 'Carols-Pass-1234', totpCode(r.secret, t.clock.t))).status, 200);
});

test('admin: delete users and reset password + 2FA; the last sign-in cannot go', async () => {
  const t = setup();
  const a = await t.setupAlice();
  const alice = t.store.getUserByName('alice')!;
  const admin = t.as(a.cookie!);
  assert.equal((await admin('DELETE', `/api/admin/users/${alice.id}`)).status, 400, 'last user');
  assert.equal(t.store.deleteUser(alice.id), 'last');
  assert.equal((await admin('POST', `/api/admin/users/${alice.id}/reset-password`)).status, 400, 'not for yourself');
  assert.equal(t.store.clearPassword(alice.id), 'last');

  const inv = await admin('POST', '/api/admin/invites', {});
  const bob = await t.enroll({ invite_token: (inv.json.url as string).split('#')[1], username: 'bob', password: 'Second-Secret-Pass1' });
  const bobId = t.store.getUserByName('bob')!.id;

  const users = await admin('GET', '/api/admin/users');
  const list = users.json as unknown as { username: string; password_2fa: boolean; recovery_codes_left: number; current: boolean }[];
  assert.deepEqual(list.map((u) => [u.username, u.password_2fa, u.recovery_codes_left, u.current]), [['alice', true, 10, true], ['bob', true, 10, false]]);

  // Reset Bob: his sessions end and he needs a new invite for his account.
  const reset = await admin('POST', `/api/admin/users/${bobId}/reset-password`);
  assert.deepEqual(reset.json, { ok: true, needs_invite: true });
  assert.equal((await t.as(bob.cookie!)('GET', '/api/admin/groups')).status, 401);
  assert.equal((await t.call('POST', '/api/auth/password/login', { username: 'bob', password: 'Second-Secret-Pass1' })).status, 401);
  const re = await admin('POST', '/api/admin/invites', { user_id: bobId });
  assert.equal(re.status, 201);
  const reToken = (re.json.url as string).split('#')[1];
  assert.deepEqual((await t.call('POST', '/api/auth/invite/info', { invite_token: reToken })).json, { label: '', username: 'bob' });
  const bob2 = await t.enroll({ invite_token: reToken, username: 'ignored', password: 'Second-Other-Pass2' });
  assert.equal(t.store.getUserByName('bob')!.id, bobId, 'same account');
  assert.equal(t.store.getUserByName('ignored'), null);

  // Now Alice could delete Bob; that ends his sessions too.
  const del = await admin('DELETE', `/api/admin/users/${bobId}`);
  assert.deepEqual(del.json, { ok: true, self: false });
  assert.equal((await t.as(bob2.cookie!)('GET', '/api/admin/groups')).status, 401);
  assert.equal(t.store.getUser(bobId), null);
  assert.equal((await admin('DELETE', `/api/admin/users/${bobId}`)).status, 404);
});

test('new admin routes return 401 without a session and need the CSRF header', async () => {
  const t = setup();
  const a = await t.setupAlice();
  const id = t.store.getUserByName('alice')!.id;
  const routes: [string, string][] = [
    ['GET', '/api/admin/users'],
    ['DELETE', `/api/admin/users/${id}`],
    ['POST', `/api/admin/users/${id}/reset-password`],
    ['GET', '/api/admin/account'],
    ['POST', '/api/admin/account/password/setup'],
    ['POST', '/api/admin/account/password/change'],
    ['POST', '/api/admin/account/recovery-codes'],
    ['POST', '/api/admin/account/totp/reset'],
    ['POST', '/api/admin/account/enroll/finish'],
  ];
  for (const [method, path] of routes) {
    assert.equal((await t.call(method, path, method === 'GET' ? undefined : {})).status, 401, `${method} ${path}`);
    assert.equal((await t.call(method, path, method === 'GET' ? undefined : {}, { cookie: 'cr_session=forged' })).status, 401, `${method} ${path} forged`);
    if (method !== 'GET') {
      const r = await t.app.request(path, { method, headers: { cookie: a.cookie!, 'content-type': 'application/json' }, body: '{}' });
      assert.equal(r.status, 403, `${method} ${path} without CSRF header`);
      const r2 = await t.call(method, path, {}, { cookie: a.cookie!, origin: 'https://evil.example' });
      assert.equal(r2.status, 403, `${method} ${path} cross-origin`);
    }
  }
  for (const path of ['/api/auth/password/login', '/api/auth/password/verify', '/api/auth/enroll/start', '/api/auth/enroll/finish']) {
    const r = await t.app.request(path, { method: 'POST', headers: { 'content-type': 'application/json' }, body: '{}' });
    assert.equal(r.status, 403, `${path} without CSRF header`);
  }
  assert.ok(t.store.getUser(id), 'nothing was deleted');
});

test('a passkey-only database is migrated: each passkey becomes a user', () => {
  const dir = mkdtempSync(join(tmpdir(), 'crashreports-users-'));
  const path = join(dir, 'old.db');
  try {
    const old = new DatabaseSync(path);
    old.exec(`
      CREATE TABLE credentials (id TEXT PRIMARY KEY, public_key BLOB NOT NULL, counter INTEGER NOT NULL,
        transports TEXT NOT NULL DEFAULT '[]', name TEXT NOT NULL DEFAULT '', created_at TEXT NOT NULL,
        last_used_at TEXT, invited_by TEXT);
      CREATE TABLE sessions (token_hash TEXT PRIMARY KEY, created_at TEXT NOT NULL, expires_at TEXT NOT NULL, credential_id TEXT);
      CREATE TABLE invites (id TEXT PRIMARY KEY, token_hash TEXT NOT NULL UNIQUE, label TEXT NOT NULL DEFAULT '',
        created_by_credential TEXT, created_by_session TEXT, created_at TEXT NOT NULL, expires_at TEXT NOT NULL,
        used_at TEXT, revoked_at TEXT, credential_id TEXT);
      INSERT INTO credentials VALUES ('c1', x'01', 1, '[]', 'first passkey', '2025-01-01T00:00:00.000Z', NULL, NULL);
      INSERT INTO credentials VALUES ('c2', x'02', 2, '[]', 'Alex', '2025-02-01T00:00:00.000Z', NULL, 'first passkey');
      INSERT INTO credentials VALUES ('c3', x'03', 3, '[]', 'alex', '2025-03-01T00:00:00.000Z', NULL, 'first passkey');
      INSERT INTO credentials VALUES ('c4', x'04', 4, '[]', '', '2025-04-01T00:00:00.000Z', NULL, NULL);
      INSERT INTO sessions VALUES ('s1', '2025-01-01T00:00:00.000Z', '2999-01-01T00:00:00.000Z', 'c2');
      INSERT INTO sessions VALUES ('s0', '2025-01-01T00:00:00.000Z', '2999-01-01T00:00:00.000Z', NULL);
    `);
    old.close();

    const store = new Store(path);
    const users = store.listUsers();
    assert.deepEqual(
      users.map((u) => [u.username, u.display_name, u.invited_by, u.passkeys.map((p) => p.id), u.password_2fa]),
      [
        ['first-passkey', 'first passkey', null, ['c1'], false],
        ['Alex', 'Alex', 'first passkey', ['c2'], false],
        ['alex-2', 'alex', 'first passkey', ['c3'], false],
        ['passkey', 'passkey', null, ['c4'], false],
      ],
    );
    assert.equal(users[1].created_at, '2025-02-01T00:00:00.000Z');
    assert.equal(store.sessionUser('s1'), users[1].id, 'sessions get the user of their passkey');
    assert.equal(store.sessionUser('s0'), null);
    assert.equal(store.signInUserCount(), 4);
    store.close();
    // Opening again changes nothing.
    const again = new Store(path);
    assert.equal(again.listUsers().length, 4);
    again.close();
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});
