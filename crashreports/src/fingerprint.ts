import { createHash } from 'node:crypto';
import { kindLabel, type CrashReport } from './report.ts';
import { toRepoPath } from './paths.ts';

/** The panic hook itself shows up as the top frame of every panic; it says nothing about the crash. */
const CRASH_HANDLER = 'crates/engine/src/crash.rs';
const REPO_NAME = 'mumcord';

/** Replace the volatile parts of a string (paths, addresses, hashes, numbers) with placeholders. */
export function normalizeText(s: string): string {
  return s
    .replace(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi, '<uuid>')
    .replace(/\b0x[0-9a-f]+\b/gi, '<addr>')
    // Windows paths (C:\Users\...\file.rs) and UNC paths
    .replace(/(?:\b[a-z]:[\\/]|\\\\)[^\s:'"`()<>]*/gi, '<path>')
    // Unix paths with at least one slash (/home/x/..., ./src/x.rs, crates/a/b.rs)
    .replace(/(?:\.{0,2}\/)?(?:[\w.@~+-]+\/)+[\w.@~+-]*|\/[\w.@~+-]+/g, (m) => (m.includes('/') ? '<path>' : m))
    .replace(/\d+/g, '<n>')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Cause without its " at <path>:<line>" suffix, then normalized. */
export function normalizeMessage(message: string): string {
  const noLoc = message.replace(/\s+at\s+\S+:\d+(?::\d+)?/g, '');
  return normalizeText(noLoc).slice(0, 500);
}

export interface Frame {
  symbol: string;
  /** Location as written in the backtrace, or null. */
  rawPath: string | null;
  line: number | null;
}

export interface AppFrame {
  symbol: string;
  /** Repo-relative path, e.g. crates/engine/src/x.rs */
  path: string;
  line: number;
}

/** Parse a Rust std backtrace ("  3: symbol" lines, each optionally followed by "at path:line:col"). */
export function parseFrames(backtrace: string): Frame[] {
  const frames: Frame[] = [];
  for (const raw of backtrace.split(/\r?\n/)) {
    const sym = raw.match(/^\s*\d+:\s+(.+?)\s*$/);
    if (sym) {
      frames.push({ symbol: sym[1], rawPath: null, line: null });
      continue;
    }
    const at = raw.match(/^\s*at\s+(.+?):(\d+)(?::\d+)?\s*$/);
    const last = frames[frames.length - 1];
    if (at && last && last.rawPath === null) {
      last.rawPath = at[1];
      last.line = Number(at[2]);
    }
  }
  return frames;
}

/** Strip the Rust symbol hash suffix and normalize volatile parts of a symbol. */
export function normalizeSymbol(symbol: string): string {
  return normalizeText(symbol.replace(/::h[0-9a-f]{16}\b/g, '')).slice(0, 300);
}

/**
 * Frames from Mumcord's own code: the location is repo-relative (./crates/, ./src-tauri/, ./src/
 * or a CI build path that maps into the repo). Toolchain (/rustc/...), registry crates,
 * "<unknown>" and the crash handler are skipped.
 */
export function appFrames(backtrace: string, repoName = REPO_NAME): AppFrame[] {
  const out: AppFrame[] = [];
  for (const f of parseFrames(backtrace)) {
    if (!f.rawPath || f.line === null || f.symbol === '<unknown>') continue;
    const path = toRepoPath(f.rawPath, repoName);
    if (!path || path === CRASH_HANDLER) continue;
    out.push({ symbol: f.symbol, path, line: f.line });
  }
  return out;
}

/** Module of the last log line, e.g. "mumcord_engine::screen_share". */
export function lastLogModule(logTail: string | null): string | null {
  if (!logTail) return null;
  const lines = logTail.split(/\r?\n/).filter((l) => l.trim());
  for (let i = lines.length - 1; i >= 0; i--) {
    const m = lines[i].match(/^\S+\s+(?:TRACE|DEBUG|INFO|WARN|ERROR)\s+([\w:]+?):\s/);
    if (m) return m[1];
  }
  return null;
}

export interface FingerprintResult {
  id: string;
  /** Human-readable top frames for the group (or the weak-fingerprint basis). */
  frames: string[];
  weak: boolean;
}

/**
 * Group key: kind (or signal) + normalized cause + the top 5 app frames (symbol and file, no
 * line numbers, so small edits do not split a group). A signal without app frames falls back to
 * a weak key of signal + thread + module of the last log line.
 */
export function fingerprint(r: CrashReport): FingerprintResult {
  const frames = appFrames(r.backtrace).slice(0, 5);
  const parts = [kindLabel(r), normalizeMessage(r.message)];
  let display: string[];
  let weak = false;
  if (frames.length) {
    parts.push(...frames.map((f) => `${normalizeSymbol(f.symbol)} @ ${f.path}`));
    display = frames.map((f) => `${f.symbol} at ${f.path}:${f.line}`);
  } else if (r.signal) {
    weak = true;
    const thread = r.thread ?? '-';
    const module = lastLogModule(r.log_tail) ?? '-';
    parts.push(`thread ${thread}`, `module ${module}`);
    display = [`(no backtrace) thread: ${thread}, last log module: ${module}`];
  } else {
    display = [];
  }
  return { id: createHash('sha256').update(parts.join('\n')).digest('hex'), frames: display, weak };
}

/** Replace user home directories in free text (/home/alice/, C:\Users\alice\) with "~/". */
export function redactHome(s: string): string {
  return s
    .replace(/\/(?:home|Users)\/[^/\s]+\//g, '~/')
    .replace(/\b[a-z]:\\(?:Users|Documents and Settings)\\[^\\\s]+\\/gi, '~\\');
}
