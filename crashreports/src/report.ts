/**
 * The one shape every crash report is stored in, whether it arrived as the app's plain-text
 * crash file (primary) or as JSON.
 */
export interface CrashReport {
  app_version: string;
  /** e.g. "linux" */
  os: string;
  /** e.g. "CachyOS 7.3.0-4-cachyos" */
  os_version: string;
  arch: string;
  /** "panic", "signal", or another short lowercase word from the report. */
  kind: string;
  /** Signal name for kind "signal", e.g. "SIGSEGV". */
  signal: string | null;
  thread: string | null;
  /** The panic message / cause line. */
  message: string;
  uptime: string | null;
  crash_time: string | null;
  running: Record<string, string>;
  system: Record<string, string>;
  backtrace: string;
  log_tail: string | null;
  user_note: string | null;
  install_id: string | null;
  /** The uploaded text file, unchanged (null for JSON uploads). */
  raw: string | null;
}

/** "panic" or "signal SIGSEGV" as shown to people. */
export function kindLabel(r: { kind: string; signal: string | null }): string {
  return r.signal ? `${r.kind} ${r.signal}` : r.kind;
}

export type ParseResult = { ok: true; value: CrashReport } | { ok: false; errors: string[] };

const MAGIC = 'Mumcord crash report';
const SECTION_RE = /^([a-z][a-z ]{0,30}):\s*$/;
const MAX_MAP_ENTRIES = 60;

/** Parse "key: value" lines into a bounded map. */
function kvLines(lines: string[]): Record<string, string> {
  const out: Record<string, string> = {};
  for (const line of lines) {
    const i = line.indexOf(':');
    if (i <= 0) continue;
    const key = line.slice(0, i).trim().slice(0, 64);
    const value = line.slice(i + 1).trim().slice(0, 500);
    if (!key || key in out) continue;
    if (Object.keys(out).length >= MAX_MAP_ENTRIES) break;
    out[key] = value;
  }
  return out;
}

function normalizeKind(raw: string): { kind: string; signal: string | null } {
  const s = raw.trim();
  const sig = s.match(/^signal\s+(SIG[A-Z0-9]{2,10}|\d{1,3})\b/i);
  if (sig) return { kind: 'signal', signal: sig[1].toUpperCase() };
  const word = s.toLowerCase().match(/^[a-z][a-z_-]{0,31}/);
  return { kind: word ? word[0] : 'unknown', signal: null };
}

const nullIfDash = (v: string | undefined): string | null => (v && v !== '-' ? v : null);

/** Parse the Mumcord plain-text crash report. */
export function parseCrashText(text: string): ParseResult {
  const lines = text.replace(/\r\n?/g, '\n').split('\n');
  let i = 0;
  while (i < lines.length && lines[i].trim() === '') i++;
  if (lines[i]?.trim() !== MAGIC) return { ok: false, errors: [`first line must be "${MAGIC}"`] };
  i++;

  const headerLines: string[] = [];
  for (; i < lines.length && lines[i].trim() !== ''; i++) headerLines.push(lines[i]);
  const header = kvLines(headerLines);

  // Sections: a "name:" line at the start or after a blank line opens a section that runs
  // until the next such header.
  const sections: Record<string, string[]> = {};
  let current: string[] | null = null;
  let prevBlank = true;
  for (; i < lines.length; i++) {
    const line = lines[i];
    const m = line.match(SECTION_RE);
    if (m && prevBlank && !(m[1] in sections)) {
      current = sections[m[1]] = [];
    } else if (current) {
      current.push(line);
    }
    prevBlank = line.trim() === '';
  }
  const block = (name: string) => {
    const l = sections[name] ?? [];
    while (l.length && l[l.length - 1].trim() === '') l.pop();
    return l;
  };

  const errors: string[] = [];
  const version = header.version ?? '';
  if (!/^[0-9A-Za-z.+-]{1,64}$/.test(version)) errors.push('version is missing or invalid');
  if (!header.kind) errors.push('kind is missing');
  if (errors.length) return { ok: false, errors };

  const [os = 'unknown', arch = ''] = (header.os ?? '').split(/\s+/);
  const running = kvLines(block('running'));
  const system = kvLines(block('system'));
  const { kind, signal } = normalizeKind(header.kind);
  const logs = block('last log lines').join('\n');
  return {
    ok: true,
    value: {
      app_version: version,
      os: os.slice(0, 32),
      arch: arch.slice(0, 32),
      os_version: [system.os, system.kernel].filter(Boolean).join(' ').slice(0, 128),
      kind,
      signal,
      thread: nullIfDash(header.thread),
      message: (header.cause ?? '').slice(0, 4000),
      uptime: nullIfDash(header.uptime),
      crash_time: nullIfDash(header.time),
      running,
      system,
      backtrace: block('backtrace').join('\n'),
      log_tail: logs || null,
      user_note: null,
      install_id: null,
      raw: text,
    },
  };
}
