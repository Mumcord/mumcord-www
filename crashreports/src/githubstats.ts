import type { Store } from './db.ts';
import { attr, cardUrl, text, type Card, type MumbotNotifier } from './mumbot.ts';

/**
 * Daily GitHub statistics of an organisation, posted as one Mumcord card at a local time
 * (default 22:00 Europe/Berlin). Each day's numbers are stored as a snapshot; the card shows the
 * change against the previous one. The snapshot date is the guard against a second card per day.
 */

// ---------- time zone arithmetic (Intl only, DST-aware) ----------

interface Parts {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  second: number;
}

const formatters = new Map<string, Intl.DateTimeFormat>();

function partsIn(date: Date, tz: string): Parts {
  let f = formatters.get(tz);
  if (!f) {
    f = new Intl.DateTimeFormat('en-US', {
      timeZone: tz,
      hourCycle: 'h23',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
    formatters.set(tz, f);
  }
  const p: Record<string, number> = {};
  for (const { type, value } of f.formatToParts(date)) if (type !== 'literal') p[type] = Number(value);
  return { year: p.year, month: p.month, day: p.day, hour: p.hour, minute: p.minute, second: p.second };
}

/** Offset of `tz` from UTC at `date`, in ms (Berlin: +1 h in winter, +2 h in summer). */
function offsetMs(date: Date, tz: string): number {
  const p = partsIn(date, tz);
  const asUtc = Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute, p.second);
  return asUtc - Math.floor(date.getTime() / 1000) * 1000;
}

/** The instant of a wall-clock time in `tz`; a time skipped by DST is moved forward by the gap. */
export function zonedTime(year: number, month: number, day: number, hour: number, minute: number, tz: string): Date {
  const wall = Date.UTC(year, month - 1, day, hour, minute);
  const first = wall - offsetMs(new Date(wall), tz);
  const second = wall - offsetMs(new Date(first), tz);
  return new Date(second);
}

/** The local calendar date (YYYY-MM-DD) of `date` in `tz`. */
export function localDate(date: Date, tz: string): string {
  const p = partsIn(date, tz);
  return `${p.year}-${String(p.month).padStart(2, '0')}-${String(p.day).padStart(2, '0')}`;
}

export function parseTime(hhmm: string): { hour: number; minute: number } {
  const m = /^(\d{1,2}):(\d{2})$/.exec(hhmm.trim());
  if (!m || Number(m[1]) > 23 || Number(m[2]) > 59) throw new Error(`invalid time "${hhmm}", expected HH:MM`);
  return { hour: Number(m[1]), minute: Number(m[2]) };
}

/** Today's run time (local calendar day of `now` in `tz`). */
export function runTimeOn(now: Date, hhmm: string, tz: string): Date {
  const { hour, minute } = parseTime(hhmm);
  const p = partsIn(now, tz);
  return zonedTime(p.year, p.month, p.day, hour, minute, tz);
}

/** The next run strictly after `now`. */
export function nextRun(now: Date, hhmm: string, tz: string): Date {
  const today = runTimeOn(now, hhmm, tz);
  if (today.getTime() > now.getTime()) return today;
  const { hour, minute } = parseTime(hhmm);
  const p = partsIn(now, tz);
  // Noon UTC of the next calendar day avoids any DST edge when moving the date forward.
  const next = new Date(Date.UTC(p.year, p.month - 1, p.day + 1, 12));
  return zonedTime(next.getUTCFullYear(), next.getUTCMonth() + 1, next.getUTCDate(), hour, minute, tz);
}

// ---------- GitHub REST API ----------

export interface StatsSnapshot {
  followers: number;
  stars: number;
  openIssues: number;
  openPrs: number;
  newIssues: number;
  newPrs: number;
  /** Stars per public, non-archived, non-fork repo. */
  repos: Record<string, number>;
}

export interface GithubApi {
  fetchFn: typeof fetch;
  token?: string;
  timeoutMs?: number;
}

async function getJson<T>(api: GithubApi, path: string): Promise<T> {
  const headers: Record<string, string> = {
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
    'User-Agent': 'mumcord-crashreports',
  };
  if (api.token) headers.Authorization = `Bearer ${api.token}`;
  const res = await api.fetchFn(`https://api.github.com${path}`, { headers, signal: AbortSignal.timeout(api.timeoutMs ?? 15_000) });
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`GitHub API ${path.split('?')[0]} answered ${res.status}: ${body.slice(0, 200)}`);
  }
  return (await res.json()) as T;
}

async function searchCount(api: GithubApi, q: string): Promise<number> {
  const r = await getJson<{ total_count?: number }>(api, `/search/issues?per_page=1&q=${encodeURIComponent(q)}`);
  if (typeof r.total_count !== 'number') throw new Error(`search "${q}" returned no total_count`);
  return r.total_count;
}

/** `YYYY-MM-DDTHH:MM:SSZ`, the form GitHub search takes. */
const isoSeconds = (d: Date) => d.toISOString().replace(/\.\d{3}Z$/, 'Z');

export async function fetchStats(api: GithubApi, org: string, now: Date): Promise<StatsSnapshot> {
  const o = encodeURIComponent(org);
  const info = await getJson<{ followers?: number }>(api, `/orgs/${o}`);
  const repos: Record<string, number> = {};
  for (let page = 1; page <= 50; page++) {
    const list = await getJson<{ name: string; stargazers_count?: number; archived?: boolean; fork?: boolean }[]>(
      api,
      `/orgs/${o}/repos?type=public&per_page=100&page=${page}`,
    );
    for (const r of list) if (!r.archived && !r.fork) repos[r.name] = r.stargazers_count ?? 0;
    if (list.length < 100) break;
  }
  const since = isoSeconds(new Date(now.getTime() - 86_400_000));
  const [openIssues, openPrs, newIssues, newPrs] = [
    await searchCount(api, `is:issue is:open org:${org}`),
    await searchCount(api, `is:pr is:open org:${org}`),
    await searchCount(api, `is:issue org:${org} created:>=${since}`),
    await searchCount(api, `is:pr org:${org} created:>=${since}`),
  ];
  return {
    followers: info.followers ?? 0,
    stars: Object.values(repos).reduce((a, b) => a + b, 0),
    openIssues,
    openPrs,
    newIssues,
    newPrs,
    repos,
  };
}

// ---------- card ----------

/** ` (+3)`, ` (−2)`, ` (±0)`; nothing without a previous snapshot. */
export function delta(now: number, prev: number | undefined): string {
  if (prev === undefined) return '';
  const d = now - prev;
  return d > 0 ? ` (+${d})` : d < 0 ? ` (−${-d})` : ' (±0)';
}

/** Up to three repos with the most stars gained since the previous snapshot. */
export function topGainers(cur: StatsSnapshot, prev: StatsSnapshot | null, n = 3): { name: string; gained: number }[] {
  if (!prev) return [];
  return Object.entries(cur.repos)
    .filter(([name]) => name in prev.repos)
    .map(([name, stars]) => ({ name, gained: stars - prev.repos[name] }))
    .filter((r) => r.gained > 0)
    .sort((a, b) => b.gained - a.gained || a.name.localeCompare(b.name))
    .slice(0, n);
}

const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;

export function buildStatsCard(org: string, date: string, cur: StatsSnapshot, prev: StatsSnapshot | null): Card {
  const lines = [
    `- Stars: ★ ${cur.stars}${delta(cur.stars, prev?.stars)}`,
    `- Followers: ${cur.followers}${delta(cur.followers, prev?.followers)}`,
    `- Open issues: ${cur.openIssues}${delta(cur.openIssues, prev?.openIssues)}`,
    `- Open PRs: ${cur.openPrs}${delta(cur.openPrs, prev?.openPrs)}`,
    `- New in 24 h: ${plural(cur.newIssues, 'issue', 'issues')}, ${plural(cur.newPrs, 'PR', 'PRs')}`,
  ];
  const top = topGainers(cur, prev);
  if (top.length) lines.push(`- Most new stars: ${top.map((r) => `${text(r.name, 60)} +${r.gained}`).join(', ')}`);
  return {
    title: attr(`${org} on GitHub · ${date}`, 120),
    color: null,
    icon: 'chart',
    url: cardUrl(`https://github.com/${encodeURIComponent(org)}`),
    lines,
  };
}

// ---------- scheduler ----------

export interface GithubStatsOptions {
  store: Store;
  mumbot: Pick<MumbotNotifier, 'postCard' | 'enabled'>;
  org: string;
  time: string;
  tz: string;
  fetchFn?: typeof fetch;
  token?: string;
  now?: () => Date;
  setTimer?: (fn: () => void, ms: number) => unknown;
  clearTimer?: (t: unknown) => void;
  log?: Pick<Console, 'log' | 'warn'>;
}

export class GithubStats {
  private timer: unknown = null;
  private running: Promise<void> | null = null;
  private stopped = false;
  private readonly now: () => Date;
  private readonly log: Pick<Console, 'log' | 'warn'>;
  private readonly opts: GithubStatsOptions;

  constructor(opts: GithubStatsOptions) {
    this.opts = opts;
    this.now = opts.now ?? (() => new Date());
    this.log = opts.log ?? console;
    parseTime(opts.time);
    localDate(new Date(0), opts.tz); // throws RangeError on an unknown time zone
  }

  /**
   * Runs the day's statistics when the run time has passed and the day has no snapshot yet.
   * Resolves to true when a card was posted. Never throws.
   */
  async runIfDue(): Promise<boolean> {
    if (this.running) {
      await this.running;
      return false;
    }
    let posted = false;
    this.running = (async () => {
      const { store, org, time, tz } = this.opts;
      const now = this.now();
      if (now.getTime() < runTimeOn(now, time, tz).getTime()) return;
      const date = localDate(now, tz);
      if (store.hasGithubStats(org, date)) return;
      let cur: StatsSnapshot;
      try {
        cur = await fetchStats({ fetchFn: this.opts.fetchFn ?? fetch, token: this.opts.token }, org, now);
      } catch (e) {
        this.log.warn(`github stats: skipped ${date}: ${e instanceof Error ? e.message : String(e)}`);
        return;
      }
      const prev = store.previousGithubStats<StatsSnapshot>(org, date)?.data ?? null;
      // The snapshot is the day's claim: it is written before the post, so a restart never posts twice.
      if (!store.saveGithubStats(org, date, cur, now)) return;
      posted = await this.opts.mumbot.postCard(buildStatsCard(org, date, cur, prev), `GitHub stats ${date}`);
    })()
      .catch((e) => this.log.warn(`github stats: ${e instanceof Error ? e.message : String(e)}`))
      .finally(() => {
        this.running = null;
      });
    await this.running;
    return posted;
  }

  /** Runs now if today's time has passed (catch-up after downtime), then at every run time. */
  start(): void {
    this.stopped = false;
    void this.tick();
  }

  stop(): void {
    this.stopped = true;
    if (this.timer !== null) (this.opts.clearTimer ?? ((t) => clearTimeout(t as NodeJS.Timeout)))(this.timer);
    this.timer = null;
  }

  /** The instant the next timer is set for (tests, log). */
  nextRunAt(): Date {
    return nextRun(this.now(), this.opts.time, this.opts.tz);
  }

  private async tick(): Promise<void> {
    await this.runIfDue();
    if (this.stopped) return;
    const at = this.nextRunAt();
    // A timer that fires a little early finds nothing due and simply sets itself again.
    const ms = Math.max(1_000, at.getTime() - this.now().getTime());
    const set = this.opts.setTimer ?? ((fn, d) => {
      const t = setTimeout(fn, d);
      t.unref();
      return t;
    });
    this.timer = set(() => void this.tick(), ms);
  }
}
