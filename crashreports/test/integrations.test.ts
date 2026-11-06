import { test } from 'node:test';
import assert from 'node:assert/strict';
import { adminCookie, fixture, makeApp, post, postText, sampleReport } from './helpers.ts';
import type { AnthropicLike } from '../src/ai.ts';
import { distinctiveLiteral, extractLocations, gatherSnippets, snippetAround, SourceFetcher, toRepoPath } from '../src/source.ts';

type Call = { url: string; init?: RequestInit };

/** A fetch that only answers known URLs and records every call; anything else fails the test. */
function mockFetch(routes: Record<string, () => Response>) {
  const calls: Call[] = [];
  const fn = (async (input: string | URL | Request, init?: RequestInit) => {
    const url = String(input);
    calls.push({ url, init });
    for (const [prefix, make] of Object.entries(routes)) if (url.startsWith(prefix)) return make();
    return new Response('not found', { status: 404 });
  }) as typeof fetch;
  return { fn, calls };
}

const FILE = Array.from({ length: 200 }, (_, i) => `line ${i + 1}`).join('\n');
const aiResult = {
  title: 'Mixer index out of bounds',
  summary: 'The audio mixer indexes past its channel list. It happens during playback.',
  likely_cause: 'Channel count changes while mixing.',
  component: 'audio',
  severity: 'high' as const,
  suggested_labels: ['bug', 'audio'],
  suspect_location: 'crates/engine/src/audio/mixer.rs:142',
  fix_hint: 'Clamp the index to the channel count.',
};

function fakeAnthropic(impl?: (params: any) => any) {
  const calls: any[] = [];
  const client = {
    messages: {
      create: async (params: any, opts: any) => {
        calls.push({ params, opts });
        if (impl) return impl(params);
        return { stop_reason: 'end_turn', content: [{ type: 'text', text: JSON.stringify(aiResult) }] };
      },
    },
  } as unknown as AnthropicLike;
  return { client, calls };
}

const json = (o: unknown, status = 200) => () => new Response(JSON.stringify(o), { status, headers: { 'content-type': 'application/json' } });
const text = (s: string, status = 200) => () => new Response(s, { status });

// ---------- source locations ----------

test('toRepoPath normalizes CI and local build paths', () => {
  assert.equal(toRepoPath('/home/runner/work/mumcord/mumcord/crates/engine/src/x.rs', 'mumcord'), 'crates/engine/src/x.rs');
  assert.equal(toRepoPath('D:\\a\\mumcord\\mumcord\\src-tauri\\src\\main.rs', 'mumcord'), 'src-tauri/src/main.rs');
  assert.equal(toRepoPath('C:\\Users\\bob\\code\\Mumcord\\src\\lib.rs', 'mumcord'), 'src/lib.rs');
  assert.equal(toRepoPath('src/foo.rs', 'mumcord'), 'src/foo.rs');
  assert.equal(toRepoPath('./crates/a/b.rs', 'mumcord'), 'crates/a/b.rs');
  assert.equal(toRepoPath('/rustc/abc/library/std/src/panicking.rs', 'mumcord'), null);
  assert.equal(toRepoPath('/home/x/.cargo/registry/src/tokio-1/src/rt.rs', 'mumcord'), null);
  assert.equal(toRepoPath('/opt/other/src/x.rs', 'mumcord'), null);
  assert.equal(toRepoPath('src/../../etc/passwd.rs', 'mumcord'), null);
  assert.equal(toRepoPath('src/notes.txt', 'mumcord'), null);
});

test('extractLocations reads the panic message and top non-library frames, deduped and capped', () => {
  const r = sampleReport();
  assert.deepEqual(extractLocations(r.message, r.backtrace, 'mumcord'), [
    { path: 'crates/engine/src/audio/mixer.rs', line: 142 },
    { path: 'crates/engine/src/audio/pipeline.rs', line: 88 },
  ]);
  const many = Array.from({ length: 8 }, (_, i) => `${i}: app::f${i}\n   at src/f${i}.rs:${i + 1}:1`).join('\n');
  assert.equal(extractLocations('boom', many, 'mumcord').length, 5);
});

test('distinctiveLiteral picks a searchable phrase', () => {
  assert.equal(distinctiveLiteral('called `Result::unwrap()` on an `Err` value: Io(Os { code: 2 })'), 'Result::unwrap()');
  assert.equal(distinctiveLiteral('failed to bind relay socket 12 at crates/relay/src/net.rs:5'), 'failed to bind relay socket');
  assert.equal(distinctiveLiteral('x 1'), null);
});

test('snippetAround numbers lines and marks the target', () => {
  const s = snippetAround(FILE, 100, 2).split('\n');
  assert.deepEqual(s, ['  98 | line 98', '  99 | line 99', '>100 | line 100', ' 101 | line 101', ' 102 | line 102']);
  assert.equal(snippetAround(FILE, 1).split('\n').length, 41);
});

test('gatherSnippets fetches at the version tag, falls back to main, and caches', async () => {
  const { fn, calls } = mockFetch({
    'https://raw.githubusercontent.com/Mumcord/mumcord/v0.7.0/crates/engine/src/audio/mixer.rs': text(FILE),
    'https://raw.githubusercontent.com/Mumcord/mumcord/main/crates/engine/src/audio/pipeline.rs': text(FILE),
  });
  const f = new SourceFetcher({ fetchFn: fn, repo: 'Mumcord/mumcord', token: '' });
  const r = sampleReport();
  const input = { message: r.message, backtrace: r.backtrace, app_version: '0.7.0' };
  const snips = await gatherSnippets(f, input, 'mumcord');
  assert.deepEqual(snips.map((s) => [s.path, s.line, s.ref]), [
    ['crates/engine/src/audio/mixer.rs', 142, 'v0.7.0'],
    ['crates/engine/src/audio/pipeline.rs', 88, 'main'],
  ]);
  assert.match(snips[0].text, />142 \| line 142/);
  assert.equal(calls.length, 3); // mixer@tag, pipeline@tag (404), pipeline@main
  await gatherSnippets(f, input, 'mumcord');
  assert.equal(calls.length, 3, 'second run is served from the cache');
});

test('gatherSnippets uses the contents API with a token and code search when no location is found', async () => {
  const { fn, calls } = mockFetch({
    'https://api.github.com/search/code': json({ items: [{ path: 'crates/relay/src/net.rs' }] }),
    'https://api.github.com/repos/Mumcord/mumcord/contents/crates/relay/src/net.rs?ref=v0.7.0': text(FILE.replace('line 50', 'bail!("failed to bind relay socket")')),
  });
  const f = new SourceFetcher({ fetchFn: fn, repo: 'Mumcord/mumcord', token: 'tok' });
  const snips = await gatherSnippets(f, { message: 'failed to bind relay socket 12', backtrace: '', app_version: '0.7.0' }, 'mumcord');
  assert.deepEqual(snips.map((s) => [s.path, s.line]), [['crates/relay/src/net.rs', 50]]);
  assert.match(decodeURIComponent(calls[0].url), /q="failed to bind relay socket" repo:Mumcord\/mumcord/);
  assert.equal((calls[1].init?.headers as Record<string, string>).Authorization, 'Bearer tok');
});

test('gatherSnippets skips code search without a token and survives fetch errors', async () => {
  const { fn, calls } = mockFetch({ 'https://raw.githubusercontent.com/': text('boom', 500) });
  const f = new SourceFetcher({ fetchFn: fn, repo: 'Mumcord/mumcord', token: '' });
  assert.deepEqual(await gatherSnippets(f, { message: 'failed to bind relay socket', backtrace: '', app_version: '1.0.0' }, 'mumcord'), []);
  assert.equal(calls.length, 0);
  const r = sampleReport();
  assert.deepEqual(await gatherSnippets(f, { message: r.message, backtrace: r.backtrace, app_version: '1.0.0' }, 'mumcord'), []);
});

// ---------- AI ----------

test('a new group is analyzed in the background with source snippets, without logs or notes', async () => {
  const { fn } = mockFetch({ 'https://raw.githubusercontent.com/Mumcord/mumcord/v0.7.0/': text(FILE) });
  const ai = fakeAnthropic();
  const { app, store } = makeApp({}, { anthropic: ai.client, fetchFn: fn });
  const res = await post(app, sampleReport({ log_tail: 'SECRET LOG', user_note: 'SECRET NOTE' }));
  const { group } = await res.json();
  for (let i = 0; i < 50 && store.getGroup(group)!.ai_status !== 'done'; i++) await new Promise((r) => setTimeout(r, 10));
  const g = store.getGroup(group)!;
  assert.equal(g.ai_status, 'done');
  assert.equal(g.ai!.title, aiResult.title);
  assert.equal(g.ai!.suspect_location, aiResult.suspect_location);
  assert.deepEqual(g.ai!.sources!.map((s) => s.ref), ['v0.7.0', 'v0.7.0']);
  const { params, opts } = ai.calls[0];
  assert.equal(params.model, 'claude-haiku-5-5');
  assert.equal(params.output_config.format.type, 'json_schema');
  assert.ok(params.output_config.format.schema.required.includes('fix_hint'));
  assert.ok(opts.timeout > 0);
  const prompt = params.messages[0].content as string;
  assert.ok(!prompt.includes('SECRET'), 'no log tail or note');
  assert.match(prompt, /source crates\/engine\/src\/audio\/mixer\.rs:142 \(ref v0\.7\.0\)/);
  // the second report of the same group does not trigger another analysis
  await post(app, sampleReport());
  await new Promise((r) => setTimeout(r, 20));
  assert.equal(ai.calls.length, 1);
});

test('text reports: snippets come from the cause and app frames at the version tag; context goes to the AI', async () => {
  const { fn, calls } = mockFetch({ 'https://raw.githubusercontent.com/Mumcord/mumcord/v0.7.1/crates/engine/examples/crash_demo.rs': text(FILE) });
  const ai = fakeAnthropic();
  const { app, store } = makeApp({}, { anthropic: ai.client, fetchFn: fn });
  const { group } = await (await postText(app, fixture('panic'))).json();
  for (let i = 0; i < 50 && store.getGroup(group)!.ai_status !== 'done'; i++) await new Promise((r) => setTimeout(r, 10));
  assert.deepEqual(calls.map((c) => c.url), ['https://raw.githubusercontent.com/Mumcord/mumcord/v0.7.1/crates/engine/examples/crash_demo.rs']);
  assert.deepEqual(store.getGroup(group)!.ai!.sources, [{ path: 'crates/engine/examples/crash_demo.rs', line: 17, ref: 'v0.7.1' }]);
  const prompt = ai.calls[0].params.messages[0].content as string;
  assert.match(prompt, /camera: on air/);
  assert.match(prompt, /watching a screen share: yes/);
  assert.match(prompt, /desktop: KDE on wayland/);
  assert.match(prompt, /driver amdgpu/);
  assert.match(prompt, /thread: screen-decode/);
  assert.match(prompt, />17 \| line 17/);
  assert.ok(!prompt.includes('crash.rs'), 'crash handler frame is not sent');
});

test('extractLocations on the real fixtures', () => {
  const p = fixture('panic');
  const cause = p.match(/^cause: (.*)$/m)![1];
  const bt = p.slice(p.indexOf('backtrace:'));
  assert.deepEqual(extractLocations(cause, bt, 'mumcord'), [{ path: 'crates/engine/examples/crash_demo.rs', line: 17 }]);
  assert.deepEqual(extractLocations('Mumcord was stopped by SIGSEGV', '', 'mumcord'), []);
});

test('AI_INCLUDE_LOGS=1 sends log tail and note; AI_INCLUDE_SOURCE=0 skips GitHub', async () => {
  const { fn, calls } = mockFetch({});
  const ai = fakeAnthropic();
  const { app, analyze } = makeApp({ aiIncludeLogs: true, aiIncludeSource: false }, { anthropic: ai.client, fetchFn: fn });
  const { group } = await (await post(app, sampleReport({ log_tail: 'LOG', user_note: 'NOTE' }))).json();
  await new Promise((r) => setTimeout(r, 20));
  await analyze(group);
  const prompt = ai.calls.at(-1).params.messages[0].content as string;
  assert.match(prompt, /LOG/);
  assert.match(prompt, /NOTE/);
  assert.equal(calls.length, 0);
});

test('AI errors, refusals and bad JSON are stored, not thrown; re-analyze works', async () => {
  let mode = 'timeout';
  const ai = fakeAnthropic(() => {
    if (mode === 'timeout') throw new Error('Request timed out.');
    if (mode === 'refusal') return { stop_reason: 'refusal', content: [] };
    if (mode === 'badjson') return { stop_reason: 'end_turn', content: [{ type: 'text', text: '{nope' }] };
    return { stop_reason: 'end_turn', content: [{ type: 'text', text: JSON.stringify({ ...aiResult, title: 'x'.repeat(200), severity: 'apocalyptic' }) }] };
  });
  const { app, store } = makeApp({ aiIncludeSource: false }, { anthropic: ai.client });
  const cookie = adminCookie(store);
  const { group } = await (await post(app, sampleReport())).json();
  await new Promise((r) => setTimeout(r, 20));
  assert.equal(store.getGroup(group)!.ai_status, 'error');
  assert.match(store.getGroup(group)!.ai_error!, /timed out/);
  const reanalyze = () => app.request(`/api/admin/groups/${group}/analyze`, { method: 'POST', headers: { cookie, 'x-crashreports-csrf': '1' } });
  mode = 'refusal';
  await reanalyze();
  assert.match(store.getGroup(group)!.ai_error!, /declined/);
  mode = 'badjson';
  await reanalyze();
  assert.match(store.getGroup(group)!.ai_error!, /not valid JSON/);
  mode = 'ok';
  const res = await (await reanalyze()).json();
  assert.equal(res.group.ai_status, 'done');
  assert.equal(res.group.ai.title.length, 80);
  assert.equal(res.group.ai.severity, 'medium');
});

// ---------- GitHub ----------

test('creating a GitHub issue posts a short body without private data by default', async () => {
  const { fn, calls } = mockFetch({ 'https://api.github.com/repos/Mumcord/mumcord/issues': json({ html_url: 'https://github.com/Mumcord/mumcord/issues/42' }, 201) });
  const { app, store } = makeApp({ githubToken: 'ghp_test' }, { fetchFn: fn });
  const cookie = adminCookie(store);
  const { group } = await (await post(app, sampleReport({ message: 'open /home/alice/x failed', log_tail: 'SECRET LOG', user_note: 'SECRET NOTE' }))).json();
  store.setAiResult(group, { ...aiResult, sources: [{ path: 'crates/engine/src/audio/mixer.rs', line: 142, ref: 'v0.7.0' }] });
  const res = await app.request(`/api/admin/groups/${group}/issue`, { method: 'POST', headers: { cookie, 'x-crashreports-csrf': '1', 'content-type': 'application/json' }, body: '{}' });
  assert.equal(res.status, 200);
  assert.equal((await res.json()).url, 'https://github.com/Mumcord/mumcord/issues/42');
  assert.equal(store.getGroup(group)!.issue_url, 'https://github.com/Mumcord/mumcord/issues/42');
  const sent = JSON.parse(String(calls[0].init!.body));
  assert.equal((calls[0].init!.headers as Record<string, string>).Authorization, 'Bearer ghp_test');
  assert.equal(sent.title, aiResult.title);
  assert.ok(!sent.body.includes('SECRET'));
  assert.ok(!sent.body.includes('alice'));
  assert.match(sent.body, /\*\*Kind:\*\* panic/);
  assert.match(sent.body, /mumcord_engine::audio::mixer::Mixer::mix/);
  assert.match(sent.body, /Fix hint/);
  assert.match(sent.body, /\(https:\/\/github\.com\/Mumcord\/mumcord\/blob\/v0\.7\.0\/crates\/engine\/src\/audio\/mixer\.rs#L142\)/);
  // a second attempt is refused
  const again = await app.request(`/api/admin/groups/${group}/issue`, { method: 'POST', headers: { cookie, 'x-crashreports-csrf': '1' }, body: '{}' });
  assert.equal(again.status, 409);
});

test('the issue includes note and log tail only when ticked; title falls back to the message', async () => {
  const { fn, calls } = mockFetch({ 'https://api.github.com/repos/o/r/issues': json({ html_url: 'https://github.com/o/r/issues/1' }, 201) });
  const { app, store } = makeApp({ githubToken: 't', githubRepo: 'o/r' }, { fetchFn: fn });
  const cookie = adminCookie(store);
  const { group } = await (await post(app, sampleReport({ log_tail: 'LOGTAIL', user_note: 'NOTE' }))).json();
  await app.request(`/api/admin/groups/${group}/issue`, { method: 'POST', headers: { cookie, 'x-crashreports-csrf': '1', 'content-type': 'application/json' }, body: '{"include_private":true}' });
  const sent = JSON.parse(String(calls[0].init!.body));
  assert.match(sent.title, /^Crash: thread 'audio' panicked/);
  assert.match(sent.body, /LOGTAIL/);
  assert.match(sent.body, /NOTE/);
});

test('GitHub errors and a missing token are reported', async () => {
  const { fn } = mockFetch({ 'https://api.github.com/': json({ message: 'Bad credentials' }, 401) });
  const bad = makeApp({ githubToken: 't' }, { fetchFn: fn });
  const { group } = await (await post(bad.app, sampleReport())).json();
  const r = await bad.app.request(`/api/admin/groups/${group}/issue`, { method: 'POST', headers: { cookie: adminCookie(bad.store), 'x-crashreports-csrf': '1' }, body: '{}' });
  assert.equal(r.status, 502);
  assert.match((await r.json()).error, /GitHub API 401/);
  assert.equal(bad.store.getGroup(group)!.issue_url, null);

  const none = makeApp({ githubToken: '' }, { fetchFn: fn });
  const g2 = (await (await post(none.app, sampleReport())).json()).group;
  const r2 = await none.app.request(`/api/admin/groups/${g2}/issue`, { method: 'POST', headers: { cookie: adminCookie(none.store), 'x-crashreports-csrf': '1' }, body: '{}' });
  assert.match((await r2.json()).error, /GITHUB_TOKEN is not set/);
});
