import { test } from 'node:test';
import assert from 'node:assert/strict';
import { adminCookie, makeApp } from './helpers.ts';

const adminRoutes: [string, string][] = [
  ['GET', '/api/admin/config'],
  ['GET', '/api/admin/groups'],
  ['GET', '/api/admin/groups/x'],
  ['PATCH', '/api/admin/groups/x'],
  ['DELETE', '/api/admin/groups/x'],
  ['DELETE', '/api/admin/reports/x'],
  ['POST', '/api/admin/groups/x/issue'],
  ['POST', '/api/admin/groups/x/analyze'],
  ['GET', '/api/admin/credentials'],
];

test('admin routes return 401 without a session or with a bad one', async () => {
  const { app } = makeApp();
  for (const [method, path] of adminRoutes) {
    const r1 = await app.request(path, { method, headers: { 'x-crashreports-csrf': '1' } });
    assert.equal(r1.status, 401, `${method} ${path}`);
    const r2 = await app.request(path, { method, headers: { 'x-crashreports-csrf': '1', cookie: 'cr_session=forged' } });
    assert.equal(r2.status, 401, `${method} ${path} forged`);
  }
});

test('expired sessions are rejected', async () => {
  const { app, store } = makeApp();
  store.createSession((await import('../src/auth.ts')).hashToken('old'), new Date(Date.now() - 1000));
  assert.equal((await app.request('/api/admin/groups', { headers: { cookie: 'cr_session=old' } })).status, 401);
});

test('a valid session passes; state-changing requests need the CSRF header and same origin', async () => {
  const { app, store } = makeApp();
  const cookie = adminCookie(store);
  assert.equal((await app.request('/api/admin/groups', { headers: { cookie } })).status, 200);
  const patch = (headers: Record<string, string>) =>
    app.request('/api/admin/groups/x', { method: 'PATCH', headers: { cookie, 'content-type': 'application/json', ...headers }, body: '{"status":"fixed"}' });
  assert.equal((await patch({})).status, 403);
  assert.equal((await patch({ 'x-crashreports-csrf': '1', origin: 'https://evil.example' })).status, 403);
  assert.equal((await patch({ 'x-crashreports-csrf': '1', origin: 'http://localhost:8787' })).status, 404);
});

test('setup page and first registration need the setup token', async () => {
  const { app } = makeApp();
  assert.equal((await app.request('/setup')).status, 403);
  assert.equal((await app.request('/setup?token=wrong')).status, 403);
  assert.equal((await app.request('/setup?token=setup-secret')).status, 200);
  const opts = (token: string) =>
    app.request('/api/auth/register/options', { method: 'POST', headers: { 'x-crashreports-csrf': '1', 'content-type': 'application/json' }, body: JSON.stringify({ setup_token: token }) });
  assert.equal((await opts('wrong')).status, 403);
  const ok = await opts('setup-secret');
  assert.equal(ok.status, 200);
  const json = await ok.json();
  assert.equal(json.rp.id, 'localhost');
  assert.equal(json.authenticatorSelection.residentKey, 'required');
});

test('once a passkey exists, the setup token no longer allows registration', async () => {
  const { app, store } = makeApp();
  store.addCredential({ id: 'cred1', publicKey: new Uint8Array([1]), counter: 0, transports: [], name: '' });
  const r = await app.request('/api/auth/register/options', { method: 'POST', headers: { 'x-crashreports-csrf': '1' }, body: JSON.stringify({ setup_token: 'setup-secret' }) });
  assert.equal(r.status, 403);
  assert.equal((await app.request('/setup?token=setup-secret')).status, 302);
});

test('session cookie flags', async () => {
  // startSession is exercised end to end in the browser test; here we check logout clears the cookie
  const { app, store } = makeApp();
  const cookie = adminCookie(store);
  const r = await app.request('/api/auth/logout', { method: 'POST', headers: { cookie, 'x-crashreports-csrf': '1' } });
  assert.equal(r.status, 200);
  assert.match(r.headers.get('set-cookie') ?? '', /cr_session=;/);
  assert.equal((await app.request('/api/admin/groups', { headers: { cookie } })).status, 401);
});
