import { test } from 'node:test';
import assert from 'node:assert/strict';
import { DatabaseSync } from 'node:sqlite';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { hashToken, type WebAuthnVerifier } from '../src/auth.ts';
import { Store } from '../src/db.ts';
import { adminCookie, makeApp } from './helpers.ts';

/**
 * Stands in for a real authenticator: the "response" names the challenge it signs and the
 * credential id it creates; the challenge check of the route still runs.
 */
const fakeWebAuthn: WebAuthnVerifier = {
  verifyRegistrationResponse: (async (opts: { response: { id: string; challenge: string }; expectedChallenge: unknown }) => {
    const check = opts.expectedChallenge as (c: string) => boolean;
    if (!check(opts.response.challenge)) throw new Error('unexpected challenge');
    return {
      verified: true,
      registrationInfo: { credential: { id: opts.response.id, publicKey: new Uint8Array([1, 2, 3]), counter: 0, transports: ['internal'] } },
    };
  }) as unknown as WebAuthnVerifier['verifyRegistrationResponse'],
  verifyAuthenticationResponse: (async (opts: { response: { challenge: string }; expectedChallenge: unknown }) => {
    const check = opts.expectedChallenge as (c: string) => boolean;
    if (!check(opts.response.challenge)) throw new Error('unexpected challenge');
    return { verified: true, authenticationInfo: { newCounter: 1 } };
  }) as unknown as WebAuthnVerifier['verifyAuthenticationResponse'],
};

const H = { 'x-crashreports-csrf': '1', 'content-type': 'application/json' };

function setup() {
  const ctx = makeApp({}, { webauthn: fakeWebAuthn });
  // An admin with a passkey and a session opened with it.
  ctx.store.addCredential({ id: 'admin-cred', publicKey: new Uint8Array([9]), counter: 0, transports: [], name: 'Admin laptop' });
  ctx.store.createSession(hashToken('admin-token'), new Date(Date.now() + 3600_000), 'admin-cred');
  const cookie = 'cr_session=admin-token';
  const call = (method: string, path: string, body?: unknown, extra: Record<string, string> = {}) =>
    ctx.app.request(path, { method, headers: { ...H, ...extra }, body: body === undefined ? undefined : JSON.stringify(body) });
  const asAdmin = (method: string, path: string, body?: unknown) => call(method, path, body, { cookie });
  const createInvite = async (body: unknown = { label: 'Alex' }) => {
    const r = await asAdmin('POST', '/api/admin/invites', body);
    assert.equal(r.status, 201);
    const j = (await r.json()) as { id: string; url: string; expires_at: string };
    return { ...j, token: j.url.split('#')[1] };
  };
  /** Runs the invite registration; returns the verify response. */
  const redeem = async (token: string, credId: string, name = '') => {
    const o = await call('POST', '/api/auth/invite/register/options', { invite_token: token });
    if (o.status !== 200) return o;
    const { challenge } = (await o.json()) as { challenge: string };
    return call('POST', '/api/auth/invite/register/verify', { invite_token: token, name, response: { id: credId, challenge } });
  };
  return { ...ctx, cookie, call, asAdmin, createInvite, redeem };
}

test('create invite, register through it, and the token works only once', async () => {
  const t = setup();
  const inv = await t.createInvite({ label: 'Alex', ttl_hours: 24 });
  assert.match(inv.url, /^http:\/\/localhost:8787\/invite#[A-Za-z0-9_-]{43}$/);
  const expiresIn = new Date(inv.expires_at).getTime() - Date.now();
  assert.ok(expiresIn > 23.9 * 3600_000 && expiresIn <= 24 * 3600_000);

  // Only the hash is stored.
  const row = t.store.db.prepare('SELECT * FROM invites').get() as Record<string, unknown>;
  assert.equal(row.token_hash, hashToken(inv.token));
  assert.ok(!JSON.stringify(row).includes(inv.token));
  assert.equal(row.created_by_credential, 'admin-cred');
  assert.equal(row.created_by_session, hashToken('admin-token'));

  const info = await t.call('POST', '/api/auth/invite/info', { invite_token: inv.token });
  assert.deepEqual(await info.json(), { label: 'Alex' });

  const v = await t.redeem(inv.token, 'alex-cred');
  assert.equal(v.status, 200);
  const setCookie = v.headers.get('set-cookie') ?? '';
  assert.match(setCookie, /cr_session=[^;]+;.*HttpOnly/);
  const session = /cr_session=([^;]+)/.exec(setCookie)![1];
  assert.equal(t.store.sessionCredential(hashToken(session)), 'alex-cred');
  assert.equal((await t.app.request('/api/admin/groups', { headers: { cookie: `cr_session=${session}` } })).status, 200);

  const cred = t.store.getCredential('alex-cred')!;
  assert.equal(cred.name, 'Alex', 'the name defaults to the label');
  assert.equal(cred.invited_by, 'Admin laptop');
  const inviteRow = t.store.db.prepare('SELECT used_at, credential_id FROM invites').get() as Record<string, unknown>;
  assert.ok(inviteRow.used_at);
  assert.equal(inviteRow.credential_id, 'alex-cred');

  // Second use: options and verify both refuse.
  const again = await t.call('POST', '/api/auth/invite/register/options', { invite_token: inv.token });
  assert.equal(again.status, 410);
  assert.equal(((await again.json()) as { code: string }).code, 'used');
  const o = await t.call('POST', '/api/auth/invite/register/options', { invite_token: (await t.createInvite()).token });
  const { challenge } = (await o.json()) as { challenge: string };
  const replay = await t.call('POST', '/api/auth/invite/register/verify', { invite_token: inv.token, response: { id: 'eve-cred', challenge } });
  assert.equal(replay.status, 410);
  assert.equal(t.store.getCredential('eve-cred'), null);
  assert.equal(t.store.credentialCount(), 2);

  // The list shows who invited whom.
  const list = (await (await t.asAdmin('GET', '/api/admin/credentials')).json()) as { id: string; invited_by: string | null; current: boolean }[];
  assert.deepEqual(list.map((c) => [c.id, c.invited_by, c.current]), [['admin-cred', null, true], ['alex-cred', 'Admin laptop', false]]);
  const invites = (await (await t.asAdmin('GET', '/api/admin/invites')).json()) as { state: string; credential_name: string | null }[];
  assert.deepEqual(invites.map((i) => i.state).sort(), ['open', 'used']);
  assert.equal(invites.find((i) => i.state === 'used')!.credential_name, 'Alex');
});

test('an expired invite is rejected and purged by the retention job', async () => {
  const t = setup();
  const inv = await t.createInvite({ ttl_hours: 1 });
  t.store.db.prepare('UPDATE invites SET expires_at = ?').run(new Date(Date.now() - 1000).toISOString());
  const r = await t.redeem(inv.token, 'late-cred');
  assert.equal(r.status, 410);
  assert.equal(((await r.json()) as { code: string }).code, 'expired');
  assert.equal(t.store.getCredential('late-cred'), null);
  const listed = (await (await t.asAdmin('GET', '/api/admin/invites')).json()) as { state: string }[];
  assert.equal(listed[0].state, 'expired');
  assert.equal(t.store.prune(new Date(0)).invites, 1);
  assert.equal((t.store.db.prepare('SELECT COUNT(*) AS n FROM invites').get() as { n: number }).n, 0);
});

test('an invite that expires between options and verify is rejected', async () => {
  const t = setup();
  const inv = await t.createInvite();
  const o = await t.call('POST', '/api/auth/invite/register/options', { invite_token: inv.token });
  const { challenge } = (await o.json()) as { challenge: string };
  t.store.db.prepare('UPDATE invites SET expires_at = ?').run(new Date(Date.now() - 1000).toISOString());
  const v = await t.call('POST', '/api/auth/invite/register/verify', { invite_token: inv.token, response: { id: 'x', challenge } });
  assert.equal(v.status, 410);
  assert.equal(t.store.credentialCount(), 1);
});

test('a revoked invite is rejected', async () => {
  const t = setup();
  const inv = await t.createInvite();
  assert.equal((await t.asAdmin('DELETE', `/api/admin/invites/${inv.id}`)).status, 200);
  assert.equal((await t.asAdmin('DELETE', `/api/admin/invites/${inv.id}`)).status, 404, 'already revoked');
  const r = await t.redeem(inv.token, 'rev-cred');
  assert.equal(r.status, 410);
  assert.equal(((await r.json()) as { code: string }).code, 'revoked');
  assert.equal(t.store.getCredential('rev-cred'), null);
});

test('unknown or malformed invite tokens are rejected', async () => {
  const t = setup();
  for (const token of ['x'.repeat(43), 'short', 42, undefined]) {
    const r = await t.call('POST', '/api/auth/invite/info', { invite_token: token });
    assert.equal(r.status, 404);
    assert.equal(((await r.json()) as { code: string }).code, 'invalid');
  }
});

test('invite validity must be 1 h, 24 h or 7 days; 24 h is the default', async () => {
  const t = setup();
  assert.equal((await t.asAdmin('POST', '/api/admin/invites', { ttl_hours: 5 })).status, 400);
  const week = await t.createInvite({ ttl_hours: 168 });
  assert.ok(new Date(week.expires_at).getTime() - Date.now() > 167 * 3600_000);
  const def = await t.createInvite({});
  const ms = new Date(def.expires_at).getTime() - Date.now();
  assert.ok(ms > 23 * 3600_000 && ms <= 24 * 3600_000);
});

test('the last passkey cannot be deleted', async () => {
  const t = setup();
  const r = await t.asAdmin('DELETE', '/api/admin/credentials/admin-cred');
  assert.equal(r.status, 400);
  assert.ok(t.store.getCredential('admin-cred'));
  assert.equal(t.store.deleteCredential('admin-cred'), 'last');
  assert.equal((await t.asAdmin('DELETE', '/api/admin/credentials/nope')).status, 404);
});

test('deleting a passkey ends its sessions', async () => {
  const t = setup();
  await t.redeem((await t.createInvite()).token, 'alex-cred');
  t.store.createSession(hashToken('alex-token'), new Date(Date.now() + 3600_000), 'alex-cred');
  const alex = { cookie: 'cr_session=alex-token' };
  assert.equal((await t.app.request('/api/admin/groups', { headers: alex })).status, 200);

  const r = await t.asAdmin('DELETE', '/api/admin/credentials/alex-cred');
  assert.equal(r.status, 200);
  assert.deepEqual(await r.json(), { ok: true, self: false });
  assert.equal((await t.app.request('/api/admin/groups', { headers: alex })).status, 401);
  assert.equal((t.store.db.prepare("SELECT COUNT(*) AS n FROM sessions WHERE credential_id = 'alex-cred'").get() as { n: number }).n, 0);
  assert.equal((await t.asAdmin('GET', '/api/admin/groups')).status, 200, 'other sessions stay');
});

test('deleting your own passkey ends your session', async () => {
  const t = setup();
  await t.redeem((await t.createInvite()).token, 'alex-cred');
  const r = await t.asAdmin('DELETE', '/api/admin/credentials/admin-cred');
  assert.deepEqual(await r.json(), { ok: true, self: true });
  assert.match(r.headers.get('set-cookie') ?? '', /cr_session=;/);
  assert.equal((await t.asAdmin('GET', '/api/admin/groups')).status, 401);
});

test('login records last_used_at and ties the session to the passkey', async () => {
  const t = setup();
  assert.equal(t.store.getCredential('admin-cred')!.last_used_at, null);
  const o = await t.call('POST', '/api/auth/login/options', {});
  const { challenge } = (await o.json()) as { challenge: string };
  const v = await t.call('POST', '/api/auth/login/verify', { response: { id: 'admin-cred', challenge } });
  assert.equal(v.status, 200);
  assert.ok(t.store.getCredential('admin-cred')!.last_used_at);
  const session = /cr_session=([^;]+)/.exec(v.headers.get('set-cookie') ?? '')![1];
  assert.equal(t.store.sessionCredential(hashToken(session)), 'admin-cred');
});

test('invite admin routes give 401 without a session and need the CSRF header', async () => {
  const t = setup();
  const routes: [string, string][] = [
    ['GET', '/api/admin/invites'],
    ['POST', '/api/admin/invites'],
    ['DELETE', '/api/admin/invites/x'],
    ['GET', '/api/admin/credentials'],
    ['DELETE', '/api/admin/credentials/admin-cred'],
  ];
  for (const [method, path] of routes) {
    assert.equal((await t.call(method, path, method === 'GET' ? undefined : {})).status, 401, `${method} ${path}`);
    assert.equal((await t.call(method, path, method === 'GET' ? undefined : {}, { cookie: 'cr_session=forged' })).status, 401, `${method} ${path} forged`);
  }
  const noCsrf = await t.app.request('/api/admin/invites', { method: 'POST', headers: { cookie: t.cookie, 'content-type': 'application/json' }, body: '{}' });
  assert.equal(noCsrf.status, 403);
  const noCsrfRedeem = await t.app.request('/api/auth/invite/info', { method: 'POST', headers: { 'content-type': 'application/json' }, body: '{}' });
  assert.equal(noCsrfRedeem.status, 403);
  assert.equal(t.store.credentialCount(), 1);
});

test('invite endpoints and the invite page are rate limited', async () => {
  const t = setup();
  assert.equal((await t.app.request('/invite')).status, 200);
  let last = 0;
  for (let i = 0; i < 12; i++) last = (await t.call('POST', '/api/auth/invite/info', { invite_token: 'x'.repeat(43) })).status;
  assert.equal(last, 429);
  assert.equal((await t.app.request('/invite')).status, 429);
  // Another client is not affected.
  assert.equal((await t.call('POST', '/api/auth/invite/info', {}, { 'x-test-ip': 'other' })).status, 404);
});

test('an old database gets the new columns and keeps its data', () => {
  const dir = mkdtempSync(join(tmpdir(), 'crashreports-mig-'));
  const path = join(dir, 'old.db');
  try {
    const old = new DatabaseSync(path);
    old.exec(`
      CREATE TABLE credentials (id TEXT PRIMARY KEY, public_key BLOB NOT NULL, counter INTEGER NOT NULL,
        transports TEXT NOT NULL DEFAULT '[]', name TEXT NOT NULL DEFAULT '', created_at TEXT NOT NULL);
      CREATE TABLE sessions (token_hash TEXT PRIMARY KEY, created_at TEXT NOT NULL, expires_at TEXT NOT NULL);
      INSERT INTO credentials VALUES ('old-cred', x'01', 3, '[]', 'Old key', '2025-01-01T00:00:00.000Z');
      INSERT INTO sessions VALUES ('old-session', '2025-01-01T00:00:00.000Z', '2999-01-01T00:00:00.000Z');
    `);
    old.close();

    const store = new Store(path);
    const cols = (t: string) => (store.db.prepare(`PRAGMA table_info(${t})`).all() as { name: string }[]).map((c) => c.name);
    assert.ok(cols('credentials').includes('last_used_at'));
    assert.ok(cols('credentials').includes('invited_by'));
    assert.ok(cols('sessions').includes('credential_id'));
    assert.ok(cols('invites').includes('token_hash'));
    const cred = store.getCredential('old-cred')!;
    assert.equal(cred.name, 'Old key');
    assert.equal(cred.counter, 3);
    assert.equal(cred.last_used_at, null);
    assert.ok(store.sessionValid('old-session'));
    assert.equal(store.sessionCredential('old-session'), null);
    store.markCredentialUsed('old-cred', 4);
    assert.ok(store.getCredential('old-cred')!.last_used_at);
    store.close();
    // Opening again is a no-op.
    new Store(path).close();
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});
