import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';
import { hashToken } from '../src/auth.ts';
import { fixture, makeApp, postText, post, sampleReport } from './helpers.ts';
import type { AppDeps } from '../src/app.ts';

const H = { 'x-crashreports-csrf': '1', 'content-type': 'application/json' };
const DAY = 86_400_000;

function setup(deps: Partial<AppDeps> = {}) {
  let clock = Date.now();
  const ctx = makeApp({}, { now: () => clock, ...deps });
  const userId = ctx.store.createUser({ username: 'alex' });
  ctx.store.createSession(hashToken('alex-session'), new Date(Date.now() + 3600_000), null, userId);
  const cookie = 'cr_session=alex-session';
  const call = (method: string, path: string, body?: unknown, extra: Record<string, string> = {}) =>
    ctx.app.request(path, { method, headers: { ...H, ...extra }, body: body === undefined ? undefined : JSON.stringify(body) });
  const asUser = (method: string, path: string, body?: unknown) => call(method, path, body, { cookie });
  const createToken = async (body: unknown = { name: 'Laptop – Claude Code' }) => {
    const r = await asUser('POST', '/api/admin/tokens', body);
    assert.equal(r.status, 201);
    return (await r.json()) as {
      id: string; token: string; prefix: string; name: string; expires_at: string | null; mcp_url: string;
      setups: { id: string; code: string }[];
    };
  };
  const mcp = (token: string | null, body: unknown = { jsonrpc: '2.0', id: 1, method: 'tools/list' }) =>
    ctx.app.request('/mcp', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        accept: 'application/json, text/event-stream',
        ...(token ? { authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(body),
    });
  /** An SDK client that talks Streamable HTTP to the app in-process. */
  const connect = async (token: string) => {
    const client = new Client({ name: 'test', version: '1.0.0' });
    const transport = new StreamableHTTPClientTransport(new URL('http://localhost:8787/mcp'), {
      requestInit: { headers: { authorization: `Bearer ${token}` } },
      fetch: async (url, init) => ctx.app.request(String(url), init as RequestInit),
    });
    await client.connect(transport);
    return client;
  };
  return { ...ctx, userId, cookie, call, asUser, createToken, mcp, connect, advance: (ms: number) => (clock += ms) };
}

const text = (r: unknown) => JSON.parse(((r as { content: { text: string }[] }).content[0]).text);

test('token lifecycle: created once, stored only as hash, listed, revoked', async () => {
  const t = setup();
  const created = await t.createToken({ name: 'Laptop – Claude Code', expires_in_days: 30 });
  assert.match(created.token, /^mcr_[A-Za-z0-9_-]{43}$/);
  assert.equal(created.prefix, created.token.slice(0, 8));
  assert.equal(created.mcp_url, 'http://localhost:8787/mcp');
  assert.ok(Math.abs(new Date(created.expires_at!).getTime() - Date.now() - 30 * DAY) < 60_000);
  // Setup blocks carry the real token.
  assert.deepEqual(created.setups.map((s) => s.id), ['claude-code', 'claude-desktop', 'claude-desktop-config', 'pi', 'other']);
  assert.ok(created.setups[0].code.includes(`claude mcp add --transport http mumcord-crashes http://localhost:8787/mcp --header "Authorization: Bearer ${created.token}"`));
  assert.ok(created.setups.every((s) => s.code.includes(created.token)));

  // Only the hash is stored, never the token.
  const row = t.store.db.prepare('SELECT * FROM api_tokens WHERE id = ?').get(created.id) as Record<string, unknown>;
  assert.equal(row.token_hash, hashToken(created.token));
  assert.ok(!Object.values(row).some((v) => typeof v === 'string' && v.includes(created.token)));

  // The list never shows it again.
  const list = await t.asUser('GET', '/api/admin/tokens');
  const body = await list.text();
  assert.ok(!body.includes(created.token));
  const { tokens } = JSON.parse(body) as { tokens: { id: string; name: string; prefix: string; last_used_at: string | null }[] };
  assert.deepEqual(tokens.map((x) => [x.name, x.prefix, x.last_used_at]), [['Laptop – Claude Code', created.prefix, null]]);

  // Use sets last_used_at, throttled to once a minute.
  assert.equal((await t.mcp(created.token)).status, 200);
  const first = t.store.getApiToken(created.id)!.last_used_at;
  assert.ok(first);
  t.advance(30_000);
  await t.mcp(created.token);
  assert.equal(t.store.getApiToken(created.id)!.last_used_at, first);
  t.advance(31_000);
  await t.mcp(created.token);
  assert.notEqual(t.store.getApiToken(created.id)!.last_used_at, first);

  // Revoke: gone from the list, and /mcp answers 401.
  assert.equal((await t.asUser('DELETE', `/api/admin/tokens/${created.id}`)).status, 200);
  assert.equal((await t.asUser('DELETE', `/api/admin/tokens/${created.id}`)).status, 404);
  assert.deepEqual(((await (await t.asUser('GET', '/api/admin/tokens')).json()) as { tokens: unknown[] }).tokens, []);
  const r = await t.mcp(created.token);
  assert.equal(r.status, 401);
  assert.match(r.headers.get('www-authenticate') ?? '', /^Bearer /);
});

test('token creation validates name and expiry; default 90 days; never expires', async () => {
  const t = setup();
  assert.equal((await t.asUser('POST', '/api/admin/tokens', { name: '  ' })).status, 400);
  assert.equal((await t.asUser('POST', '/api/admin/tokens', {})).status, 400);
  assert.equal((await t.asUser('POST', '/api/admin/tokens', { name: 'x', expires_in_days: 7 })).status, 400);
  const def = await t.createToken({ name: 'default' });
  assert.ok(Math.abs(new Date(def.expires_at!).getTime() - Date.now() - 90 * DAY) < 60_000);
  const never = await t.createToken({ name: 'forever', expires_in_days: null });
  assert.equal(never.expires_at, null);
  t.advance(3650 * DAY);
  assert.equal((await t.mcp(never.token)).status, 200);
});

test('401 without a token, with a malformed, unknown, revoked or expired token', async () => {
  const t = setup();
  const none = await t.mcp(null);
  assert.equal(none.status, 401);
  assert.equal(none.headers.get('www-authenticate'), 'Bearer realm="mcp"');
  for (const bad of ['nope', `mcr_${'A'.repeat(43)}`]) {
    const r = await t.mcp(bad);
    assert.equal(r.status, 401);
    assert.match(r.headers.get('www-authenticate') ?? '', /error="invalid_token"/);
  }
  const expiring = await t.createToken({ name: 'short', expires_in_days: 30 });
  assert.equal((await t.mcp(expiring.token)).status, 200);
  t.advance(30 * DAY + 1000);
  assert.equal((await t.mcp(expiring.token)).status, 401);
  // Expired tokens drop out of the list.
  assert.deepEqual(((await (await t.asUser('GET', '/api/admin/tokens')).json()) as { tokens: unknown[] }).tokens, []);
});

test('deleting a user or resetting their sign-in revokes their tokens', async () => {
  const t = setup();
  // A second user who can sign in, so alex is not the last one.
  const other = t.store.createUser({ username: 'sam' });
  t.store.addCredential({ id: 'sam-cred', publicKey: new Uint8Array([1]), counter: 0, transports: [], name: 'Sam', userId: other });
  t.store.setPasswordAndTotp(t.userId, { passwordHash: 'x', totpSecretEnc: 'y', totpLastStep: 0, recoveryHashes: [] });
  const a = await t.createToken({ name: 'a' });
  assert.equal(t.store.clearPassword(t.userId), 'ok');
  assert.equal((await t.mcp(a.token)).status, 401);

  const sid = t.store.createUser({ username: 'kim' });
  const k = t.store.createApiToken({ userId: sid, name: 'k', tokenHash: hashToken(`mcr_${'k'.repeat(43)}`), prefix: 'mcr_kkkk', expiresAt: null });
  assert.equal((await t.mcp(`mcr_${'k'.repeat(43)}`)).status, 200);
  assert.equal(t.store.deleteUser(sid), 'ok');
  assert.ok(t.store.getApiToken(k.id)!.revoked_at);
  assert.equal((await t.mcp(`mcr_${'k'.repeat(43)}`)).status, 401);
});

test('a token cannot reach the admin API or token management; those need a session and CSRF', async () => {
  const t = setup();
  const { token } = await t.createToken();
  const bearer = { authorization: `Bearer ${token}` };
  for (const [m, p] of [['GET', '/api/admin/groups'], ['GET', '/api/admin/config'], ['GET', '/api/admin/users'], ['GET', '/api/admin/tokens'], ['POST', '/api/admin/tokens'], ['DELETE', '/api/admin/tokens/x']]) {
    assert.equal((await t.call(m, p, m === 'POST' ? { name: 'x' } : undefined, bearer)).status, 401, `${m} ${p}`);
    assert.equal((await t.call(m, p, m === 'POST' ? { name: 'x' } : undefined)).status, 401, `${m} ${p} without session`);
  }
  // Session without the CSRF header cannot create tokens.
  const r = await t.app.request('/api/admin/tokens', { method: 'POST', headers: { cookie: t.cookie, 'content-type': 'application/json' }, body: '{"name":"x"}' });
  assert.equal(r.status, 403);
  // A session from before users existed cannot hold tokens.
  t.store.createSession(hashToken('legacy'), new Date(Date.now() + 3600_000));
  assert.equal((await t.call('POST', '/api/admin/tokens', { name: 'x' }, { cookie: 'cr_session=legacy' })).status, 400);
  // Tokens are personal: another user cannot revoke them.
  const { id } = await t.createToken({ name: 'mine' });
  const sam = t.store.createUser({ username: 'sam' });
  t.store.createSession(hashToken('sam-session'), new Date(Date.now() + 3600_000), null, sam);
  assert.equal((await t.call('DELETE', `/api/admin/tokens/${id}`, undefined, { cookie: 'cr_session=sam-session' })).status, 404);
});

test('GET and DELETE on /mcp are 405; rate limit per token', async () => {
  const t = setup();
  const { token } = await t.createToken();
  for (const method of ['GET', 'DELETE']) {
    const r = await t.app.request('/mcp', { method, headers: { authorization: `Bearer ${token}` } });
    assert.equal(r.status, 405);
    assert.equal(r.headers.get('allow'), 'POST');
  }
  // A fresh app with a small limit.
  const small = makeApp({ mcpRateLimitPerMinute: 2 });
  const uid = small.store.createUser({ username: 'lim' });
  const tok = `mcr_${'L'.repeat(43)}`;
  small.store.createApiToken({ userId: uid, name: 'l', tokenHash: hashToken(tok), prefix: tok.slice(0, 8), expiresAt: null });
  const req = () =>
    small.app.request('/mcp', {
      method: 'POST',
      headers: { authorization: `Bearer ${tok}`, 'content-type': 'application/json', accept: 'application/json, text/event-stream' },
      body: JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'tools/list' }),
    });
  assert.equal((await req()).status, 200);
  assert.equal((await req()).status, 200);
  const r = await req();
  assert.equal(r.status, 429);
  assert.ok(r.headers.get('retry-after'));
});

test('MCP round-trip with the SDK client: tools/list and every tool', async () => {
  const t = setup();
  assert.equal((await postText(t.app, fixture('panic'))).status, 201);
  assert.equal((await postText(t.app, fixture('sigsegv'))).status, 201);
  assert.equal((await post(t.app, sampleReport({ log_tail: 'LOG LINE', user_note: 'NOTE' }))).status, 201);
  const { token } = await t.createToken();
  const client = await t.connect(token);
  try {
    const { tools } = await client.listTools();
    assert.deepEqual(tools.map((x) => x.name).sort(), ['crash_stats', 'get_crash_group', 'get_crash_report', 'list_crash_groups']);
    assert.ok(tools.every((x) => x.description && x.annotations?.readOnlyHint === true));

    const list = text(await client.callTool({ name: 'list_crash_groups', arguments: {} }));
    assert.equal(list.count, 3);
    const panic = list.groups.find((g: { versions: string[]; kind: string }) => g.versions.includes('0.7.0') && g.kind === 'panic');
    assert.ok(panic && panic.title && panic.url.startsWith('http://localhost:8787/#/groups/'));
    assert.equal(text(await client.callTool({ name: 'list_crash_groups', arguments: { version: '0.7.0' } })).count, 1);
    assert.equal(text(await client.callTool({ name: 'list_crash_groups', arguments: { kind: 'signal' } })).count, 1);
    assert.equal(text(await client.callTool({ name: 'list_crash_groups', arguments: { status: 'fixed' } })).count, 0);
    assert.equal(text(await client.callTool({ name: 'list_crash_groups', arguments: { since: '2999-01-01' } })).count, 0);
    assert.equal(text(await client.callTool({ name: 'list_crash_groups', arguments: { limit: 1 } })).count, 1);
    const tooMany = await client.callTool({ name: 'list_crash_groups', arguments: { limit: 101 } });
    assert.equal(tooMany.isError, true);

    const group = text(await client.callTool({ name: 'get_crash_group', arguments: { id: panic.id } }));
    assert.equal(group.id, panic.id);
    assert.ok(Array.isArray(group.top_frames));
    assert.equal(group.latest_reports.length, 1);
    assert.equal(group.latest_reports[0].raw, undefined);
    assert.equal(group.latest_reports[0].log_tail, undefined);

    const reportId = group.latest_reports[0].id;
    const plain = text(await client.callTool({ name: 'get_crash_report', arguments: { id: reportId } }));
    assert.equal(plain.id, reportId);
    assert.ok(!('raw' in plain) && !('log_tail' in plain) && !('user_note' in plain));
    const withLogs = text(await client.callTool({ name: 'get_crash_report', arguments: { id: reportId, include_logs: true } }));
    assert.equal(withLogs.log_tail, 'LOG LINE');
    assert.equal(withLogs.user_note, 'NOTE');
    assert.ok(!('raw' in withLogs));

    // include_raw on a text upload returns the file.
    const sig = list.groups.find((g: { kind: string }) => g.kind.startsWith('signal'));
    const sigReport = text(await client.callTool({ name: 'get_crash_group', arguments: { id: sig.id } })).latest_reports[0].id;
    assert.ok(!('raw' in text(await client.callTool({ name: 'get_crash_report', arguments: { id: sigReport } }))));
    const raw = text(await client.callTool({ name: 'get_crash_report', arguments: { id: sigReport, include_raw: true } }));
    assert.match(raw.raw, /^Mumcord crash report/);

    const stats = text(await client.callTool({ name: 'crash_stats', arguments: {} }));
    assert.equal(stats.days, 30);
    assert.equal(stats.reports, 3);
    assert.equal(stats.per_day.reduce((n: number, d: { reports: number }) => n + d.reports, 0), 3);
    assert.equal(stats.top_groups.length, 3);
    assert.ok(stats.per_os.length >= 1 && stats.per_version.length >= 1 && stats.per_component[0].component === '(not analyzed)');

    const missing = await client.callTool({ name: 'get_crash_group', arguments: { id: 'nope' } });
    assert.equal(missing.isError, true);
    const missingReport = await client.callTool({ name: 'get_crash_report', arguments: { id: 'nope' } });
    assert.equal(missingReport.isError, true);
  } finally {
    await client.close();
  }
});

test('/help/mcp is public, shows the placeholders and the ORIGIN, and the nav links to it', async () => {
  const t = setup();
  const r = await t.app.request('/help/mcp');
  assert.equal(r.status, 200);
  const html = await r.text();
  assert.ok(html.includes('claude mcp add --transport http mumcord-crashes http://localhost:8787/mcp --header &quot;Authorization: Bearer &lt;token&gt;&quot;'));
  assert.ok(html.includes('mcp-remote') && html.includes('pi.dev/docs/latest/mcp'));
  assert.ok(!html.includes('mcr_') || html.includes('mcr_…'));
  const index = await (await t.app.request('/')).text();
  assert.ok(index.includes('href="/help/mcp"'));
});
