/**
 * Source context for the AI analysis: find file:line locations in a panic message and the
 * top backtrace frames, map them to repo-relative paths, and fetch snippets from GitHub.
 */

import { toRepoPath } from './paths.ts';
import { appFrames } from './fingerprint.ts';

export { toRepoPath };

export interface SourceLocation {
  path: string;
  line: number;
}

export interface Snippet extends SourceLocation {
  ref: string;
  /** ±40 lines with line numbers. */
  text: string;
}

const MAX_LOCATIONS = 5;
const CONTEXT_LINES = 40;
const MAX_TOTAL_BYTES = 60 * 1024;
const LOC_RE = /((?:[a-z]:)?[\w.@~+\\/-]*\.(?:rs|ts|tsx|js|mjs|svelte|vue|toml|c|cpp|h)):(\d{1,6})(?::\d{1,5})?/gi;

/** Locations from the cause ("... at crates/x/src/y.rs:17") and the top app frames, deduped. */
export function extractLocations(message: string, backtrace: string, repoName: string, max = MAX_LOCATIONS): SourceLocation[] {
  const out: SourceLocation[] = [];
  const seen = new Set<string>();
  const push = (path: string | null, line: number) => {
    if (!path || line < 1 || out.length >= max) return;
    const key = `${path}:${line}`;
    if (seen.has(key)) return;
    seen.add(key);
    out.push({ path, line });
  };
  for (const m of message.matchAll(LOC_RE)) push(toRepoPath(m[1], repoName), Number(m[2]));
  for (const f of appFrames(backtrace, repoName)) push(f.path, f.line);
  return out;
}

/** A distinctive literal from the message for code search, or null. */
export function distinctiveLiteral(message: string): string | null {
  const firstLine = message.split(/\r?\n/)[0].replace(/^.*panicked at [^\s]+:\s*/, '');
  const quoted = [...firstLine.matchAll(/["'`]([^"'`]{10,100})["'`]/g)].map((m) => m[1]);
  const parts = quoted.length
    ? quoted
    : firstLine.split(/0x[0-9a-f]+|\d+|[\w.-]*\/[\w./-]+|[:{}()[\]]/i).map((s) => s.trim());
  const best = parts.filter((s) => s.length >= 10 && /[a-z]{3}/i.test(s)).sort((a, b) => b.length - a.length)[0];
  return best ? best.slice(0, 100).replace(/"/g, '') : null;
}

export function snippetAround(content: string, line: number, context = CONTEXT_LINES): string {
  const lines = content.split(/\r?\n/);
  const from = Math.max(1, line - context);
  const to = Math.min(lines.length, line + context);
  const width = String(to).length;
  const out: string[] = [];
  for (let n = from; n <= to; n++) {
    out.push(`${n === line ? '>' : ' '}${String(n).padStart(width)} | ${lines[n - 1]}`);
  }
  return out.join('\n');
}

export function blobUrl(repo: string, ref: string, path: string, line: number): string {
  return `https://github.com/${repo}/blob/${encodeURIComponent(ref)}/${path.split('/').map(encodeURIComponent).join('/')}#L${line}`;
}

export interface SourceFetcherOptions {
  fetchFn: typeof fetch;
  repo: string;
  token: string;
  /** Max cached files (ref+path); oldest entries are dropped first. */
  cacheSize?: number;
}

export class SourceFetcher {
  private cache = new Map<string, string | null>();
  private opts: SourceFetcherOptions;

  constructor(opts: SourceFetcherOptions) {
    this.opts = opts;
  }

  private headers(accept: string): Record<string, string> {
    const h: Record<string, string> = { Accept: accept, 'User-Agent': 'mumcord-crashreports' };
    if (this.opts.token) {
      h.Authorization = `Bearer ${this.opts.token}`;
      h['X-GitHub-Api-Version'] = '2022-11-28';
    }
    return h;
  }

  /** File content at ref, or null when it does not exist there. Throws on other errors. */
  async file(ref: string, path: string): Promise<string | null> {
    const key = `${ref}\u0000${path}`;
    if (this.cache.has(key)) return this.cache.get(key)!;
    const { repo, token, fetchFn } = this.opts;
    const encPath = path.split('/').map(encodeURIComponent).join('/');
    const url = token
      ? `https://api.github.com/repos/${repo}/contents/${encPath}?ref=${encodeURIComponent(ref)}`
      : `https://raw.githubusercontent.com/${repo}/${encodeURIComponent(ref)}/${encPath}`;
    const res = await fetchFn(url, {
      headers: this.headers(token ? 'application/vnd.github.raw+json' : 'text/plain'),
      signal: AbortSignal.timeout(10_000),
    });
    let content: string | null;
    if (res.status === 404) content = null;
    else if (!res.ok) throw new Error(`source fetch ${res.status}`);
    else content = (await res.text()).slice(0, 2_000_000);
    this.cache.set(key, content);
    const max = this.opts.cacheSize ?? 200;
    while (this.cache.size > max) this.cache.delete(this.cache.keys().next().value!);
    return content;
  }

  /** File at the version tag, falling back to main. */
  async fileForVersion(version: string, path: string): Promise<{ ref: string; content: string } | null> {
    for (const ref of [`v${version}`, 'main']) {
      const content = await this.file(ref, path);
      if (content !== null) return { ref, content };
    }
    return null;
  }

  /** GitHub code search for a literal (needs a token). Returns repo paths. */
  async searchCode(literal: string): Promise<string[]> {
    if (!this.opts.token) return [];
    const q = `"${literal}" repo:${this.opts.repo}`;
    const res = await this.opts.fetchFn(`https://api.github.com/search/code?per_page=3&q=${encodeURIComponent(q)}`, {
      headers: this.headers('application/vnd.github+json'),
      signal: AbortSignal.timeout(10_000),
    });
    if (!res.ok) throw new Error(`code search ${res.status}`);
    const json = (await res.json()) as { items?: { path?: unknown }[] };
    return (json.items ?? []).map((i) => i.path).filter((p): p is string => typeof p === 'string').slice(0, 2);
  }
}

/**
 * Collect snippets for a crash: locations from message/backtrace, else a code search for a
 * literal from the message. Never throws; returns what it could get.
 */
export async function gatherSnippets(
  fetcher: SourceFetcher,
  input: { message: string; backtrace: string; app_version: string },
  repoName: string,
): Promise<Snippet[]> {
  const snippets: Snippet[] = [];
  let total = 0;
  const add = (s: Snippet): boolean => {
    if (total + s.text.length > MAX_TOTAL_BYTES) return false;
    total += s.text.length;
    snippets.push(s);
    return true;
  };

  const locations = extractLocations(input.message, input.backtrace, repoName);
  for (const loc of locations) {
    try {
      const f = await fetcher.fileForVersion(input.app_version, loc.path);
      if (!f) continue;
      if (!add({ ...loc, ref: f.ref, text: snippetAround(f.content, loc.line) })) break;
    } catch {
      // network or API error for this file: skip it
    }
  }

  if (locations.length === 0) {
    const literal = distinctiveLiteral(input.message);
    if (literal) {
      try {
        for (const path of await fetcher.searchCode(literal)) {
          if (!toRepoPath(path, repoName)) continue;
          const f = await fetcher.fileForVersion(input.app_version, path);
          if (!f) continue;
          const idx = f.content.split(/\r?\n/).findIndex((l) => l.includes(literal));
          if (idx < 0) continue;
          if (!add({ path, line: idx + 1, ref: f.ref, text: snippetAround(f.content, idx + 1) })) break;
        }
      } catch {
        // code search is best effort
      }
    }
  }
  return snippets;
}
