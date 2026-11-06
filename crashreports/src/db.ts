import { DatabaseSync } from 'node:sqlite';
import { randomUUID } from 'node:crypto';
import { kindLabel, type CrashReport } from './report.ts';
import type { FingerprintResult } from './fingerprint.ts';
import type { Analysis } from './ai.ts';

export const STATUSES = ['new', 'triaged', 'fixed', 'ignored'] as const;
export type Status = (typeof STATUSES)[number];

/** Reports kept per group; older ones are pruned on ingest. */
const MAX_REPORTS_PER_GROUP = 50;

export interface GroupRow {
  id: string;
  kind: string;
  message: string;
  top_frames: string[];
  count: number;
  first_seen: string;
  last_seen: string;
  versions: string[];
  os_list: string[];
  status: Status;
  issue_url: string | null;
  ai: Analysis | null;
  ai_status: 'none' | 'pending' | 'done' | 'error';
  ai_error: string | null;
  ai_at: string | null;
  /** Grouped by signal + thread + log module only (no backtrace). */
  weak: boolean;
}

export interface ReportRow extends CrashReport {
  id: string;
  group_id: string;
  created_at: string;
}

export interface CredentialRow {
  id: string;
  public_key: Uint8Array;
  counter: number;
  transports: string[];
  name: string;
  created_at: string;
}

const SCHEMA = `
PRAGMA journal_mode = WAL;
PRAGMA foreign_keys = ON;
CREATE TABLE IF NOT EXISTS groups (
  id TEXT PRIMARY KEY,
  kind TEXT NOT NULL,
  message TEXT NOT NULL,
  top_frames TEXT NOT NULL,
  count INTEGER NOT NULL DEFAULT 0,
  first_seen TEXT NOT NULL,
  last_seen TEXT NOT NULL,
  versions TEXT NOT NULL DEFAULT '[]',
  os_list TEXT NOT NULL DEFAULT '[]',
  status TEXT NOT NULL DEFAULT 'new',
  issue_url TEXT,
  ai_json TEXT,
  ai_status TEXT NOT NULL DEFAULT 'none',
  ai_error TEXT,
  ai_at TEXT,
  weak INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS groups_last_seen ON groups(last_seen);
CREATE TABLE IF NOT EXISTS reports (
  id TEXT PRIMARY KEY,
  group_id TEXT NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  created_at TEXT NOT NULL,
  app_version TEXT NOT NULL,
  os TEXT NOT NULL,
  os_version TEXT NOT NULL,
  arch TEXT NOT NULL,
  kind TEXT NOT NULL,
  signal TEXT,
  thread TEXT,
  message TEXT NOT NULL,
  uptime TEXT,
  crash_time TEXT,
  running_json TEXT NOT NULL DEFAULT '{}',
  system_json TEXT NOT NULL DEFAULT '{}',
  backtrace TEXT NOT NULL,
  log_tail TEXT,
  user_note TEXT,
  install_id TEXT,
  raw TEXT
);
CREATE INDEX IF NOT EXISTS reports_group ON reports(group_id, created_at);
CREATE TABLE IF NOT EXISTS credentials (
  id TEXT PRIMARY KEY,
  public_key BLOB NOT NULL,
  counter INTEGER NOT NULL,
  transports TEXT NOT NULL DEFAULT '[]',
  name TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS sessions (
  token_hash TEXT PRIMARY KEY,
  created_at TEXT NOT NULL,
  expires_at TEXT NOT NULL
);
`;

type Row = Record<string, unknown>;

function addUnique(jsonList: string, value: string, max = 50): string {
  const list = JSON.parse(jsonList) as string[];
  if (!list.includes(value)) list.push(value);
  return JSON.stringify(list.slice(-max));
}

function toGroup(r: Row): GroupRow {
  return {
    id: r.id as string,
    kind: r.kind as string,
    message: r.message as string,
    top_frames: JSON.parse(r.top_frames as string),
    count: r.count as number,
    first_seen: r.first_seen as string,
    last_seen: r.last_seen as string,
    versions: JSON.parse(r.versions as string),
    os_list: JSON.parse(r.os_list as string),
    status: r.status as Status,
    issue_url: (r.issue_url as string | null) ?? null,
    ai: r.ai_json ? JSON.parse(r.ai_json as string) : null,
    ai_status: r.ai_status as GroupRow['ai_status'],
    ai_error: (r.ai_error as string | null) ?? null,
    ai_at: (r.ai_at as string | null) ?? null,
    weak: r.weak === 1,
  };
}

function toReport(r: Row): ReportRow {
  const { running_json, system_json, ...rest } = r;
  return {
    ...(rest as unknown as ReportRow),
    running: JSON.parse(running_json as string),
    system: JSON.parse(system_json as string),
  };
}

export class Store {
  readonly db: DatabaseSync;

  constructor(path: string) {
    this.db = new DatabaseSync(path);
    this.db.exec(SCHEMA);
  }

  close(): void {
    this.db.close();
  }

  // ---- reports & groups ----

  ingest(input: CrashReport, fp: FingerprintResult, now = new Date()): { id: string; isNew: boolean } {
    const ts = now.toISOString();
    const id = randomUUID();
    const groupId = fp.id;
    const osLabel = [input.os, input.arch, input.os_version && `(${input.os_version})`].filter(Boolean).join(' ');
    this.db.exec('BEGIN IMMEDIATE');
    try {
      const existing = this.db.prepare('SELECT versions, os_list FROM groups WHERE id = ?').get(groupId) as Row | undefined;
      if (existing) {
        this.db
          .prepare('UPDATE groups SET count = count + 1, last_seen = ?, versions = ?, os_list = ? WHERE id = ?')
          .run(ts, addUnique(existing.versions as string, input.app_version), addUnique(existing.os_list as string, osLabel), groupId);
      } else {
        this.db
          .prepare(
            `INSERT INTO groups (id, kind, message, top_frames, count, first_seen, last_seen, versions, os_list, weak)
             VALUES (?, ?, ?, ?, 1, ?, ?, ?, ?, ?)`,
          )
          .run(groupId, kindLabel(input), input.message.slice(0, 1000), JSON.stringify(fp.frames), ts, ts,
            JSON.stringify([input.app_version]), JSON.stringify([osLabel]), fp.weak ? 1 : 0);
      }
      this.db
        .prepare(
          `INSERT INTO reports (id, group_id, created_at, app_version, os, os_version, arch, kind, signal, thread, message,
             uptime, crash_time, running_json, system_json, backtrace, log_tail, user_note, install_id, raw)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        )
        .run(id, groupId, ts, input.app_version, input.os, input.os_version, input.arch, input.kind, input.signal,
          input.thread, input.message, input.uptime, input.crash_time, JSON.stringify(input.running),
          JSON.stringify(input.system), input.backtrace, input.log_tail, input.user_note, input.install_id, input.raw);
      this.db
        .prepare(
          `DELETE FROM reports WHERE group_id = ? AND id NOT IN
             (SELECT id FROM reports WHERE group_id = ? ORDER BY created_at DESC, rowid DESC LIMIT ?)`,
        )
        .run(groupId, groupId, MAX_REPORTS_PER_GROUP);
      this.db.exec('COMMIT');
      return { id, isNew: !existing };
    } catch (e) {
      this.db.exec('ROLLBACK');
      throw e;
    }
  }

  listGroups(opts: { q?: string; status?: string; limit?: number } = {}): GroupRow[] {
    const where: string[] = [];
    const args: (string | number)[] = [];
    if (opts.status && (STATUSES as readonly string[]).includes(opts.status)) {
      where.push('status = ?');
      args.push(opts.status);
    }
    if (opts.q) {
      const like = `%${opts.q.replace(/[\\%_]/g, (m) => '\\' + m)}%`;
      where.push(`(message LIKE ? ESCAPE '\\' OR top_frames LIKE ? ESCAPE '\\' OR versions LIKE ? ESCAPE '\\' OR ai_json LIKE ? ESCAPE '\\' OR id LIKE ? ESCAPE '\\')`);
      args.push(like, like, like, like, like);
    }
    const sql = `SELECT * FROM groups ${where.length ? 'WHERE ' + where.join(' AND ') : ''} ORDER BY last_seen DESC LIMIT ?`;
    args.push(Math.min(opts.limit ?? 200, 1000));
    return (this.db.prepare(sql).all(...args) as Row[]).map(toGroup);
  }

  getGroup(id: string): GroupRow | null {
    const r = this.db.prepare('SELECT * FROM groups WHERE id = ?').get(id) as Row | undefined;
    return r ? toGroup(r) : null;
  }

  latestReports(groupId: string, limit = 20): ReportRow[] {
    return (this.db
      .prepare('SELECT * FROM reports WHERE group_id = ? ORDER BY created_at DESC, rowid DESC LIMIT ?')
      .all(groupId, limit) as Row[]).map(toReport);
  }

  setStatus(id: string, status: Status): boolean {
    return this.db.prepare('UPDATE groups SET status = ? WHERE id = ?').run(status, id).changes > 0;
  }

  setIssueUrl(id: string, url: string): void {
    this.db.prepare('UPDATE groups SET issue_url = ? WHERE id = ?').run(url, id);
  }

  setAiPending(id: string): void {
    this.db.prepare(`UPDATE groups SET ai_status = 'pending', ai_error = NULL WHERE id = ?`).run(id);
  }

  setAiResult(id: string, analysis: Analysis): void {
    this.db
      .prepare(`UPDATE groups SET ai_json = ?, ai_status = 'done', ai_error = NULL, ai_at = ? WHERE id = ?`)
      .run(JSON.stringify(analysis), new Date().toISOString(), id);
  }

  setAiError(id: string, error: string): void {
    this.db
      .prepare(`UPDATE groups SET ai_status = 'error', ai_error = ?, ai_at = ? WHERE id = ?`)
      .run(error.slice(0, 500), new Date().toISOString(), id);
  }

  deleteGroup(id: string): boolean {
    return this.db.prepare('DELETE FROM groups WHERE id = ?').run(id).changes > 0;
  }

  /** Deletes reports older than the cut-off and expired sessions; groups keep their counts and analysis. */
  prune(reportsBefore: Date, now: Date = new Date()): { reports: number; sessions: number } {
    const reports = this.db.prepare('DELETE FROM reports WHERE created_at < ?').run(reportsBefore.toISOString()).changes;
    const sessions = this.db.prepare('DELETE FROM sessions WHERE expires_at < ?').run(now.toISOString()).changes;
    return { reports: Number(reports), sessions: Number(sessions) };
  }

  deleteReport(id: string): boolean {
    const r = this.db.prepare('SELECT group_id FROM reports WHERE id = ?').get(id) as Row | undefined;
    if (!r) return false;
    this.db.prepare('DELETE FROM reports WHERE id = ?').run(id);
    return true;
  }

  // ---- credentials ----

  credentialCount(): number {
    return (this.db.prepare('SELECT COUNT(*) AS n FROM credentials').get() as Row).n as number;
  }

  listCredentials(): CredentialRow[] {
    return (this.db.prepare('SELECT * FROM credentials ORDER BY created_at').all() as Row[]).map((r) => ({
      ...(r as unknown as CredentialRow),
      transports: JSON.parse(r.transports as string),
    }));
  }

  getCredential(id: string): CredentialRow | null {
    const r = this.db.prepare('SELECT * FROM credentials WHERE id = ?').get(id) as Row | undefined;
    return r ? { ...(r as unknown as CredentialRow), transports: JSON.parse(r.transports as string) } : null;
  }

  addCredential(c: { id: string; publicKey: Uint8Array; counter: number; transports: string[]; name: string }): void {
    this.db
      .prepare('INSERT INTO credentials (id, public_key, counter, transports, name, created_at) VALUES (?, ?, ?, ?, ?, ?)')
      .run(c.id, c.publicKey, c.counter, JSON.stringify(c.transports), c.name, new Date().toISOString());
  }

  updateCounter(id: string, counter: number): void {
    this.db.prepare('UPDATE credentials SET counter = ? WHERE id = ?').run(counter, id);
  }

  deleteCredential(id: string): boolean {
    return this.db.prepare('DELETE FROM credentials WHERE id = ?').run(id).changes > 0;
  }

  // ---- sessions ----

  createSession(tokenHash: string, expiresAt: Date): void {
    this.db
      .prepare('INSERT INTO sessions (token_hash, created_at, expires_at) VALUES (?, ?, ?)')
      .run(tokenHash, new Date().toISOString(), expiresAt.toISOString());
  }

  sessionValid(tokenHash: string): boolean {
    const r = this.db.prepare('SELECT expires_at FROM sessions WHERE token_hash = ?').get(tokenHash) as Row | undefined;
    if (!r) return false;
    if (new Date(r.expires_at as string) <= new Date()) {
      this.deleteSession(tokenHash);
      return false;
    }
    return true;
  }

  deleteSession(tokenHash: string): void {
    this.db.prepare('DELETE FROM sessions WHERE token_hash = ?').run(tokenHash);
  }

  purgeExpiredSessions(): void {
    this.db.prepare('DELETE FROM sessions WHERE expires_at <= ?').run(new Date().toISOString());
  }
}
