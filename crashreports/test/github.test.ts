import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createHmac } from 'node:crypto';
import { makeApp } from './helpers.ts';
import { Store } from '../src/db.ts';
import { loadConfig } from '../src/config.ts';
import { cardMessage, MumbotNotifier } from '../src/mumbot.ts';
import { decide, verifySignature, type GhPayload } from '../src/githubhook.ts';
import {
  buildStatsCard,
  delta,
  GithubStats,
  localDate,
  nextRun,
  topGainers,
  zonedTime,
  type StatsSnapshot,
} from '../src/githubstats.ts';

const SECRET = 'test-webhook-secret';
const MUMBOT = 'http://mumbot:8080/message';
const quiet = { log() {}, warn() {} };

const sign = (body: string, secret = SECRET) => `sha256=${createHmac('sha256', secret).update(body).digest('hex')}`;

const issuePayload = (over: Record<string, unknown> = {}): GhPayload => ({
  action: 'opened',
  issue: {
    number: 42,
    title: '  Crash when joining a channel  ',
    html_url: 'https://github.com/Mumcord/mumcord/issues/42',
    user: { login: 'octocat', type: 'User' },
    labels: [{ name: 'bug' }, { name: 'audio' }],
  },
  repository: { full_name: 'Mumcord/mumcord', html_url: 'https://github.com/Mumcord/mumcord' },
  sender: { login: 'octocat', type: 'User' },
  ...over,
});

const prPayload = (pr: Record<string, unknown> = {}, action = 'opened'): GhPayload => ({
  action,
  pull_request: {
    number: 7,
    title: 'Add push to talk overlay',
    html_url: 'https://github.com/Mumcord/mumcord/pull/7',
    user: { login: 'octocat', type: 'User' },
    labels: [],
    draft: false,
    base: { ref: 'main' },
    head: { ref: 'ptt-overlay', label: 'octocat:ptt-overlay', repo: { full_name: 'Mumcord/mumcord' } },
    additions: 120,
    deletions: 8,
    ...pr,
  },
  repository: { full_name: 'Mumcord/mumcord' },
  sender: { login: 'octocat', type: 'User' },
});

function mumbotFetch() {
  const posts: any[] = [];
  const fn = (async (input: string | URL | Request, init?: RequestInit) => {
    const url = String(input);
    if (url === MUMBOT) {
      posts.push(JSON.parse(String(init?.body)));
      return new Response('{"delivered":true}', { status: 200 });
    }
    throw new Error(`unexpected fetch ${url}`);
  }) as typeof fetch;
  return { fn, posts };
}

function hookApp(over: Record<string, unknown> = {}) {
  const m = mumbotFetch();
  const githubMumbot = new MumbotNotifier({ url: MUMBOT, token: 'k3y', channel: '9', fetchFn: m.fn, log: quiet });
  const app = makeApp({ githubWebhookSecret: SECRET, ...over }, { githubMumbot });
  return { ...app, posts: m.posts };
}

function deliver(app: { request: (p: string, i: RequestInit) => Response | Promise<Response> }, event: string, payload: unknown, opts: { id?: string; sig?: string } = {}) {
  const body = JSON.stringify(payload);
  return app.request('/api/github/webhook', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-github-event': event,
      'x-github-delivery': opts.id ?? crypto.randomUUID(),
      'x-hub-signature-256': opts.sig ?? sign(body),
    },
    body,
  });
}

// ---------- signature ----------

test('signature: valid passes, wrong secret, tampered body and bad format fail', () => {
  const body = Buffer.from('{"zen":"hi"}');
  assert.equal(verifySignature(SECRET, body, sign('{"zen":"hi"}')), true);
  assert.equal(verifySignature(SECRET, body, sign('{"zen":"hi"}', 'other')), false);
  assert.equal(verifySignature(SECRET, Buffer.from('{"zen":"ho"}'), sign('{"zen":"hi"}')), false);
  assert.equal(verifySignature(SECRET, body, 'sha1=abc'), false);
  assert.equal(verifySignature(SECRET, body, undefined), false);
  assert.equal(verifySignature('', body, sign('{"zen":"hi"}', '')), false);
});

test('webhook: 404 without a secret, 401 on a bad signature, 200 on ping', async () => {
  const off = hookApp({ githubWebhookSecret: '' });
  assert.equal((await deliver(off.app, 'ping', { zen: 'x' })).status, 404);
  const { app } = hookApp();
  assert.equal((await deliver(app, 'ping', { zen: 'x' }, { sig: sign('{}') })).status, 401);
  assert.equal((await deliver(app, 'ping', { zen: 'x' }, { sig: '' })).status, 401);
  assert.equal((await deliver(app, 'ping', { zen: 'x' })).status, 200);
});

test('webhook: bodies over 1 MB are refused', async () => {
  const { app } = hookApp();
  const res = await deliver(app, 'issues', { pad: 'x'.repeat(1024 * 1024) });
  assert.equal(res.status, 413);
});

// ---------- filtering ----------

test('filter: opened issues and opened / ready PRs post, everything else is ignored', () => {
  assert.equal(decide('issues', issuePayload()).kind, 'post');
  assert.equal(decide('issues', issuePayload({ action: 'closed' })).kind, 'ignore');
  assert.equal(decide('issues', issuePayload({ action: 'edited' })).kind, 'ignore');
  assert.equal(decide('pull_request', prPayload()).kind, 'post');
  assert.equal(decide('pull_request', prPayload({}, 'ready_for_review')).kind, 'post');
  assert.equal(decide('pull_request', prPayload({}, 'synchronize')).kind, 'ignore');
  assert.equal(decide('pull_request', prPayload({}, 'closed')).kind, 'ignore');
  assert.equal(decide('push', {}).kind, 'ignore');
  assert.equal(decide('star', { action: 'created' }).kind, 'ignore');
  assert.equal(decide('ping', {}).kind, 'ping');
});

test('filter: draft PRs wait for ready_for_review', () => {
  assert.deepEqual(decide('pull_request', prPayload({ draft: true })), { kind: 'ignore', reason: 'draft' });
  assert.equal(decide('pull_request', prPayload({ draft: false }, 'ready_for_review')).kind, 'post');
});

test('filter: bots are skipped', () => {
  const dependabot = { login: 'dependabot[bot]', type: 'Bot' };
  assert.equal(decide('pull_request', prPayload({ user: dependabot })).kind, 'ignore');
  assert.equal(decide('pull_request', prPayload({ user: { login: 'renovate[bot]', type: 'User' } })).kind, 'ignore');
  const p = issuePayload();
  p.issue!.user = { login: 'some-app', type: 'Bot' };
  assert.equal(decide('issues', p).kind, 'ignore');
});

test('webhook: ignored events answer 202 and post nothing', async () => {
  const { app, posts, notificationsSettled } = hookApp();
  assert.equal((await deliver(app, 'issues', issuePayload({ action: 'closed' }))).status, 202);
  assert.equal((await deliver(app, 'pull_request', prPayload({ draft: true }))).status, 202);
  assert.equal((await deliver(app, 'watch', { action: 'started' })).status, 202);
  await notificationsSettled();
  assert.equal(posts.length, 0);
});

// ---------- dedupe ----------

test('webhook: a redelivery with the same X-GitHub-Delivery posts once', async () => {
  const { app, posts, notificationsSettled } = hookApp();
  const id = '72d3162e-cc78-11e3-81ab-4c9367dc0958';
  assert.equal((await deliver(app, 'issues', issuePayload(), { id })).status, 200);
  const again = await deliver(app, 'issues', issuePayload(), { id });
  assert.equal(again.status, 200);
  assert.deepEqual(await again.json(), { duplicate: true });
  await notificationsSettled();
  assert.equal(posts.length, 1);
  assert.equal(posts[0].channel, 9);
});

test('webhook: a PR ready again after going back to draft posts once', async () => {
  const { app, posts, notificationsSettled } = hookApp();
  await deliver(app, 'pull_request', prPayload());
  await deliver(app, 'pull_request', prPayload({}, 'ready_for_review'));
  await notificationsSettled();
  assert.equal(posts.length, 1);
});

test('dedupe keys expire after 7 days', () => {
  const store = new Store(':memory:');
  const t0 = new Date('2026-11-01T10:00:00Z');
  assert.equal(store.claimGithubDelivery('delivery:a', t0), true);
  assert.equal(store.claimGithubDelivery('delivery:a', new Date(t0.getTime() + 6 * 86_400_000)), false);
  assert.equal(store.claimGithubDelivery('delivery:a', new Date(t0.getTime() + 8 * 86_400_000)), true);
});

// ---------- card text ----------

test('card: new issue', async () => {
  const { app, posts, notificationsSettled } = hookApp();
  await deliver(app, 'issues', issuePayload());
  await notificationsSettled();
  assert.equal(
    posts[0].message,
    [
      '[card title="New issue: Crash when joining a channel" color=info icon=info url="HTTPS://github.com/Mumcord/mumcord/issues/42"]',
      '- Repo: Mumcord/mumcord',
      '- Number: #42',
      '- Author: octocat',
      '- Labels: bug, audio',
      '[/card]',
    ].join('\n'),
  );
});

test('card: new pull request with branches and size', () => {
  const d = decide('pull_request', prPayload({ title: 'Add "push" to *talk* overlay' }));
  assert.equal(d.kind, 'post');
  if (d.kind !== 'post') return;
  assert.equal(
    cardMessage(d.card),
    [
      '[card title="New pull request: Add push to talk overlay" color=success icon=check url="HTTPS://github.com/Mumcord/mumcord/pull/7"]',
      '- Repo: Mumcord/mumcord',
      '- Number: #7',
      '- Author: octocat',
      '- Branches: main ← ptt-overlay',
      '- Changes: +120 / −8',
      '[/card]',
    ].join('\n'),
  );
  const fork = decide('pull_request', prPayload({ head: { ref: 'fix', label: 'someone:fix', repo: { full_name: 'someone/mumcord' } } }));
  assert.ok(fork.kind === 'post' && fork.card.lines.includes('- Branches: main ← someone:fix'));
  const odd = decide('pull_request', prPayload({ html_url: 'javascript:alert(1)' }));
  assert.ok(odd.kind === 'post' && odd.card.url === 'HTTPS://github.com/Mumcord/mumcord');
});

// ---------- scheduler ----------

const TZ = 'Europe/Berlin';
const iso = (d: Date) => d.toISOString();

test('scheduler: zoned time follows the Berlin offset', () => {
  assert.equal(iso(zonedTime(2026, 7, 1, 22, 0, TZ)), '2026-07-01T20:00:00.000Z');
  assert.equal(iso(zonedTime(2026, 12, 1, 22, 0, TZ)), '2026-12-01T21:00:00.000Z');
  // 02:30 does not exist on 2026-03-29; it moves forward by the gap.
  assert.equal(iso(zonedTime(2026, 3, 29, 2, 30, TZ)), '2026-03-29T01:30:00.000Z');
  assert.equal(localDate(new Date('2026-11-07T23:30:00Z'), TZ), '2026-11-08');
});

test('scheduler: next run across the end of DST (late October)', () => {
  // Sat 24 Oct 2026, 21:00 CEST: today at 22:00 CEST.
  assert.equal(iso(nextRun(new Date('2026-10-24T19:00:00Z'), '22:00', TZ)), '2026-10-24T20:00:00.000Z');
  // 22:30 CEST: tomorrow (Sun 25 Oct, clocks went back) at 22:00 CET.
  assert.equal(iso(nextRun(new Date('2026-10-24T20:30:00Z'), '22:00', TZ)), '2026-10-25T21:00:00.000Z');
  // Exactly at the run time: the next day.
  assert.equal(iso(nextRun(new Date('2026-10-25T21:00:00Z'), '22:00', TZ)), '2026-10-26T21:00:00.000Z');
  // Sun 25 Oct, 02:30 local happens twice; the run is still that evening.
  assert.equal(iso(nextRun(new Date('2026-10-25T01:30:00Z'), '22:00', TZ)), '2026-10-25T21:00:00.000Z');
});

test('scheduler: next run across the start of DST (late March)', () => {
  // Sat 28 Mar 2026, 22:30 CET: tomorrow (Sun 29 Mar, clocks went forward) at 22:00 CEST.
  assert.equal(iso(nextRun(new Date('2026-03-28T21:30:00Z'), '22:00', TZ)), '2026-03-29T20:00:00.000Z');
  assert.equal(iso(nextRun(new Date('2026-03-29T12:00:00Z'), '22:00', TZ)), '2026-03-29T20:00:00.000Z');
  assert.equal(iso(nextRun(new Date('2026-03-29T20:00:00Z'), '22:00', TZ)), '2026-03-30T20:00:00.000Z');
  // Other configured times and zones.
  assert.equal(iso(nextRun(new Date('2026-03-29T00:00:00Z'), '07:15', 'UTC')), '2026-03-29T07:15:00.000Z');
});

// ---------- stats ----------

const snap = (over: Partial<StatsSnapshot> = {}): StatsSnapshot => ({
  followers: 40,
  stars: 125,
  openIssues: 19,
  openPrs: 4,
  newIssues: 0,
  newPrs: 0,
  repos: { mumcord: 100, mumbot: 20, mumpeer: 5 },
  ...over,
});

test('stats: deltas and top gainers', () => {
  assert.equal(delta(128, 125), ' (+3)');
  assert.equal(delta(17, 19), ' (−2)');
  assert.equal(delta(4, 4), ' (±0)');
  assert.equal(delta(4, undefined), '');
  const prev = snap();
  const cur = snap({ stars: 131, repos: { mumcord: 102, mumbot: 23, mumpeer: 5, fresh: 1 } });
  assert.deepEqual(topGainers(cur, prev), [
    { name: 'mumbot', gained: 3 },
    { name: 'mumcord', gained: 2 },
  ]);
  assert.deepEqual(topGainers(cur, null), []);
});

test('stats: card text with and without a previous snapshot', () => {
  const cur = snap({ stars: 128, followers: 41, openIssues: 17, openPrs: 4, newIssues: 3, newPrs: 1, repos: { mumcord: 102, mumbot: 21, mumpeer: 5 } });
  assert.equal(
    cardMessage(buildStatsCard('Mumcord', '2026-11-07', cur, snap())),
    [
      '[card title="Mumcord on GitHub · 2026-11-07" icon=chart url="HTTPS://github.com/Mumcord"]',
      '- Stars: ★ 128 (+3)',
      '- Followers: 41 (+1)',
      '- Open issues: 17 (−2)',
      '- Open PRs: 4 (±0)',
      '- New in 24 h: 3 issues, 1 PR',
      '- Most new stars: mumcord +2, mumbot +1',
      '[/card]',
    ].join('\n'),
  );
  const first = buildStatsCard('Mumcord', '2026-11-07', cur, null);
  assert.equal(first.lines[0], '- Stars: ★ 128');
  assert.ok(!first.lines.some((l) => l.startsWith('- Most new stars')));
});

/** GitHub API mock: org, two repo pages, search counts; `fail` makes every call fail. */
function githubFetch(state: { stars: number; fail?: boolean }) {
  const calls: { url: string; auth?: string }[] = [];
  const fn = (async (input: string | URL | Request, init?: RequestInit) => {
    const url = String(input);
    calls.push({ url, auth: (init?.headers as Record<string, string> | undefined)?.Authorization });
    if (state.fail) return new Response('{"message":"API rate limit exceeded"}', { status: 403 });
    const u = new URL(url);
    if (u.pathname === '/orgs/Mumcord') return Response.json({ followers: 41 });
    if (u.pathname === '/orgs/Mumcord/repos') {
      if (u.searchParams.get('page') === '1') {
        const repos = Array.from({ length: 100 }, (_, i) => ({ name: `r${i}`, stargazers_count: i === 0 ? state.stars : 0, archived: false, fork: false }));
        return Response.json(repos);
      }
      return Response.json([
        { name: 'old', stargazers_count: 50, archived: true, fork: false },
        { name: 'forked', stargazers_count: 70, archived: false, fork: true },
        { name: 'last', stargazers_count: 3, archived: false, fork: false },
      ]);
    }
    if (u.pathname === '/search/issues') {
      const q = u.searchParams.get('q') ?? '';
      const n = q.includes('created:>=') ? (q.includes('is:pr') ? 1 : 2) : q.includes('is:pr') ? 4 : 17;
      return Response.json({ total_count: n, items: [] });
    }
    throw new Error(`unexpected fetch ${url}`);
  }) as typeof fetch;
  return { fn, calls };
}

function statsSetup(nowIso: string, state = { stars: 100 } as { stars: number; fail?: boolean }, store = new Store(':memory:')) {
  let now = new Date(nowIso);
  const gh = githubFetch(state);
  const cards: string[] = [];
  const timers: number[] = [];
  const mumbot = { enabled: true, postCard: async (card: any) => (cards.push(cardMessage(card)), true) };
  const stats = new GithubStats({
    store,
    mumbot,
    org: 'Mumcord',
    time: '22:00',
    tz: TZ,
    fetchFn: gh.fn,
    now: () => now,
    setTimer: (_fn, ms) => timers.push(ms),
    clearTimer: () => {},
    log: quiet,
  });
  return { stats, cards, timers, gh, store, setNow: (s: string) => (now = new Date(s)) };
}

test('stats: fetches with pagination, filters archived and forks, uses the 24 h window', async () => {
  const s = statsSetup('2026-11-07T21:05:00Z');
  assert.equal(await s.stats.runIfDue(), true);
  assert.match(s.cards[0], /- Stars: ★ 103\n/);
  assert.match(s.cards[0], /- Open issues: 17\n- Open PRs: 4\n- New in 24 h: 2 issues, 1 PR/);
  const search = s.gh.calls.map((c) => new URL(c.url)).filter((u) => u.pathname === '/search/issues').map((u) => u.searchParams.get('q'));
  assert.ok(search.includes('is:issue org:Mumcord created:>=2026-11-06T21:05:00Z'));
  assert.ok(search.includes('is:pr is:open org:Mumcord'));
  assert.ok(s.gh.calls.every((c) => c.auth === undefined), 'unauthenticated without a token');
});

test('stats: not before the run time, once per day, also after a restart', async () => {
  const store = new Store(':memory:');
  const s = statsSetup('2026-11-07T20:30:00Z', { stars: 100 }, store); // 21:30 Berlin
  assert.equal(await s.stats.runIfDue(), false);
  s.setNow('2026-11-07T21:00:00Z');
  assert.equal(await s.stats.runIfDue(), true);
  s.setNow('2026-11-07T21:30:00Z');
  assert.equal(await s.stats.runIfDue(), false);
  // Restart later the same evening: same store, new instance.
  const again = statsSetup('2026-11-07T22:50:00Z', { stars: 100 }, store);
  again.stats.start();
  await new Promise((r) => setImmediate(r));
  assert.equal(again.cards.length, 0);
  assert.equal(s.cards.length, 1);
  // Concurrent calls do not double-post either.
  const c = statsSetup('2026-11-08T21:00:00Z', { stars: 104 }, store);
  const results = await Promise.all([c.stats.runIfDue(), c.stats.runIfDue()]);
  assert.deepEqual(results.sort(), [false, true]);
  assert.equal(c.cards.length, 1);
  assert.match(c.cards[0], /Mumcord on GitHub · 2026-11-08/);
  assert.match(c.cards[0], /- Stars: ★ 107 \(\+4\)/);
  assert.match(c.cards[0], /- Most new stars: r0 \+4/);
});

test('stats: catch-up on start the same evening, then the timer is set for tomorrow', async () => {
  const s = statsSetup('2026-11-07T22:30:00Z'); // 23:30 Berlin, missed 22:00
  s.stats.start();
  await new Promise((r) => setTimeout(r, 10));
  assert.equal(s.cards.length, 1);
  assert.equal(s.timers.at(-1), Date.parse('2026-11-08T21:00:00Z') - Date.parse('2026-11-07T22:30:00Z'));
  s.stats.stop();
});

test('stats: API failures are logged and skipped, and the day can still run later', async () => {
  const state = { stars: 100, fail: true };
  const s = statsSetup('2026-11-07T21:00:00Z', state);
  assert.equal(await s.stats.runIfDue(), false);
  assert.equal(s.cards.length, 0);
  assert.equal(s.store.hasGithubStats('Mumcord', '2026-11-07'), false);
  state.fail = false;
  assert.equal(await s.stats.runIfDue(), true);
});

test('config: GitHub defaults and the channel fallback', () => {
  const c = loadConfig({ MUMBOT_CHANNEL: 'Notifications' });
  assert.equal(c.githubOrg, 'Mumcord');
  assert.equal(c.githubStats, true);
  assert.equal(c.githubStatsTime, '22:00');
  assert.equal(c.githubStatsTz, 'Europe/Berlin');
  assert.equal(c.mumbotGithubChannel, 'Notifications');
  assert.equal(c.githubWebhookSecret, '');
  const d = loadConfig({ MUMBOT_CHANNEL: 'Notifications', MUMBOT_GITHUB_CHANNEL: 'Development', GITHUB_STATS: '0', GITHUB_WEBHOOK_SECRET: 'CHANGE_ME' });
  assert.equal(d.mumbotGithubChannel, 'Development');
  assert.equal(d.githubStats, false);
  assert.equal(d.githubWebhookSecret, '');
});
