import { test } from 'node:test';
import assert from 'node:assert/strict';
import { fixture, makeApp, post, postText, sampleReport } from './helpers.ts';
import type { AnthropicLike } from '../src/ai.ts';
import type { GroupRow } from '../src/db.ts';
import { loadConfig } from '../src/config.ts';
import { buildCard, buildPayload, cardMessage, groupLink, MumbotNotifier, type CardInput } from '../src/mumbot.ts';

const URL_ = 'http://mumbot:8080/message';
const quiet = { log() {}, warn() {} };

type Call = { url: string; init?: RequestInit; body?: any };

function mumbotFetch(status = 200) {
  const calls: Call[] = [];
  const fn = (async (input: string | URL | Request, init?: RequestInit) => {
    const url = String(input);
    calls.push({ url, init, body: init?.body ? JSON.parse(String(init.body)) : undefined });
    if (url.endsWith('/channels')) return new Response(JSON.stringify({ channels: [{ id: 7, name: 'Crashes' }] }), { status: 200 });
    if (url === URL_) return new Response(status === 200 ? '{"delivered":true}' : 'nope', { status });
    throw new Error(`unexpected fetch ${url}`);
  }) as typeof fetch;
  return { fn, calls, posts: () => calls.filter((c) => c.url === URL_) };
}

function notifier(fn: typeof fetch, over: Partial<ConstructorParameters<typeof MumbotNotifier>[0]> = {}) {
  return new MumbotNotifier({ url: URL_, token: 'k3y', channel: '7', fetchFn: fn, log: quiet, ...over });
}

const aiResult = {
  title: 'Mixer index out of bounds with 7 "channels"',
  summary: 'The mixer indexes past the channel list when a device disappears. Happens on hot-unplug.',
  likely_cause: 'x',
  component: 'audio',
  severity: 'critical',
  suggested_labels: [],
  suspect_location: 'crates/engine/src/audio/mixer.rs:142',
  fix_hint: 'x',
};

function fakeAnthropic(delayMs = 0, fail = false) {
  return {
    messages: {
      create: async () => {
        if (delayMs) await new Promise((r) => setTimeout(r, delayMs));
        if (fail) throw new Error('boom');
        return { stop_reason: 'end_turn', content: [{ type: 'text', text: JSON.stringify(aiResult) }] };
      },
    },
  } as unknown as AnthropicLike;
}

const group = (over: Partial<GroupRow> = {}): GroupRow => ({
  id: 'a'.repeat(64),
  kind: 'panic',
  message: "thread 'audio' panicked at /home/alice/x/crates/engine/src/audio/mixer.rs:142:17:\nindex out of bounds",
  top_frames: [],
  count: 3,
  first_seen: '2026-11-01T00:00:00Z',
  last_seen: '2026-11-02T00:00:00Z',
  versions: ['0.7.0', '0.7.1'],
  os_list: ['linux x86_64 (Arch 6.9)'],
  status: 'new',
  issue_url: null,
  ai: null,
  ai_status: 'none',
  ai_error: null,
  ai_at: null,
  weak: false,
  ...over,
});

const input = (over: Partial<CardInput> = {}): CardInput => ({
  group: group(),
  latest: { app_version: '0.7.1', os: 'linux', arch: 'x86_64', backtrace: '' },
  regression: false,
  origin: 'https://crash.mumcord.app',
  ...over,
});

/**
 * What Mumcord sees: Mumbot escapes the text and turns lowercase http(s) runs into <a> links
 * (src/webhook/markdown.rs), then Mumcord matches its BB code regex (ui/src/features/chat/cards.ts).
 */
function mumcordAttributes(message: string): Map<string, string> | null {
  const esc = message.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  const linked = esc.replace(/https?:\/\/[^\s"'<>]+/g, (u) => `<a href="${u}">${u}</a>`);
  const html = linked.replace(/&quot;/g, '"').replace(/&#39;/g, "'"); // innerHTML re-serialization
  const ATTRIBUTE = String.raw`\s+[A-Za-z][\w-]*=(?:"[^"]*"|[^\s"\]]+)`;
  const m = new RegExp(String.raw`\[card((?:${ATTRIBUTE})*)\s*\]([\s\S]*?)\[\/card\]`, 'i').exec(html);
  if (!m) return null;
  const out = new Map<string, string>();
  for (const a of (m[1] ?? '').matchAll(/([A-Za-z][\w-]*)=(?:"([^"]*)"|([^\s"\]]+))/g)) out.set(a[1].toLowerCase(), a[2] ?? a[3] ?? '');
  return out;
}

// ---------- card payload ----------

test('card with AI: title, severity label and colour, component, summary, fields, deep link', () => {
  const payload = buildPayload(7, input({ group: group({ ai: aiResult as any, ai_status: 'done' }) }));
  assert.equal(payload.channel, 7);
  assert.deepEqual(Object.keys(payload), ['channel', 'message']);
  const lines = payload.message.split('\n');
  assert.equal(
    lines[0],
    `[card title="Mixer index out of bounds with 7 channels" color=error icon=error url="HTTPS://crash.mumcord.app/#/groups/${'a'.repeat(64)}"]`,
  );
  assert.equal(lines[1], '**Critical** · audio');
  assert.match(lines[2], /^The mixer indexes past/);
  assert.ok(lines.includes('- Versions: 0.7.0, 0.7.1'));
  assert.ok(lines.includes('- OS: linux x86_64'));
  assert.ok(lines.includes('- Kind: panic'));
  assert.ok(lines.includes('- Count: 3'));
  assert.ok(lines.includes('- Suspect: `crates/engine/src/audio/mixer.rs:142`'));
  assert.equal(lines.at(-1), '[/card]');

  const attrs = mumcordAttributes(payload.message);
  assert.ok(attrs, 'Mumcord recognises the card after Mumbot rendering');
  assert.equal(attrs.get('title'), 'Mixer index out of bounds with 7 channels');
  assert.equal(attrs.get('color'), 'error');
  assert.match(attrs.get('url')!, /^HTTPS:\/\/crash\.mumcord\.app\/#\/groups\/a{64}$/);
  assert.ok(new URL(attrs.get('url')!).hash.startsWith('#/groups/'));
});

test('card without AI: "Crash: <cause>", colour from kind, no AI parts, home dir redacted', () => {
  const card = buildCard(input());
  assert.match(card.title, /^Crash: thread 'audio' panicked at ~\/x\/crates/);
  assert.equal(card.color, 'error'); // panic → high
  assert.ok(!card.lines.some((l) => l.startsWith('**')));
  const repoCause = buildCard(input({ group: group({ message: 'decoder returned no frame at crates/engine/src/x.rs:17' }) }));
  assert.ok(repoCause.lines.includes('- Suspect: `crates/engine/src/x.rs:17`'));
  assert.equal(buildCard(input({ group: group({ kind: 'hang' }) })).color, 'warning');
  assert.equal(buildCard(input({ group: group({ kind: 'signal SIGSEGV' }) })).color, 'error');
  const low = buildCard(input({ group: group({ ai: { ...aiResult, severity: 'low' } as any }) }));
  assert.equal(low.color, null);
  assert.ok(!cardMessage(low).includes('color='));
  assert.ok(mumcordAttributes(cardMessage(card)));
});

test('regression cards say so', () => {
  const card = buildCard(input({ regression: true, previousStatus: 'ignored' }));
  assert.equal(card.lines[0], '**Regression**: marked ignored, seen again');
});

test('hostile text cannot break the BB code or inject links into attributes', () => {
  const g = group({ message: 'boom "x" [/card] **y** `z` see https://evil.example/a\nsecond', ai: { ...aiResult, title: 'T "q" [card] https://evil.example', summary: '[/card] `x` *y*' } as any });
  const msg = cardMessage(buildCard(input({ group: g })));
  assert.equal(msg.match(/\[\/card\]/g)?.length, 1);
  const attrs = mumcordAttributes(msg);
  assert.ok(attrs);
  assert.equal(attrs.get('title'), 'T q card HTTPS://evil.example');
});

test('groupLink keeps http origins working too', () => {
  assert.equal(groupLink('http://localhost:8787/', 'abc'), 'HTTP://localhost:8787/#/groups/abc');
});

// ---------- privacy ----------

test('no log lines, user note or system details leak into the card', async () => {
  const m = mumbotFetch();
  const { app, notificationsSettled } = makeApp({}, { mumbot: notifier(m.fn) });
  const res = await post(app, sampleReport({ log_tail: 'SECRET-LOG-LINE', user_note: 'SECRET-USER-NOTE', os_version: 'SECRET-KERNEL-9.9', install_id: '0123456789abcdef0123456789abcdef' }));
  assert.equal(res.status, 201);
  await notificationsSettled();
  const [call] = m.posts();
  assert.ok(call);
  const raw = String(call.init!.body);
  for (const secret of ['SECRET-LOG-LINE', 'SECRET-USER-NOTE', 'SECRET-KERNEL', '0123456789abcdef']) assert.ok(!raw.includes(secret), secret);
  assert.equal((call.init!.headers as Record<string, string>)['X-API-Key'], 'k3y');
  assert.equal(call.body.channel, 7);
});

test('crash file: card carries no system or running details', async () => {
  const m = mumbotFetch();
  const { app, notificationsSettled } = makeApp({}, { mumbot: notifier(m.fn) });
  assert.equal((await postText(app, fixture('panic'))).status, 201);
  await notificationsSettled();
  const msg: string = m.posts()[0].body.message;
  assert.ok(!/camera|AppImage|kernel|gpu|last log/i.test(msg), msg);
  assert.ok(msg.includes('- OS: linux x86_64'));
});

// ---------- when to post ----------

test('posts for a new group and a regression, not for further reports of an open group', async () => {
  const m = mumbotFetch();
  let now = 1_000_000;
  const { app, store, notificationsSettled } = makeApp({}, { mumbot: notifier(m.fn, { now: () => now }) });
  const res = await post(app, sampleReport());
  const { group: id } = await res.json();
  await post(app, sampleReport());
  await notificationsSettled();
  assert.equal(m.posts().length, 1);

  now += 2 * 3_600_000;
  await post(app, sampleReport()); // still open: quiet
  await notificationsSettled();
  assert.equal(m.posts().length, 1);

  store.setStatus(id, 'fixed');
  await post(app, sampleReport());
  await notificationsSettled();
  assert.equal(m.posts().length, 2);
  assert.match(m.posts()[1].body.message, /\*\*Regression\*\*: marked fixed/);
});

test('cooldown: at most one card per group per hour', async () => {
  const m = mumbotFetch();
  let now = 1_000_000;
  const { app, store, notificationsSettled } = makeApp({}, { mumbot: notifier(m.fn, { now: () => now }) });
  const { group: id } = await (await post(app, sampleReport())).json();
  store.setStatus(id, 'ignored');
  now += 59 * 60_000;
  await post(app, sampleReport());
  await notificationsSettled();
  assert.equal(m.posts().length, 1);
  now += 2 * 60_000;
  await post(app, sampleReport());
  await notificationsSettled();
  assert.equal(m.posts().length, 2);
});

test('new group waits for the AI analysis and uses its title and severity', async () => {
  const m = mumbotFetch();
  const { app, notificationsSettled } = makeApp({ aiIncludeSource: false }, { mumbot: notifier(m.fn), anthropic: fakeAnthropic(20) });
  await post(app, sampleReport());
  await notificationsSettled();
  const msg: string = m.posts()[0].body.message;
  assert.match(msg, /^\[card title="Mixer index out of bounds with 7 channels" color=error/);
  assert.match(msg, /\*\*Critical\*\* · audio/);
});

test('AI failure or timeout still posts the fallback card', async () => {
  const m = mumbotFetch();
  const failed = makeApp({ aiIncludeSource: false }, { mumbot: notifier(m.fn), anthropic: fakeAnthropic(0, true) });
  await post(failed.app, sampleReport());
  await failed.notificationsSettled();
  assert.match(m.posts()[0].body.message, /^\[card title="Crash: /);

  const m2 = mumbotFetch();
  const slow = makeApp({ aiIncludeSource: false }, { mumbot: notifier(m2.fn), anthropic: fakeAnthropic(300), notifyAiWaitMs: 20 });
  await post(slow.app, sampleReport());
  await slow.notificationsSettled();
  assert.match(m2.posts()[0].body.message, /^\[card title="Crash: /);
});

// ---------- config and failures ----------

test('placeholder or missing settings turn the webhook off', async () => {
  const cfg = loadConfig({ MUMBOT_WEBHOOK_URL: URL_, MUMBOT_WEBHOOK_TOKEN: 'CHANGE_ME_mumbot_key', MUMBOT_CHANNEL: '7' });
  assert.equal(cfg.mumbotWebhookToken, '');
  const m = mumbotFetch();
  const { app, notificationsSettled } = makeApp(cfg, { fetchFn: m.fn });
  assert.equal((await post(app, sampleReport())).status, 201);
  await notificationsSettled();
  assert.equal(m.calls.length, 0);
  assert.equal(loadConfig({ MUMBOT_WEBHOOK_URL: 'CHANGE_ME' }).mumbotWebhookUrl, '');
  assert.equal(new MumbotNotifier({ url: URL_, token: 'k', channel: '' }).enabled, false);
});

test('config from env reaches the webhook', async () => {
  const m = mumbotFetch();
  const cfg = loadConfig({ MUMBOT_WEBHOOK_URL: URL_, MUMBOT_WEBHOOK_TOKEN: 'k3y', MUMBOT_CHANNEL: 'Crashes' });
  const { app, notificationsSettled } = makeApp(cfg, { fetchFn: m.fn });
  await post(app, sampleReport());
  await notificationsSettled();
  assert.equal(m.calls[0].url, 'http://mumbot:8080/channels'); // name → id lookup
  assert.equal(m.posts()[0].body.channel, 7);
});

test('webhook errors and timeouts are logged and never break ingest', async () => {
  const warnings: string[] = [];
  const log = { log() {}, warn: (s: string) => void warnings.push(s) };
  const m = mumbotFetch(503);
  const a = makeApp({}, { mumbot: notifier(m.fn, { log }) });
  assert.equal((await post(a.app, sampleReport())).status, 201);
  await a.notificationsSettled();
  assert.match(warnings[0], /503/);

  const hang = (async (_i: unknown, init?: RequestInit) =>
    new Promise<Response>((_, reject) => init?.signal?.addEventListener('abort', () => reject(init.signal!.reason)))) as typeof fetch;
  const b = makeApp({}, { mumbot: notifier(hang, { log, timeoutMs: 30 }) });
  assert.equal((await post(b.app, sampleReport())).status, 201);
  await b.notificationsSettled();
  assert.match(warnings[1], /failed/);
});
