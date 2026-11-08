// Public, read-only feed for mumcord.app: the latest Mumcord releases and a changelog entry per
// version and language, written by the AI from the GitHub release notes. Both are cached; an
// entry is only written again when the release notes change. The website prefers its own
// hand-written entries and uses these only for versions it doesn't have yet.

import { createHash } from 'node:crypto';
import type { DatabaseSync } from 'node:sqlite';
import { Hono } from 'hono';
import { AI_MODEL, type AnthropicLike } from './ai.ts';

export const SITE_LANGS: Record<string, string> = {
  de: 'German', en: 'English', bg: 'Bulgarian', cs: 'Czech', da: 'Danish', el: 'Greek', es: 'Spanish',
  et: 'Estonian', fi: 'Finnish', fr: 'French', ga: 'Irish', hr: 'Croatian', hu: 'Hungarian', it: 'Italian',
  lt: 'Lithuanian', lv: 'Latvian', mt: 'Maltese', nl: 'Dutch', pl: 'Polish', pt: 'Portuguese',
  ro: 'Romanian', sk: 'Slovak', sl: 'Slovenian', sv: 'Swedish',
};

type Platform = 'windows' | 'macos' | 'linux';
type Kind = 'setup' | 'portable' | 'dmg' | 'appimage' | 'deb' | 'rpm';
type Arch = 'x86_64' | 'arm64' | 'universal';

export interface SiteAsset { name: string; url: string; size: number; platform: Platform; kind: Kind; arch: Arch }
export interface SiteRelease {
  version: string;
  tag: string;
  name: string;
  url: string;
  publishedAt: string;
  prerelease: boolean;
  assets: SiteAsset[];
  checksums?: string;
}
export interface SiteChangelog {
  version: string;
  lang: string;
  generated: boolean;
  summary?: string;
  teaser?: string;
  groups?: { title: string; items: string[] }[];
  known?: string[];
  /** The raw "What's new" notes, when no AI entry could be written. */
  notes?: string;
}

interface GhRelease {
  tag_name: string;
  name: string | null;
  html_url: string;
  published_at: string;
  prerelease: boolean;
  draft: boolean;
  body?: string | null;
  assets: { name: string; browser_download_url: string; size: number }[];
}

function classify(name: string): Omit<SiteAsset, 'name' | 'url' | 'size'> | null {
  const n = name.toLowerCase();
  const arch: Arch = /aarch64|arm64/.test(n) ? 'arm64' : /universal/.test(n) ? 'universal' : 'x86_64';
  if (n.endsWith('.exe')) return { platform: 'windows', kind: 'setup', arch };
  if (n.endsWith('.zip') && n.includes('portable')) return { platform: 'windows', kind: 'portable', arch };
  if (n.endsWith('.dmg')) return { platform: 'macos', kind: 'dmg', arch };
  if (n.endsWith('.appimage')) return { platform: 'linux', kind: 'appimage', arch };
  if (n.endsWith('.deb')) return { platform: 'linux', kind: 'deb', arch };
  if (n.endsWith('.rpm')) return { platform: 'linux', kind: 'rpm', arch };
  return null;
}

/** The release notes' "What's new" part, without download tables and boilerplate. */
export function whatsNew(body: string): string {
  const i = body.search(/^##\s+What's new/im);
  return (i >= 0 ? body.slice(i) : body).trim().slice(0, 24_000);
}

const SYSTEM = `You write changelog entries for mumcord.app, the website of Mumcord, an alternative Mumble client for Windows, macOS and Linux.
Rewrite the release notes for people who use the app, not for developers:
- Plain, friendly sentences. In German use "du". Name things the way the app's menus name them.
- summary: two or three sentences on what this version brings.
- teaser: one short line listing the highlights.
- groups: titled like "New", "Improved", "Fixed" (translated). Merge tiny items, drop internal or build-only changes, at most 12 items per group, one or two sentences each.
- known: known limitations, only if the notes mention any.
- No markdown, no links, no emoji. Keep product names (Mumcord, Mumble, Mumbot, Skyloom) and keyboard keys as they are.
Write everything in the requested language.`;

const SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: ['summary', 'teaser', 'groups', 'known'],
  properties: {
    summary: { type: 'string' },
    teaser: { type: 'string' },
    groups: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['title', 'items'],
        properties: { title: { type: 'string' }, items: { type: 'array', items: { type: 'string' } } },
      },
    },
    known: { type: 'array', items: { type: 'string' } },
  },
} as const;

export interface SiteFeedOptions {
  db: DatabaseSync;
  repo: string;
  githubToken?: string;
  anthropic: AnthropicLike | null;
  aiTimeoutMs: number;
  fetchFn?: typeof fetch;
  now?: () => number;
  /** How long the release list is trusted before GitHub is asked again (default 2 min). */
  releasesTtlMs?: number;
}

const FAILURE_BACKOFF_MS = 10 * 60_000;

export class SiteFeed {
  private readonly o: Required<Omit<SiteFeedOptions, 'githubToken'>> & { githubToken: string };
  private list: { at: number; etag: string; raw: GhRelease[]; releases: SiteRelease[] } | null = null;
  private loading: Promise<void> | null = null;
  private readonly inflight = new Map<string, Promise<SiteChangelog>>();
  private readonly failedAt = new Map<string, number>();

  constructor(opts: SiteFeedOptions) {
    this.o = {
      fetchFn: fetch,
      now: Date.now,
      releasesTtlMs: 120_000,
      githubToken: '',
      ...opts,
    } as typeof this.o;
    this.o.db.exec(`CREATE TABLE IF NOT EXISTS site_changelog (
      version TEXT NOT NULL,
      lang TEXT NOT NULL,
      notes_hash TEXT NOT NULL,
      entry TEXT NOT NULL,
      created_at INTEGER NOT NULL,
      PRIMARY KEY (version, lang)
    )`);
  }

  private async refresh(): Promise<void> {
    const headers: Record<string, string> = { Accept: 'application/vnd.github+json', 'User-Agent': 'mumcord-site-feed' };
    if (this.o.githubToken) headers.Authorization = `Bearer ${this.o.githubToken}`;
    if (this.list?.etag) headers['If-None-Match'] = this.list.etag;
    const res = await this.o.fetchFn(`https://api.github.com/repos/${this.o.repo}/releases?per_page=30`, { headers });
    if (res.status === 304 && this.list) {
      this.list.at = this.o.now();
      return;
    }
    if (!res.ok) throw new Error(`GitHub answered ${res.status}`);
    const raw = ((await res.json()) as GhRelease[]).filter((r) => !r.draft);
    const releases = raw.map((r): SiteRelease => {
      const assets: SiteAsset[] = [];
      let checksums: string | undefined;
      for (const a of r.assets) {
        if (/sha256sums/i.test(a.name)) checksums = a.browser_download_url;
        const c = classify(a.name);
        if (c) assets.push({ name: a.name, url: a.browser_download_url, size: a.size, ...c });
      }
      return {
        version: r.tag_name.replace(/^v/, ''),
        tag: r.tag_name,
        name: r.name || r.tag_name,
        url: r.html_url,
        publishedAt: r.published_at,
        prerelease: r.prerelease,
        assets,
        checksums,
      };
    });
    this.list = { at: this.o.now(), etag: res.headers.get('etag') ?? '', raw, releases };
  }

  private async ensure(): Promise<void> {
    if (this.list && this.o.now() - this.list.at < this.o.releasesTtlMs) return;
    this.loading ??= this.refresh().finally(() => (this.loading = null));
    try {
      await this.loading;
    } catch (e) {
      if (!this.list) throw e; // keep serving the last good list while GitHub is unreachable
    }
  }

  /** Published releases, newest first. */
  async releases(): Promise<SiteRelease[]> {
    await this.ensure();
    return this.list!.releases;
  }

  /** The entry for one version and language, or null when the version doesn't exist. */
  async changelog(version: string, lang: string): Promise<SiteChangelog | null> {
    await this.ensure();
    const rel = this.list!.raw.find((r) => r.tag_name.replace(/^v/, '') === version);
    if (!rel) return null;
    const notes = whatsNew(rel.body ?? '');
    const hash = createHash('sha256').update(notes).digest('hex');
    const row = this.o.db
      .prepare('SELECT notes_hash, entry FROM site_changelog WHERE version = ? AND lang = ?')
      .get(version, lang) as { notes_hash: string; entry: string } | undefined;
    if (row && row.notes_hash === hash) return JSON.parse(row.entry) as SiteChangelog;

    const plain: SiteChangelog = { version, lang, generated: false, notes };
    const key = `${version}:${lang}`;
    if (!this.o.anthropic || !notes) return plain;
    if (this.o.now() - (this.failedAt.get(key) ?? -Infinity) < FAILURE_BACKOFF_MS) return row ? (JSON.parse(row.entry) as SiteChangelog) : plain;

    let job = this.inflight.get(key);
    if (!job) {
      job = this.write(version, lang, notes, hash).finally(() => this.inflight.delete(key));
      this.inflight.set(key, job);
    }
    try {
      return await job;
    } catch (e) {
      this.failedAt.set(key, this.o.now());
      console.warn(`[site] changelog ${key} failed: ${e instanceof Error ? e.message : e}`);
      return row ? (JSON.parse(row.entry) as SiteChangelog) : plain;
    }
  }

  private async write(version: string, lang: string, notes: string, hash: string): Promise<SiteChangelog> {
    const response = await this.o.anthropic!.messages.create(
      {
        model: AI_MODEL,
        max_tokens: 8000,
        system: SYSTEM,
        output_config: { effort: 'low', format: { type: 'json_schema', schema: SCHEMA } },
        messages: [{ role: 'user', content: `Language: ${SITE_LANGS[lang]}\nMumcord version: ${version}\n\nRelease notes:\n${notes}` }],
      },
      { timeout: this.o.aiTimeoutMs },
    );
    if (response.stop_reason === 'refusal' || response.stop_reason === 'max_tokens') throw new Error(`stopped: ${response.stop_reason}`);
    const text = response.content.find((b) => b.type === 'text');
    if (!text || text.type !== 'text') throw new Error('no text in the response');
    const o = JSON.parse(text.text) as Record<string, unknown>;
    const str = (v: unknown, max: number) => (typeof v === 'string' ? v.trim().slice(0, max) : '');
    const list = (v: unknown, max: number) =>
      Array.isArray(v) ? v.map((x) => str(x, 600)).filter(Boolean).slice(0, max) : [];
    const groups = Array.isArray(o.groups)
      ? o.groups
          .map((g) => ({ title: str((g as Record<string, unknown>).title, 60), items: list((g as Record<string, unknown>).items, 12) }))
          .filter((g) => g.title && g.items.length)
          .slice(0, 6)
      : [];
    const entry: SiteChangelog = {
      version,
      lang,
      generated: true,
      summary: str(o.summary, 800),
      teaser: str(o.teaser, 240),
      groups,
      known: list(o.known, 8),
    };
    if (!entry.summary || !groups.length) throw new Error('the entry has no summary or groups');
    this.o.db
      .prepare('INSERT OR REPLACE INTO site_changelog (version, lang, notes_hash, entry, created_at) VALUES (?, ?, ?, ?, ?)')
      .run(version, lang, hash, JSON.stringify(entry), this.o.now());
    return entry;
  }
}

const VERSION_RE = /^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/;

/** GET /releases and GET /changelog/:version?lang=xx, mounted under /api/site. */
export function siteRoutes(feed: SiteFeed): Hono {
  const r = new Hono();
  const unavailable = (c: { json: (b: unknown, s: 503) => Response }) => c.json({ error: 'release data is unavailable right now' }, 503);
  r.get('/releases', async (c) => {
    try {
      const releases = await feed.releases();
      c.header('Cache-Control', 'public, max-age=120');
      return c.json({ releases });
    } catch {
      return unavailable(c);
    }
  });
  r.get('/changelog/:version', async (c) => {
    const version = c.req.param('version');
    const lang = c.req.query('lang') ?? 'en';
    if (!VERSION_RE.test(version)) return c.json({ error: 'unknown version' }, 404);
    if (!SITE_LANGS[lang]) return c.json({ error: 'unknown language' }, 400);
    try {
      const entry = await feed.changelog(version, lang);
      if (!entry) return c.json({ error: 'unknown version' }, 404);
      c.header('Cache-Control', entry.generated ? 'public, max-age=3600' : 'public, max-age=300');
      return c.json(entry);
    } catch {
      return unavailable(c);
    }
  });
  return r;
}
