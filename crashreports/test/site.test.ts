import { test } from 'node:test';
import assert from 'node:assert/strict';
import { DatabaseSync } from 'node:sqlite';
import { SiteFeed, siteRoutes, whatsNew } from '../src/site.ts';
import type { AnthropicLike } from '../src/ai.ts';

const BODY = '## Downloads\n\n- big table\n\n## What\'s new in 0.8.0\n\n### Added\n\n- Kick and ban from the person menu';

function gh(body = BODY) {
  return [
    {
      tag_name: 'v0.8.0',
      name: 'Mumcord 0.8.0',
      html_url: 'https://github.com/Mumcord/mumcord/releases/tag/v0.8.0',
      published_at: '2026-11-20T10:00:00Z',
      prerelease: true,
      draft: false,
      body,
      assets: [
        { name: 'Mumcord_0.8.0_x64-setup.exe', browser_download_url: 'https://x/setup.exe', size: 1 },
        { name: 'Mumcord_0.8.0_aarch64.dmg', browser_download_url: 'https://x/a.dmg', size: 2 },
        { name: 'Mumcord_0.8.0_amd64.AppImage.sig', browser_download_url: 'https://x/sig', size: 3 },
        { name: 'SHA256SUMS', browser_download_url: 'https://x/sums', size: 4 },
      ],
    },
    { tag_name: 'v0.7.9', name: null, html_url: 'h', published_at: 'p', prerelease: false, draft: true, body: '', assets: [] },
  ];
}

function setup(opts: { body?: () => string; fail?: boolean } = {}) {
  let ghCalls = 0;
  let aiCalls = 0;
  let clock = 0;
  const fetchFn = (async () => {
    ghCalls++;
    return new Response(JSON.stringify(gh(opts.body?.())), { status: 200, headers: { etag: 'e1' } });
  }) as typeof fetch;
  const anthropic: AnthropicLike = {
    messages: {
      create: (async (req: { messages: { content: string }[] }) => {
        aiCalls++;
        if (opts.fail) throw new Error('boom');
        const lang = /Language: (\w+)/.exec(req.messages[0].content)![1];
        return {
          stop_reason: 'end_turn',
          content: [{ type: 'text', text: JSON.stringify({ summary: `Summary in ${lang}`, teaser: 't', groups: [{ title: 'New', items: ['Kick'] }], known: [] }) }],
        };
      }) as unknown as AnthropicLike['messages']['create'],
    },
  };
  const feed = new SiteFeed({ db: new DatabaseSync(':memory:'), repo: 'Mumcord/mumcord', anthropic, aiTimeoutMs: 1000, fetchFn, now: () => clock });
  return { feed, app: siteRoutes(feed), calls: () => ({ ghCalls, aiCalls }), tick: (ms: number) => (clock += ms) };
}

test('whatsNew drops the download part of the notes', () => {
  assert.match(whatsNew(BODY), /^## What's new in 0\.8\.0/);
  assert.equal(whatsNew('plain notes'), 'plain notes');
});

test('releases: drafts are left out, assets classified, list cached', async () => {
  const { app, calls } = setup();
  const res = await app.request('/releases');
  assert.equal(res.status, 200);
  const { releases } = (await res.json()) as { releases: { version: string; assets: { kind: string; arch: string }[]; checksums: string }[] };
  assert.equal(releases.length, 1);
  assert.equal(releases[0].version, '0.8.0');
  assert.deepEqual(releases[0].assets.map((a) => `${a.kind}/${a.arch}`), ['setup/x86_64', 'dmg/arm64']);
  assert.equal(releases[0].checksums, 'https://x/sums');
  await app.request('/releases');
  assert.equal(calls().ghCalls, 1);
});

test('changelog: written once per version and language, then served from the cache', async () => {
  const { app, calls } = setup();
  const a = (await (await app.request('/changelog/0.8.0?lang=de')).json()) as { summary: string; generated: boolean };
  assert.equal(a.generated, true);
  assert.equal(a.summary, 'Summary in German');
  await app.request('/changelog/0.8.0?lang=de');
  await app.request('/changelog/0.8.0?lang=fr');
  assert.equal(calls().aiCalls, 2);
});

test('changelog: changed release notes are written again', async () => {
  let body = BODY;
  const { app, calls, tick } = setup({ body: () => body });
  await app.request('/changelog/0.8.0?lang=en');
  body = `${BODY}\n- Ban list`;
  tick(10 * 60_000);
  await app.request('/changelog/0.8.0?lang=en');
  assert.equal(calls().aiCalls, 2);
});

test('changelog: unknown versions and languages are refused', async () => {
  const { app } = setup();
  assert.equal((await app.request('/changelog/9.9.9?lang=en')).status, 404);
  assert.equal((await app.request('/changelog/..%2Fetc?lang=en')).status, 404);
  assert.equal((await app.request('/changelog/0.8.0?lang=xx')).status, 400);
});

test('changelog: when the AI fails, the raw notes are served and retried only later', async () => {
  const { app, calls } = setup({ fail: true });
  const a = (await (await app.request('/changelog/0.8.0?lang=en')).json()) as { generated: boolean; notes: string };
  assert.equal(a.generated, false);
  assert.match(a.notes, /Kick and ban/);
  await app.request('/changelog/0.8.0?lang=en');
  assert.equal(calls().aiCalls, 1);
});
