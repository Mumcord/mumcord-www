import type { CrashReport } from './report.ts';

/** JSON variant of the ingest API (the plain-text crash file is the primary format). */
export const KINDS = ['panic', 'crash', 'hang'] as const;
export type Kind = (typeof KINDS)[number];

export interface ReportInput {
  app_version: string;
  os: string;
  os_version: string;
  arch: string;
  kind: Kind;
  message: string;
  backtrace: string;
  log_tail: string | null;
  user_note: string | null;
  install_id: string | null;
}

interface FieldRule {
  required: boolean;
  max: number;
  pattern?: RegExp;
  allowEmpty?: boolean;
}

const RULES: Record<keyof ReportInput, FieldRule> = {
  app_version: { required: true, max: 64, pattern: /^[0-9A-Za-z.+-]+$/ },
  os: { required: true, max: 32, pattern: /^[A-Za-z0-9 ._-]+$/ },
  os_version: { required: true, max: 128, pattern: /^[\x20-\x7e]+$/ },
  arch: { required: true, max: 32, pattern: /^[A-Za-z0-9_-]+$/ },
  kind: { required: true, max: 16 },
  message: { required: true, max: 4_000 },
  backtrace: { required: true, max: 96 * 1024, allowEmpty: true },
  log_tail: { required: false, max: 128 * 1024, allowEmpty: true },
  user_note: { required: false, max: 2_000, allowEmpty: true },
  install_id: { required: false, max: 64, pattern: /^[A-Za-z0-9-]+$/ },
};

export type ValidationResult = { ok: true; value: CrashReport } | { ok: false; errors: string[] };

export function validateReport(body: unknown): ValidationResult {
  if (typeof body !== 'object' || body === null || Array.isArray(body)) {
    return { ok: false, errors: ['body must be a JSON object'] };
  }
  const obj = body as Record<string, unknown>;
  const errors: string[] = [];
  for (const key of Object.keys(obj)) {
    if (!(key in RULES)) errors.push(`unknown field: ${key}`);
  }
  const out: Record<string, string | null> = {};
  for (const [key, rule] of Object.entries(RULES)) {
    const v = obj[key];
    if (v === undefined || v === null) {
      if (rule.required) errors.push(`${key} is required`);
      out[key] = null;
      continue;
    }
    if (typeof v !== 'string') {
      errors.push(`${key} must be a string`);
      continue;
    }
    if (v.length > rule.max) errors.push(`${key} is longer than ${rule.max} characters`);
    if (!rule.allowEmpty && v.trim() === '') errors.push(`${key} must not be empty`);
    else if (rule.pattern && v !== '' && !rule.pattern.test(v)) errors.push(`${key} has invalid characters`);
    out[key] = v;
  }
  if (typeof obj.kind === 'string' && !(KINDS as readonly string[]).includes(obj.kind)) {
    errors.push(`kind must be one of ${KINDS.join(', ')}`);
  }
  if (errors.length) return { ok: false, errors };
  const v = out as unknown as ReportInput;
  return {
    ok: true,
    value: {
      ...v,
      signal: null,
      thread: null,
      uptime: null,
      crash_time: null,
      running: {},
      system: {},
      raw: null,
    },
  };
}
