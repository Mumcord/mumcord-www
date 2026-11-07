import type { GroupRow } from './db.ts';
import type { Analysis } from './ai.ts';
import { redactHome } from './fingerprint.ts';
import { extractLocations } from './source.ts';

/**
 * Channel notification through a Mumbot webhook bot (Mumbot 0.5.x, docs/webhook.md):
 * `POST /message` with `X-API-Key: <key>` and `{"channel": <id>, "message": "<text>"}`.
 *
 * Mumbot has no card object (Mumcord/mumbot#13 was closed as not planned) and escapes all HTML,
 * so the card is sent as Mumcord's typed BB code `[card …]…[/card]` (Mumcord docs/message-cards.md,
 * ui/src/features/chat/cards.ts), which Mumcord renders as a message card. Official Mumble clients
 * show the BB code as text.
 *
 * Two details of Mumbot's Markdown renderer matter:
 * - it turns every lowercase `http://` / `https://` run into an `<a href="…">` link, which would
 *   break a quoted card attribute, so the card URL is sent with an upper-case scheme
 *   (`HTTPS://…`); Mumcord accepts and opens it (its URL checks ignore case);
 * - `*` and backticks become markup, so values put into attributes are stripped of them.
 *
 * Only aggregate data goes into the card: title, severity, component, AI summary, versions,
 * OS + arch, kind, count and a source location. Never log lines, the user note or system details.
 */

export const NOTIFY_COOLDOWN_MS = 3_600_000;
export const WEBHOOK_TIMEOUT_MS = 5_000;
/** How long a new group's card waits for the AI analysis. */
export const AI_WAIT_MS = 30_000;

/** Mumcord's status colours (docs/message-cards.md); null is the neutral accent stripe. */
export type CardColor = 'info' | 'success' | 'warning' | 'error' | null;
/** Mumcord's built-in card icons. */
export type CardIcon = 'info' | 'check' | 'warning' | 'error' | 'bell' | 'chart' | 'server' | 'bot';
type Level = Analysis['severity'];

export interface CardInput {
  group: GroupRow;
  /** The report that triggered the post: only version, OS, arch and backtrace locations are used. */
  latest: { app_version: string; os: string; arch: string; backtrace: string } | null;
  regression: boolean;
  previousStatus?: string | null;
  origin: string;
  repoName?: string;
}

export interface Card {
  title: string;
  color: CardColor;
  icon: CardIcon;
  url: string;
  lines: string[];
}

const oneLine = (s: string) => s.replace(/\s+/g, ' ').trim();
const clip = (s: string, max: number) => (s.length > max ? `${s.slice(0, max - 1).trimEnd()}…` : s);

/** A value inside a quoted BB code attribute: no quotes, brackets, markup or auto-linked URLs. */
export function attr(s: string, max: number): string {
  const v = oneLine(s.replace(/["`*[\]<>]/g, ''));
  return clip(v, max).replace(/https?:\/\//gi, (m) => m.toUpperCase());
}

/** A line of card text: Mumbot Markdown subset, so no stray markers and no BB code brackets. */
export function text(s: string, max: number): string {
  return clip(oneLine(s.replace(/[`*]/g, '').replace(/\[/g, '(').replace(/\]/g, ')')), max);
}

function code(s: string, max: number): string {
  const v = clip(oneLine(s.replace(/[`[\]]/g, '')), max);
  return v ? `\`${v}\`` : '';
}

/** Severity from the AI, or from the kind when there is no analysis. */
export function levelOf(group: GroupRow): Level {
  if (group.ai) return group.ai.severity;
  const kind = group.kind.toLowerCase();
  if (kind.startsWith('signal') || kind === 'crash') return 'critical';
  if (kind === 'panic') return 'high';
  if (kind === 'hang') return 'medium';
  return 'low';
}

/** critical/high red, medium orange; low has no status colour (Mumcord's neutral accent stripe). */
export function colorOf(level: Level): CardColor {
  if (level === 'critical' || level === 'high') return 'error';
  if (level === 'medium') return 'warning';
  return null;
}

/** A card URL with an upper-case scheme, so Mumbot does not turn it into a link. */
export function cardUrl(url: string): string {
  return url.replace(/^https?:/i, (m) => m.toUpperCase());
}

/** Deep link into the admin UI. */
export function groupLink(origin: string, groupId: string): string {
  const base = origin.replace(/\/+$/, '');
  return cardUrl(`${base}/#/groups/${encodeURIComponent(groupId)}`);
}

function suspectLocation(input: CardInput): string {
  const ai = input.group.ai?.suspect_location?.trim();
  if (ai) return redactHome(ai);
  const loc = extractLocations(input.group.message, input.latest?.backtrace ?? '', input.repoName ?? 'mumcord', 1)[0];
  return loc ? `${loc.path}:${loc.line}` : '';
}

export function buildCard(input: CardInput): Card {
  const { group } = input;
  const ai = group.ai;
  const level = levelOf(group);
  const color = colorOf(level);
  const cause = redactHome(group.message.split('\n').find((l) => l.trim()) ?? group.kind);
  const title = ai?.title?.trim() ? attr(ai.title, 120) : attr(`Crash: ${cause}`, 120);

  const lines: string[] = [];
  if (input.regression) {
    const was = input.previousStatus === 'ignored' ? 'ignored' : 'fixed';
    lines.push(`**Regression**: marked ${was}, seen again`);
  }
  if (ai) {
    const label = level[0].toUpperCase() + level.slice(1);
    const component = text(ai.component ?? '', 40);
    lines.push(component ? `**${label}** · ${component}` : `**${label}**`);
    const summary = text(ai.summary ?? '', 240);
    if (summary) lines.push(summary);
  }
  const versions = group.versions.slice(-5).map((v) => text(v, 32)).filter(Boolean);
  if (versions.length) lines.push(`- ${versions.length > 1 ? 'Versions' : 'Version'}: ${versions.join(', ')}`);
  const os = input.latest ? text([input.latest.os, input.latest.arch].filter(Boolean).join(' '), 64) : '';
  if (os) lines.push(`- OS: ${os}`);
  lines.push(`- Kind: ${text(group.kind, 40)}`);
  lines.push(`- Count: ${group.count}`);
  const suspect = code(suspectLocation(input), 160);
  if (suspect) lines.push(`- Suspect: ${suspect}`);

  return {
    title,
    color,
    icon: color === 'error' ? 'error' : color === 'warning' ? 'warning' : 'info',
    url: groupLink(input.origin, group.id),
    lines,
  };
}

/** Mumcord's typed BB code for the card, written as Mumbot Markdown. */
export function cardMessage(card: Card): string {
  const attrs = [`title="${card.title}"`];
  if (card.color) attrs.push(`color=${card.color}`);
  attrs.push(`icon=${card.icon}`, `url="${card.url}"`);
  return [`[card ${attrs.join(' ')}]`, ...card.lines, '[/card]'].join('\n');
}

export interface MumbotPayload {
  channel: number;
  message: string;
}

export function buildPayload(channel: number, input: CardInput): MumbotPayload {
  return { channel, message: cardMessage(buildCard(input)) };
}

export interface MumbotOptions {
  url: string;
  token: string;
  channel: string;
  fetchFn?: typeof fetch;
  cooldownMs?: number;
  timeoutMs?: number;
  now?: () => number;
  log?: Pick<Console, 'log' | 'warn'>;
}

export class MumbotNotifier {
  private readonly last = new Map<string, number>();
  private channelId: number | null = null;
  private readonly fetchFn: typeof fetch;
  private readonly now: () => number;
  private readonly log: Pick<Console, 'log' | 'warn'>;
  private readonly opts: MumbotOptions;

  constructor(opts: MumbotOptions) {
    this.opts = opts;
    this.fetchFn = opts.fetchFn ?? fetch;
    this.now = opts.now ?? Date.now;
    this.log = opts.log ?? console;
    if (/^\d+$/.test(opts.channel)) this.channelId = Number(opts.channel);
  }

  /** On only with URL, API key and channel (Mumbot rejects requests without a key). */
  get enabled(): boolean {
    return !!(this.opts.url && this.opts.token && this.opts.channel);
  }

  /** Reserves the group's slot: false when a card for it went out within the cooldown. */
  claim(groupId: string): boolean {
    if (!this.enabled) return false;
    const now = this.now();
    const prev = this.last.get(groupId);
    if (prev !== undefined && now - prev < (this.opts.cooldownMs ?? NOTIFY_COOLDOWN_MS)) return false;
    this.last.set(groupId, now);
    if (this.last.size > 10_000) {
      for (const [id, at] of this.last) if (now - at >= (this.opts.cooldownMs ?? NOTIFY_COOLDOWN_MS)) this.last.delete(id);
    }
    return true;
  }

  private signal() {
    return AbortSignal.timeout(this.opts.timeoutMs ?? WEBHOOK_TIMEOUT_MS);
  }

  /** Channel id: the configured number, or the name looked up in Mumbot's `GET /channels`. */
  private async resolveChannel(): Promise<number> {
    if (this.channelId !== null) return this.channelId;
    const res = await this.fetchFn(new URL('channels', this.opts.url), {
      headers: { 'X-API-Key': this.opts.token },
      signal: this.signal(),
    });
    if (!res.ok) throw new Error(`GET /channels answered ${res.status}`);
    const body = (await res.json()) as { channels?: { id: number; name: string }[] };
    const list = body.channels ?? [];
    const want = this.opts.channel;
    const hit = list.find((c) => c.name === want) ?? list.find((c) => c.name.toLowerCase() === want.toLowerCase());
    if (!hit) throw new Error(`channel "${want}" is not among the channels this key may write to`);
    this.channelId = hit.id;
    return hit.id;
  }

  /** Posts the crash group's card. Never throws; failures are logged. */
  post(input: CardInput): Promise<boolean> {
    return this.postCard(buildCard(input), `card for group ${input.group.id.slice(0, 12)}`);
  }

  /** Posts any card to the configured channel. Never throws; failures are logged under `what`. */
  async postCard(card: Card, what: string): Promise<boolean> {
    if (!this.enabled) return false;
    try {
      const payload: MumbotPayload = { channel: await this.resolveChannel(), message: cardMessage(card) };
      const res = await this.fetchFn(this.opts.url, {
        method: 'POST',
        headers: { 'content-type': 'application/json', 'X-API-Key': this.opts.token },
        body: JSON.stringify(payload),
        signal: this.signal(),
      });
      if (!res.ok) {
        const reason = (await res.text().catch(() => '')).slice(0, 200);
        this.log.warn(`mumbot: ${what} failed: ${res.status} ${reason}`);
        return false;
      }
      this.log.log(`mumbot: ${what} posted to channel ${payload.channel}`);
      return true;
    } catch (e) {
      this.log.warn(`mumbot: ${what} failed: ${e instanceof Error ? e.message : String(e)}`);
      return false;
    }
  }
}
