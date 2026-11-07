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
  last_used_at: string | null;
  /** Name of the passkey whose invite created this one (null: setup or added by its owner). */
  invited_by: string | null;
  user_id: string | null;
}

export interface UserRow {
  id: string;
  username: string;
  display_name: string;
  created_at: string;
  invited_by: string | null;
  password_hash: string | null;
  totp_secret_enc: string | null;
  totp_last_step: number | null;
  failed_attempts: number;
  locked_until: string | null;
}

export interface UserSummary {
  id: string;
  username: string;
  display_name: string;
  created_at: string;
  invited_by: string | null;
  password_2fa: boolean;
  recovery_codes_left: number;
  locked_until: string | null;
  passkeys: CredentialRow[];
}

/** Failed attempts before the lockout starts; then 1 min, doubling, capped at 1 h. */
export const LOCKOUT_AFTER = 5;
export const LOCKOUT_BASE_MS = 60_000;
export const LOCKOUT_MAX_MS = 3_600_000;

/** Usernames: 2–40 of A–Z, a–z, 0–9, '.', '_', '-', '@'; compared case-insensitively. */
export const USERNAME_RE = /^[A-Za-z0-9][A-Za-z0-9._@-]{1,39}$/;

/** A valid username derived from a free-text name ('' when nothing usable is left). */
export function usernameFrom(name: string): string {
  const u = name
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^A-Za-z0-9._@-]+/g, '-')
    .replace(/^[^A-Za-z0-9]+|[-.]+$/g, '')
    .slice(0, 40)
    .replace(/[-.]+$/g, '');
  return USERNAME_RE.test(u) ? u : '';
}

export type InviteState = 'open' | 'used' | 'expired' | 'revoked';

export interface InviteRow {
  id: string;
  label: string;
  created_at: string;
  expires_at: string;
  used_at: string | null;
  revoked_at: string | null;
  credential_id: string | null;
  /** Name of the passkey that redeemed it, while it exists. */
  credential_name: string | null;
  /** Name of the creator's passkey (or username), while it exists. */
  created_by: string | null;
  /** Username the invite restores sign-in for, or null for a new person. */
  for_user: string | null;
  state: InviteState;
}

/** Why an invite token cannot be redeemed. */
export type InviteProblem = 'invalid' | 'expired' | 'used' | 'revoked';

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
  created_at TEXT NOT NULL,
  last_used_at TEXT,
  invited_by TEXT,
  user_id TEXT
);
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  username TEXT NOT NULL UNIQUE COLLATE NOCASE,
  display_name TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL,
  invited_by TEXT,
  password_hash TEXT,
  totp_secret_enc TEXT,
  totp_last_step INTEGER,
  failed_attempts INTEGER NOT NULL DEFAULT 0,
  locked_until TEXT
);
CREATE TABLE IF NOT EXISTS recovery_codes (
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  code_hash TEXT NOT NULL,
  used_at TEXT,
  PRIMARY KEY (user_id, code_hash)
);
CREATE TABLE IF NOT EXISTS sessions (
  token_hash TEXT PRIMARY KEY,
  created_at TEXT NOT NULL,
  expires_at TEXT NOT NULL,
  credential_id TEXT,
  user_id TEXT
);
CREATE TABLE IF NOT EXISTS invites (
  id TEXT PRIMARY KEY,
  token_hash TEXT NOT NULL UNIQUE,
  label TEXT NOT NULL DEFAULT '',
  created_by_credential TEXT,
  created_by_session TEXT,
  created_at TEXT NOT NULL,
  expires_at TEXT NOT NULL,
  used_at TEXT,
  revoked_at TEXT,
  credential_id TEXT,
  user_id TEXT,
  for_user_id TEXT,
  created_by_user TEXT
);
CREATE INDEX IF NOT EXISTS invites_expires ON invites(expires_at);
CREATE TABLE IF NOT EXISTS github_deliveries (
  id TEXT PRIMARY KEY,
  received_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS github_deliveries_received ON github_deliveries(received_at);
CREATE TABLE IF NOT EXISTS github_stats (
  org TEXT NOT NULL,
  date TEXT NOT NULL,
  taken_at TEXT NOT NULL,
  data_json TEXT NOT NULL,
  PRIMARY KEY (org, date)
);
`;

/** How long GitHub delivery ids are kept for the dedupe. */
export const DELIVERY_RETENTION_MS = 7 * 86_400_000;

type Row = Record<string, unknown>;

/** Columns added after the first release; older databases get them on open. */
const MIGRATIONS: [table: string, column: string, ddl: string][] = [
  ['credentials', 'last_used_at', 'ALTER TABLE credentials ADD COLUMN last_used_at TEXT'],
  ['credentials', 'invited_by', 'ALTER TABLE credentials ADD COLUMN invited_by TEXT'],
  ['sessions', 'credential_id', 'ALTER TABLE sessions ADD COLUMN credential_id TEXT'],
  ['credentials', 'user_id', 'ALTER TABLE credentials ADD COLUMN user_id TEXT'],
  ['sessions', 'user_id', 'ALTER TABLE sessions ADD COLUMN user_id TEXT'],
  ['invites', 'user_id', 'ALTER TABLE invites ADD COLUMN user_id TEXT'],
  ['invites', 'for_user_id', 'ALTER TABLE invites ADD COLUMN for_user_id TEXT'],
  ['invites', 'created_by_user', 'ALTER TABLE invites ADD COLUMN created_by_user TEXT'],
];

function toCredential(r: Row): CredentialRow {
  return {
    ...(r as unknown as CredentialRow),
    transports: JSON.parse(r.transports as string),
    last_used_at: (r.last_used_at as string | null) ?? null,
    invited_by: (r.invited_by as string | null) ?? null,
    user_id: (r.user_id as string | null) ?? null,
  };
}

function inviteState(r: Row, now: string): InviteState {
  if (r.used_at) return 'used';
  if (r.revoked_at) return 'revoked';
  return (r.expires_at as string) <= now ? 'expired' : 'open';
}

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
    this.migrate();
  }

  private migrate(): void {
    for (const [table, column, ddl] of MIGRATIONS) {
      const cols = this.db.prepare(`PRAGMA table_info(${table})`).all() as Row[];
      if (!cols.some((c) => c.name === column)) this.db.exec(ddl);
    }
    this.db.exec('CREATE INDEX IF NOT EXISTS sessions_credential ON sessions(credential_id)');
    this.db.exec('CREATE INDEX IF NOT EXISTS sessions_user ON sessions(user_id)');
    this.db.exec('CREATE INDEX IF NOT EXISTS credentials_user ON credentials(user_id)');
    // Passkeys from before users existed: each becomes a user of its own.
    this.tx(() => this.adoptOrphanCredentials());
  }

  private txDepth = 0;

  /** Runs `fn` in an IMMEDIATE transaction; nested calls join the outer one. */
  private tx<T>(fn: () => T): T {
    if (this.txDepth > 0) return fn();
    this.db.exec('BEGIN IMMEDIATE');
    this.txDepth++;
    try {
      const r = fn();
      this.txDepth--;
      this.db.exec('COMMIT');
      return r;
    } catch (e) {
      this.txDepth--;
      this.db.exec('ROLLBACK');
      throw e;
    }
  }

  /** Public form of the transaction helper, for multi-step writes in the auth routes. */
  transaction<T>(fn: () => T): T {
    return this.tx(fn);
  }

  close(): void {
    this.db.close();
  }

  // ---- reports & groups ----

  /** Stores a report; `previousStatus` is the group's status before it (null for a new group). */
  ingest(
    input: CrashReport,
    fp: FingerprintResult,
    now = new Date(),
  ): { id: string; isNew: boolean; previousStatus: Status | null } {
    const ts = now.toISOString();
    const id = randomUUID();
    const groupId = fp.id;
    const osLabel = [input.os, input.arch, input.os_version && `(${input.os_version})`].filter(Boolean).join(' ');
    this.db.exec('BEGIN IMMEDIATE');
    try {
      const existing = this.db.prepare('SELECT versions, os_list, status FROM groups WHERE id = ?').get(groupId) as Row | undefined;
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
      return { id, isNew: !existing, previousStatus: existing ? (existing.status as Status) : null };
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

  /**
   * Deletes reports older than the cut-off, expired sessions and expired invites (used ones too;
   * the passkey keeps who invited it). Groups keep their counts and analysis.
   */
  prune(reportsBefore: Date, now: Date = new Date()): { reports: number; sessions: number; invites: number } {
    const reports = this.db.prepare('DELETE FROM reports WHERE created_at < ?').run(reportsBefore.toISOString()).changes;
    const sessions = this.db.prepare('DELETE FROM sessions WHERE expires_at < ?').run(now.toISOString()).changes;
    const invites = this.db.prepare('DELETE FROM invites WHERE expires_at < ?').run(now.toISOString()).changes;
    return { reports: Number(reports), sessions: Number(sessions), invites: Number(invites) };
  }

  deleteReport(id: string): boolean {
    const r = this.db.prepare('SELECT group_id FROM reports WHERE id = ?').get(id) as Row | undefined;
    if (!r) return false;
    this.db.prepare('DELETE FROM reports WHERE id = ?').run(id);
    return true;
  }

  // ---- users ----

  getUser(id: string): UserRow | null {
    const r = this.db.prepare('SELECT * FROM users WHERE id = ?').get(id) as Row | undefined;
    return r ? (r as unknown as UserRow) : null;
  }

  /** Case-insensitive lookup. */
  getUserByName(username: string): UserRow | null {
    const r = this.db.prepare('SELECT * FROM users WHERE username = ? COLLATE NOCASE').get(username) as Row | undefined;
    return r ? (r as unknown as UserRow) : null;
  }

  createUser(u: {
    id?: string;
    username: string;
    displayName?: string;
    invitedBy?: string | null;
    passwordHash?: string | null;
    totpSecretEnc?: string | null;
    totpLastStep?: number | null;
    now?: Date;
  }): string {
    const id = u.id ?? randomUUID();
    this.db
      .prepare(
        `INSERT INTO users (id, username, display_name, created_at, invited_by, password_hash, totp_secret_enc, totp_last_step)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      )
      .run(id, u.username, u.displayName ?? u.username, (u.now ?? new Date()).toISOString(), u.invitedBy ?? null,
        u.passwordHash ?? null, u.totpSecretEnc ?? null, u.totpLastStep ?? null);
    return id;
  }

  /** Number of users that can sign in (a passkey, or a password with TOTP). */
  signInUserCount(exceptUserId: string | null = null): number {
    return (this.db
      .prepare(
        `SELECT COUNT(*) AS n FROM users u
          WHERE (u.id IS NOT ? OR ? IS NULL)
            AND ((u.password_hash IS NOT NULL AND u.totp_secret_enc IS NOT NULL)
                 OR EXISTS (SELECT 1 FROM credentials c WHERE c.user_id = u.id))`,
      )
      .get(exceptUserId, exceptUserId) as Row).n as number;
  }

  /**
   * True when removing `what` from the user leaves nobody who can sign in to the service.
   * 'user' removes everything, 'password' the password+TOTP, otherwise one passkey id.
   */
  private wouldRemoveLastSignIn(userId: string, what: 'user' | 'password' | { passkey: string }): boolean {
    const u = this.getUser(userId);
    if (!u) return false;
    let left = 0;
    if (what !== 'user') {
      if (what === 'password') left += this.passkeyCount(userId);
      else {
        left += (this.db.prepare('SELECT COUNT(*) AS n FROM credentials WHERE user_id = ? AND id <> ?').get(userId, what.passkey) as Row).n as number;
        if (u.password_hash && u.totp_secret_enc) left++;
      }
    }
    return left === 0 && this.signInUserCount(userId) === 0;
  }

  passkeyCount(userId: string): number {
    return (this.db.prepare('SELECT COUNT(*) AS n FROM credentials WHERE user_id = ?').get(userId) as Row).n as number;
  }

  listUsers(): UserSummary[] {
    const users = this.db.prepare('SELECT * FROM users ORDER BY created_at, username').all() as unknown as UserRow[];
    return users.map((u) => ({
      id: u.id,
      username: u.username,
      display_name: u.display_name,
      created_at: u.created_at,
      invited_by: u.invited_by,
      password_2fa: !!(u.password_hash && u.totp_secret_enc),
      recovery_codes_left: this.recoveryCodesLeft(u.id),
      locked_until: u.locked_until,
      passkeys: (this.db.prepare('SELECT * FROM credentials WHERE user_id = ? ORDER BY created_at').all(u.id) as Row[]).map(toCredential),
    }));
  }

  /** Deletes a user with passkeys, recovery codes and sessions; refuses the last one that can sign in. */
  deleteUser(id: string): 'ok' | 'last' | 'not found' {
    return this.tx(() => {
      if (!this.getUser(id)) return 'not found';
      if (this.wouldRemoveLastSignIn(id, 'user')) return 'last';
      this.db.prepare('DELETE FROM sessions WHERE user_id = ?').run(id);
      this.db.prepare('DELETE FROM sessions WHERE credential_id IN (SELECT id FROM credentials WHERE user_id = ?)').run(id);
      this.db.prepare('DELETE FROM credentials WHERE user_id = ?').run(id);
      this.db.prepare('DELETE FROM recovery_codes WHERE user_id = ?').run(id);
      this.db.prepare('DELETE FROM users WHERE id = ?').run(id);
      return 'ok';
    });
  }

  /** Removes password, TOTP and recovery codes, and ends all the user's sessions. */
  clearPassword(id: string): 'ok' | 'last' | 'not found' {
    return this.tx(() => {
      const u = this.getUser(id);
      if (!u) return 'not found';
      if (this.wouldRemoveLastSignIn(id, 'password')) return 'last';
      this.db
        .prepare('UPDATE users SET password_hash = NULL, totp_secret_enc = NULL, totp_last_step = NULL, failed_attempts = 0, locked_until = NULL WHERE id = ?')
        .run(id);
      this.db.prepare('DELETE FROM recovery_codes WHERE user_id = ?').run(id);
      this.deleteUserSessions(id);
      return 'ok';
    });
  }

  setPasswordHash(id: string, hash: string): void {
    this.db.prepare('UPDATE users SET password_hash = ? WHERE id = ?').run(hash, id);
  }

  /** Sets password, TOTP secret and recovery codes in one go (enrollment finished). */
  setPasswordAndTotp(id: string, p: { passwordHash?: string; totpSecretEnc: string; totpLastStep: number; recoveryHashes: string[] }): void {
    this.tx(() => {
      if (p.passwordHash) this.setPasswordHash(id, p.passwordHash);
      this.db.prepare('UPDATE users SET totp_secret_enc = ?, totp_last_step = ? WHERE id = ?').run(p.totpSecretEnc, p.totpLastStep, id);
      this.writeRecoveryCodes(id, p.recoveryHashes);
    });
  }

  /** Records a used TOTP step; false when that step (or a later one) was used already. */
  useTotpStep(id: string, step: number): boolean {
    return (
      this.db
        .prepare('UPDATE users SET totp_last_step = ? WHERE id = ? AND (totp_last_step IS NULL OR totp_last_step < ?)')
        .run(step, id, step).changes > 0
    );
  }

  // ---- lockout ----

  /** Counts a failed password or code; from the 5th on, locks for 1 min, 2, 4, … at most 1 h. */
  recordFailure(id: string, now: Date = new Date()): { failed: number; lockedUntil: string | null } {
    return this.tx(() => {
      this.db.prepare('UPDATE users SET failed_attempts = failed_attempts + 1 WHERE id = ?').run(id);
      const failed = ((this.db.prepare('SELECT failed_attempts FROM users WHERE id = ?').get(id) as Row | undefined)?.failed_attempts as number) ?? 0;
      let lockedUntil: string | null = null;
      if (failed >= LOCKOUT_AFTER) {
        const ms = Math.min(LOCKOUT_BASE_MS * 2 ** Math.min(failed - LOCKOUT_AFTER, 20), LOCKOUT_MAX_MS);
        lockedUntil = new Date(now.getTime() + ms).toISOString();
        this.db.prepare('UPDATE users SET locked_until = ? WHERE id = ?').run(lockedUntil, id);
      }
      return { failed, lockedUntil };
    });
  }

  resetFailures(id: string): void {
    this.db.prepare('UPDATE users SET failed_attempts = 0, locked_until = NULL WHERE id = ?').run(id);
  }

  /** Milliseconds the account stays locked (0: not locked). */
  lockedForMs(id: string, now: Date = new Date()): number {
    const r = this.db.prepare('SELECT locked_until FROM users WHERE id = ?').get(id) as Row | undefined;
    const until = r?.locked_until ? new Date(r.locked_until as string).getTime() : 0;
    return Math.max(0, until - now.getTime());
  }

  // ---- recovery codes ----

  private writeRecoveryCodes(userId: string, hashes: string[]): void {
    this.db.prepare('DELETE FROM recovery_codes WHERE user_id = ?').run(userId);
    const ins = this.db.prepare('INSERT INTO recovery_codes (user_id, code_hash) VALUES (?, ?)');
    for (const h of hashes) ins.run(userId, h);
  }

  replaceRecoveryCodes(userId: string, hashes: string[]): void {
    this.tx(() => this.writeRecoveryCodes(userId, hashes));
  }

  /** Marks a recovery code used; false when unknown or used before. */
  useRecoveryCode(userId: string, hash: string, now: Date = new Date()): boolean {
    return (
      this.db
        .prepare('UPDATE recovery_codes SET used_at = ? WHERE user_id = ? AND code_hash = ? AND used_at IS NULL')
        .run(now.toISOString(), userId, hash).changes > 0
    );
  }

  recoveryCodesLeft(userId: string): number {
    return (this.db.prepare('SELECT COUNT(*) AS n FROM recovery_codes WHERE user_id = ? AND used_at IS NULL').get(userId) as Row).n as number;
  }

  // ---- credentials ----

  credentialCount(): number {
    return (this.db.prepare('SELECT COUNT(*) AS n FROM credentials').get() as Row).n as number;
  }

  listCredentials(): CredentialRow[] {
    return (this.db.prepare('SELECT * FROM credentials ORDER BY created_at').all() as Row[]).map(toCredential);
  }

  getCredential(id: string): CredentialRow | null {
    const r = this.db.prepare('SELECT * FROM credentials WHERE id = ?').get(id) as Row | undefined;
    return r ? toCredential(r) : null;
  }

  /** Stores a passkey; without a user id it becomes a user of its own (as the migration does). */
  addCredential(c: {
    id: string;
    publicKey: Uint8Array;
    counter: number;
    transports: string[];
    name: string;
    invitedBy?: string | null;
    userId?: string | null;
  }): void {
    this.db
      .prepare('INSERT INTO credentials (id, public_key, counter, transports, name, created_at, invited_by, user_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)')
      .run(c.id, c.publicKey, c.counter, JSON.stringify(c.transports), c.name, new Date().toISOString(), c.invitedBy ?? null, c.userId ?? null);
    if (!c.userId) this.adoptOrphanCredentials();
  }

  /** After a login: the new signature counter and the last-used time. */
  markCredentialUsed(id: string, counter: number, now: Date = new Date()): void {
    this.db.prepare('UPDATE credentials SET counter = ?, last_used_at = ? WHERE id = ?').run(counter, now.toISOString(), id);
  }

  /**
   * Deletes a passkey and its sessions. Refuses when that would leave nobody able to sign in
   * ('last'); the check and the delete share one transaction.
   */
  deleteCredential(id: string): 'ok' | 'last' | 'not found' {
    return this.tx(() => {
      const r = this.db.prepare('SELECT user_id FROM credentials WHERE id = ?').get(id) as Row | undefined;
      if (!r) return 'not found';
      if (r.user_id ? this.wouldRemoveLastSignIn(r.user_id as string, { passkey: id }) : this.credentialCount() <= 1) return 'last';
      this.db.prepare('DELETE FROM credentials WHERE id = ?').run(id);
      this.db.prepare('DELETE FROM sessions WHERE credential_id = ?').run(id);
      return 'ok';
    });
  }

  /** Gives every passkey without a user a user of its own, named after the passkey. */
  private adoptOrphanCredentials(): void {
    const orphans = this.db
      .prepare('SELECT id, name, created_at, invited_by FROM credentials WHERE user_id IS NULL ORDER BY created_at, rowid')
      .all() as Row[];
    for (const o of orphans) {
      const name = (o.name as string) || '';
      const base = usernameFrom(name) || 'passkey';
      let username = base;
      for (let i = 2; this.getUserByName(username); i++) username = `${base.slice(0, 36)}-${i}`;
      const userId = this.createUser({ username, displayName: name || username, invitedBy: o.invited_by as string | null, now: new Date(o.created_at as string) });
      this.db.prepare('UPDATE credentials SET user_id = ? WHERE id = ?').run(userId, o.id as string);
    }
    this.db.exec(
      `UPDATE sessions SET user_id = (SELECT c.user_id FROM credentials c WHERE c.id = sessions.credential_id)
        WHERE user_id IS NULL AND credential_id IS NOT NULL`,
    );
  }

  // ---- invites ----

  createInvite(i: {
    tokenHash: string;
    label: string;
    createdByCredential: string | null;
    createdBySession: string | null;
    createdByUser?: string | null;
    /** The invite restores sign-in for this existing user (after a reset) instead of creating one. */
    forUserId?: string | null;
    expiresAt: Date;
    now?: Date;
  }): string {
    const id = randomUUID();
    this.db
      .prepare(
        `INSERT INTO invites (id, token_hash, label, created_by_credential, created_by_session, created_by_user, for_user_id, created_at, expires_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      )
      .run(id, i.tokenHash, i.label, i.createdByCredential, i.createdBySession, i.createdByUser ?? null, i.forUserId ?? null,
        (i.now ?? new Date()).toISOString(), i.expiresAt.toISOString());
    return id;
  }

  listInvites(now: Date = new Date()): InviteRow[] {
    const ts = now.toISOString();
    return (this.db
      .prepare(
        `SELECT i.id, i.label, i.created_at, i.expires_at, i.used_at, i.revoked_at, i.credential_id,
                COALESCE(used.name, uu.username) AS credential_name,
                COALESCE(creator.name, cu.username) AS created_by,
                fu.username AS for_user
           FROM invites i
           LEFT JOIN credentials used ON used.id = i.credential_id
           LEFT JOIN users uu ON uu.id = i.user_id
           LEFT JOIN credentials creator ON creator.id = i.created_by_credential
           LEFT JOIN users cu ON cu.id = i.created_by_user
           LEFT JOIN users fu ON fu.id = i.for_user_id
          ORDER BY i.created_at DESC`,
      )
      .all() as Row[]).map((r) => ({ ...(r as unknown as InviteRow), state: inviteState(r, ts) }));
  }

  /** Checks an invite token (by hash): its label and target user, or why it cannot be used. */
  checkInvite(
    tokenHash: string,
    now: Date = new Date(),
  ): { ok: true; id: string; label: string; forUserId: string | null } | { ok: false; problem: InviteProblem } {
    const r = this.db.prepare('SELECT * FROM invites WHERE token_hash = ?').get(tokenHash) as Row | undefined;
    if (!r) return { ok: false, problem: 'invalid' };
    const state = inviteState(r, now.toISOString());
    if (state !== 'open') return { ok: false, problem: state };
    const forUserId = (r.for_user_id as string | null) ?? null;
    // The target user was deleted meanwhile: the link is useless.
    if (forUserId && !this.getUser(forUserId)) return { ok: false, problem: 'invalid' };
    return { ok: true, id: r.id as string, label: r.label as string, forUserId };
  }

  /**
   * Redeems an invite: `create` stores the new sign-in method (and user) and the invite is marked
   * used in the same transaction, so a token works at most once even with concurrent requests.
   * A throwing `create` rolls everything back.
   */
  redeemInvite<T extends { userId: string; credentialId?: string | null }>(
    tokenHash: string,
    create: (ctx: { forUserId: string | null; creatorName: string; creatorUsername: string | null }) => T,
    now: Date = new Date(),
  ): { ok: true; result: T } | { ok: false; problem: InviteProblem } {
    return this.tx(() => {
      const check = this.checkInvite(tokenHash, now);
      if (!check.ok) return check;
      const creator = this.db
        .prepare(
          `SELECT c.name AS cred, u.username AS user FROM invites i
             LEFT JOIN credentials c ON c.id = i.created_by_credential
             LEFT JOIN users u ON u.id = COALESCE(i.created_by_user, c.user_id)
            WHERE i.token_hash = ?`,
        )
        .get(tokenHash) as Row | undefined;
      const result = create({
        forUserId: check.forUserId,
        creatorName: (creator?.cred as string | null) || (creator?.user as string | null) || 'an admin',
        creatorUsername: (creator?.user as string | null) ?? null,
      });
      const ts = now.toISOString();
      this.db
        .prepare('UPDATE invites SET used_at = ?, credential_id = ?, user_id = ? WHERE token_hash = ?')
        .run(ts, result.credentialId ?? null, result.userId, tokenHash);
      return { ok: true as const, result };
    });
  }

  /** Revokes an open invite; false when it does not exist or is no longer open. */
  revokeInvite(id: string, now: Date = new Date()): boolean {
    const ts = now.toISOString();
    return (
      this.db
        .prepare('UPDATE invites SET revoked_at = ? WHERE id = ? AND used_at IS NULL AND revoked_at IS NULL AND expires_at > ?')
        .run(ts, id, ts).changes > 0
    );
  }

  // ---- sessions ----

  /** A session for a user; with only a passkey given, the passkey's user is recorded. */
  createSession(tokenHash: string, expiresAt: Date, credentialId: string | null = null, userId: string | null = null): void {
    const uid = userId ?? (credentialId ? (this.getCredential(credentialId)?.user_id ?? null) : null);
    this.db
      .prepare('INSERT INTO sessions (token_hash, created_at, expires_at, credential_id, user_id) VALUES (?, ?, ?, ?, ?)')
      .run(tokenHash, new Date().toISOString(), expiresAt.toISOString(), credentialId, uid);
  }

  /** The passkey a session was opened with (null for password sessions and older ones). */
  sessionCredential(tokenHash: string): string | null {
    const r = this.db.prepare('SELECT credential_id FROM sessions WHERE token_hash = ?').get(tokenHash) as Row | undefined;
    return (r?.credential_id as string | null) ?? null;
  }

  /** The user a session belongs to (null for sessions from before users existed). */
  sessionUser(tokenHash: string): string | null {
    const r = this.db.prepare('SELECT user_id FROM sessions WHERE token_hash = ?').get(tokenHash) as Row | undefined;
    return (r?.user_id as string | null) ?? null;
  }

  /** Ends all sessions of a user, except `exceptHash` (the caller's own). */
  deleteUserSessions(userId: string, exceptHash: string | null = null): number {
    return Number(
      this.db
        .prepare(
          `DELETE FROM sessions WHERE (user_id = ? OR credential_id IN (SELECT id FROM credentials WHERE user_id = ?))
             AND token_hash IS NOT ?`,
        )
        .run(userId, userId, exceptHash).changes,
    );
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

  // ---- GitHub ----

  /**
   * Records a GitHub webhook key (delivery id or item key); false when it was seen within the last
   * 7 days. Older keys are dropped on the way.
   */
  claimGithubDelivery(id: string, now: Date = new Date()): boolean {
    this.db.prepare('DELETE FROM github_deliveries WHERE received_at < ?').run(new Date(now.getTime() - DELIVERY_RETENTION_MS).toISOString());
    return this.db.prepare('INSERT OR IGNORE INTO github_deliveries (id, received_at) VALUES (?, ?)').run(id, now.toISOString()).changes > 0;
  }

  hasGithubStats(org: string, date: string): boolean {
    return !!this.db.prepare('SELECT 1 FROM github_stats WHERE org = ? AND date = ?').get(org, date);
  }

  /** The latest snapshot before `date` (YYYY-MM-DD), or null. */
  previousGithubStats<T>(org: string, date: string): { date: string; data: T } | null {
    const r = this.db
      .prepare('SELECT date, data_json FROM github_stats WHERE org = ? AND date < ? ORDER BY date DESC LIMIT 1')
      .get(org, date) as Row | undefined;
    return r ? { date: r.date as string, data: JSON.parse(r.data_json as string) as T } : null;
  }

  /** Stores the day's snapshot; false when one exists already (the day's card went out). */
  saveGithubStats(org: string, date: string, data: unknown, now: Date = new Date()): boolean {
    return (
      this.db
        .prepare('INSERT OR IGNORE INTO github_stats (org, date, taken_at, data_json) VALUES (?, ?, ?, ?)')
        .run(org, date, now.toISOString(), JSON.stringify(data)).changes > 0
    );
  }

  purgeExpiredSessions(): void {
    this.db.prepare('DELETE FROM sessions WHERE expires_at <= ?').run(new Date().toISOString());
  }
}
