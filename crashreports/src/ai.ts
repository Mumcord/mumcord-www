import Anthropic from '@anthropic-ai/sdk';
import type { Snippet } from './source.ts';

export const AI_MODEL = 'claude-haiku-5-5';
export const SEVERITIES = ['low', 'medium', 'high', 'critical'] as const;

export interface Analysis {
  title: string;
  summary: string;
  likely_cause: string;
  component: string;
  severity: (typeof SEVERITIES)[number];
  suggested_labels: string[];
  /** file:line the model suspects, or empty. */
  suspect_location: string;
  fix_hint: string;
  /** Source snippets that were sent along (not model output). */
  sources?: { path: string; line: number; ref: string }[];
}

export interface AnalysisInput {
  kind: string;
  message: string;
  top_frames: string[];
  versions: string[];
  os_list: string[];
  thread?: string | null;
  uptime?: string | null;
  /** What was running (camera on air, watching a share, ...) and system info (GPU, driver, desktop). */
  running?: Record<string, string>;
  system?: Record<string, string>;
  /** Only filled when AI_INCLUDE_LOGS=1. */
  log_tail?: string | null;
  user_note?: string | null;
  /** Source snippets from the public repo, when AI_INCLUDE_SOURCE=1. */
  snippets?: Snippet[];
}

/** The subset of the SDK client we use, so tests can pass a fake. */
export type AnthropicLike = { messages: Pick<Anthropic['messages'], 'create'> };

export function createAnthropic(apiKey: string, timeoutMs: number): AnthropicLike {
  return new Anthropic({ apiKey, timeout: timeoutMs, maxRetries: 1 });
}

const SCHEMA = {
  type: 'object',
  properties: {
    title: { type: 'string', description: 'Short GitHub issue title, at most 80 characters.' },
    summary: { type: 'string', description: '2 to 4 sentences describing what crashed and when.' },
    likely_cause: { type: 'string', description: 'The most likely root cause, one or two sentences.' },
    component: {
      type: 'string',
      description: 'Best guess of the affected area, e.g. audio, screenshare, camera, relay, ui, plugins, files, chat, settings, updater.',
    },
    severity: { type: 'string', enum: [...SEVERITIES] },
    suggested_labels: { type: 'array', items: { type: 'string' } },
    suspect_location: {
      type: 'string',
      description: 'Repo-relative file:line most likely at fault, taken from the source snippets; empty string if unknown.',
    },
    fix_hint: { type: 'string', description: 'One short sentence on how to fix it; empty string if unclear.' },
  },
  required: ['title', 'summary', 'likely_cause', 'component', 'severity', 'suggested_labels', 'suspect_location', 'fix_hint'],
  additionalProperties: false,
} as const;

const SYSTEM = `You triage crash reports for Mumcord, a desktop voice chat app built with Tauri and Rust
(voice over Mumble, screen sharing, camera, file sharing, plugins, a relay server).
Given one crash group (a fingerprint shared by several reports), write a short triage note for the maintainer.
The "running" and "system" context matters: camera on air, watching a screen share, GPU and driver,
Wayland vs X11 and the desktop often explain native crashes (signals such as SIGSEGV without a backtrace).
Base your answer only on the data given; when the data is thin, say so in the summary and keep severity modest.
Severity: critical = crash on start or data loss for many users, high = common crash in a core feature,
medium = crash in a secondary feature or rare path, low = cosmetic or self-recovering.
When source snippets are given (lines marked with ">" are the reported location), use them to
pin down the cause, the suspect location and a fix hint. Do not invent file paths that are not in the input.
Suggested labels are lowercase GitHub labels such as "bug", "crash", "audio", "screenshare", "ui".`;

function buildPrompt(input: AnalysisInput): string {
  const lines = [
    `kind: ${input.kind}`,
    `message: ${input.message}`,
    `app versions: ${input.versions.join(', ')}`,
    `operating systems: ${input.os_list.join(', ')}`,
  ];
  if (input.thread) lines.push(`thread: ${input.thread}`);
  if (input.uptime) lines.push(`uptime: ${input.uptime}`);
  lines.push('top app frames (Mumcord code only; toolchain and crash-handler frames removed):',
    ...(input.top_frames.length ? input.top_frames.map((f, i) => `  ${i}: ${f}`) : ['  (none)']));
  const kv = (title: string, m?: Record<string, string>) => {
    const entries = Object.entries(m ?? {});
    if (entries.length) lines.push('', `${title}:`, ...entries.map(([k, v]) => `  ${k}: ${v}`));
  };
  kv('running at crash time', input.running);
  kv('system', input.system);
  for (const s of input.snippets ?? []) {
    lines.push('', `source ${s.path}:${s.line} (ref ${s.ref}):`, s.text);
  }
  if (input.log_tail) lines.push('', 'log tail (latest report):', input.log_tail.slice(-8000));
  if (input.user_note) lines.push('', 'user note (latest report):', input.user_note.slice(0, 2000));
  return lines.join('\n');
}

function clean(raw: unknown): Analysis {
  const o = raw as Record<string, unknown>;
  const str = (v: unknown, max: number) => (typeof v === 'string' ? v.trim().slice(0, max) : '');
  const severity = (SEVERITIES as readonly string[]).includes(o.severity as string)
    ? (o.severity as Analysis['severity'])
    : 'medium';
  const labels = Array.isArray(o.suggested_labels)
    ? o.suggested_labels.filter((l): l is string => typeof l === 'string').map((l) => l.trim().slice(0, 40)).filter(Boolean).slice(0, 8)
    : [];
  const a: Analysis = {
    title: str(o.title, 80),
    summary: str(o.summary, 1500),
    likely_cause: str(o.likely_cause, 1000),
    component: str(o.component, 40),
    severity,
    suggested_labels: labels,
    suspect_location: str(o.suspect_location, 200),
    fix_hint: str(o.fix_hint, 500),
  };
  if (!a.title || !a.summary) throw new Error('AI response is missing title or summary');
  return a;
}

export async function analyzeCrash(client: AnthropicLike, input: AnalysisInput, timeoutMs: number): Promise<Analysis> {
  const response = await client.messages.create(
    {
      model: AI_MODEL,
      max_tokens: 6000,
      system: SYSTEM,
      output_config: { effort: 'low', format: { type: 'json_schema', schema: SCHEMA } },
      messages: [{ role: 'user', content: buildPrompt(input) }],
    },
    { timeout: timeoutMs },
  );
  if (response.stop_reason === 'refusal') throw new Error('the model declined to analyze this crash');
  if (response.stop_reason === 'max_tokens') throw new Error('the AI response was cut off');
  const text = response.content.find((b) => b.type === 'text');
  if (!text || text.type !== 'text') throw new Error('the AI response had no text');
  return clean(JSON.parse(text.text));
}

/** Human-readable error text for the UI, without leaking request details. */
export function describeAiError(e: unknown): string {
  if (e instanceof Anthropic.AuthenticationError) return 'Anthropic API key was rejected';
  if (e instanceof Anthropic.RateLimitError) return 'Anthropic rate limit hit, try again later';
  if (e instanceof Anthropic.APIConnectionTimeoutError) return 'Anthropic request timed out';
  if (e instanceof Anthropic.APIConnectionError) return 'could not reach the Anthropic API';
  if (e instanceof Anthropic.APIError) return `Anthropic API error ${e.status ?? ''}`.trim();
  if (e instanceof SyntaxError) return 'the AI response was not valid JSON';
  return e instanceof Error ? e.message : String(e);
}
