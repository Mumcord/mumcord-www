import { test } from 'node:test';
import assert from 'node:assert/strict';
import { fixture, makeApp, post, postText, sampleReport } from './helpers.ts';
import { validateReport } from '../src/validate.ts';

test('validateReport rejects bad input strictly', () => {
  assert.equal(validateReport(sampleReport()).ok, true);
  const cases: [unknown, RegExp][] = [
    [[], /JSON object/],
    [{ ...sampleReport(), extra: 1 }, /unknown field: extra/],
    [{ ...sampleReport(), kind: 'oops' }, /kind must be one of/],
    [{ ...sampleReport(), message: '' }, /message must not be empty/],
    [{ ...sampleReport(), app_version: '1.0; rm -rf' }, /app_version has invalid/],
    [{ ...sampleReport(), backtrace: 5 }, /backtrace must be a string/],
    [{ ...sampleReport(), user_note: 'x'.repeat(2001) }, /user_note is longer/],
    [(({ os, ...r }) => r)(sampleReport()), /os is required/],
  ];
  for (const [body, re] of cases) {
    const v = validateReport(body);
    assert.equal(v.ok, false);
    if (!v.ok) assert.match(v.errors.join('; '), re);
  }
});

test('text ingest: the crash files are stored as-is and grouped', async () => {
  const { app, store } = makeApp();
  const panic = fixture('panic');
  const r1 = await postText(app, panic);
  assert.equal(r1.status, 201);
  const a = await r1.json();
  const b = await (await postText(app, panic.replace('version: 0.7.1', 'version: 0.7.2').replace(/crash_demo\.rs:17/g, 'crash_demo.rs:18'))).json();
  const c = await (await postText(app, fixture('sigsegv'))).json();
  assert.equal(a.group, b.group);
  assert.notEqual(a.group, c.group);
  const g = store.getGroup(a.group)!;
  assert.equal(g.count, 2);
  assert.equal(g.kind, 'panic');
  assert.deepEqual(g.versions, ['0.7.1', '0.7.2']);
  assert.deepEqual(g.os_list, ['linux x86_64 (CachyOS 7.3.0-4-cachyos)']);
  const sig = store.getGroup(c.group)!;
  assert.equal(sig.kind, 'signal SIGSEGV');
  assert.equal(sig.weak, true);
  const [rep] = store.latestReports(c.group);
  assert.equal(rep.raw, fixture('sigsegv'));
  assert.equal(rep.running.camera, 'on air');
  assert.equal(rep.system.kernel, '7.3.0-4-cachyos');
  assert.equal((await postText(app, 'not a crash report')).status, 400);
  assert.equal((await postText(app, 'Mumcord crash report\nversion: 1\nkind: panic\n' + 'x'.repeat(300 * 1024))).status, 413);
});

test('JSON ingest stores reports and groups by fingerprint', async () => {
  const { app, store } = makeApp();
  const r1 = await (await post(app, sampleReport())).json();
  const r2 = await (await post(app, sampleReport({ app_version: '0.7.1', message: sampleReport().message.replace('7', '8'), os: 'windows', os_version: '11' }))).json();
  const r3 = await (await post(app, sampleReport({ kind: 'hang', message: 'UI thread blocked', backtrace: '' }))).json();
  assert.equal(r1.group, r2.group);
  assert.notEqual(r1.group, r3.group);
  const g = store.getGroup(r1.group)!;
  assert.equal(g.count, 2);
  assert.deepEqual(g.versions, ['0.7.0', '0.7.1']);
  assert.deepEqual(g.os_list, ['linux x86_64 (Arch 6.9)', 'windows x86_64 (11)']);
  assert.equal(store.latestReports(r1.group).length, 2);
  // no IP column anywhere
  const cols = store.db.prepare(`SELECT name FROM pragma_table_info('reports')`).all().map((r) => r.name);
  assert.ok(!cols.some((c) => /ip|addr/i.test(String(c))));
});

test('ingest rejects invalid JSON, wrong content type and oversized bodies', async () => {
  const { app } = makeApp();
  assert.equal((await post(app, '{nope')).status, 400);
  assert.equal((await app.request('/api/v1/reports', { method: 'POST', body: '{}', headers: { 'content-type': 'application/xml' } })).status, 415);
  const big = sampleReport({ log_tail: 'x'.repeat(300 * 1024) });
  assert.equal((await post(app, big)).status, 413);
  const res = await post(app, { ...sampleReport(), kind: 'nope' });
  assert.equal(res.status, 400);
  assert.match(JSON.stringify(await res.json()), /kind must be one of/);
});

test('ingest is rate limited per IP', async () => {
  const { app } = makeApp({ rateLimitPerMinute: 3 });
  const statuses = [];
  for (let i = 0; i < 5; i++) statuses.push((await postText(app, fixture('panic'), { 'x-test-ip': 'a' })).status);
  assert.deepEqual(statuses, [201, 201, 201, 429, 429]);
  assert.equal((await post(app, sampleReport(), { 'x-test-ip': 'b' })).status, 201);
  const limited = await post(app, sampleReport(), { 'x-test-ip': 'a' });
  assert.ok(Number(limited.headers.get('retry-after')) > 0);
});
