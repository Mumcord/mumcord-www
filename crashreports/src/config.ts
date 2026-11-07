import { parseEncryptionKey } from './totp.ts';

export interface Config {
  port: number;
  dataDir: string;
  rpId: string;
  rpName: string;
  origin: string;
  setupToken: string;
  cookieSecure: boolean;
  trustProxy: boolean;
  rateLimitPerMinute: number;
  githubRepo: string;
  githubToken: string;
  anthropicApiKey: string;
  aiIncludeLogs: boolean;
  aiIncludeSource: boolean;
  aiTimeoutMs: number;
  /** Reports (raw text, logs, system details) are deleted this many days after they arrive. */
  reportRetentionDays: number;
  /** Mumbot webhook `POST /message` URL; empty turns the channel notification off. */
  mumbotWebhookUrl: string;
  /** Mumbot API key, sent as `X-API-Key`. */
  mumbotWebhookToken: string;
  /** Mumble channel id, or a channel name that is resolved through Mumbot's `GET /channels`. */
  mumbotChannel: string;
  /** Channel for the GitHub cards (webhook and daily stats); defaults to `mumbotChannel`. */
  mumbotGithubChannel: string;
  /** Secret of the GitHub organisation webhook; empty turns `POST /api/github/webhook` off (404). */
  githubWebhookSecret: string;
  /** Organisation for the daily statistics; empty turns them off. */
  githubOrg: string;
  /** Daily statistics on (default) unless GITHUB_STATS=0. */
  githubStats: boolean;
  /** Local time of the daily statistics, `HH:MM` in `githubStatsTz`. */
  githubStatsTime: string;
  /** IANA time zone of `githubStatsTime`. */
  githubStatsTz: string;
  /** AES-256-GCM key for the TOTP secrets (TOTP_ENCRYPTION_KEY); null turns password login off. */
  totpEncryptionKey: Buffer | null;
}

/** Deploy placeholders (CHANGE_ME…) count as not set, so a missing key turns the feature off. */
const secret = (v: string | undefined): string => (v && !v.startsWith('CHANGE_ME') ? v : '');

export function loadConfig(env: NodeJS.ProcessEnv = process.env): Config {
  const port = Number(env.PORT ?? 8787);
  const origin = env.ORIGIN ?? `http://localhost:${port}`;
  const rpId = env.RP_ID ?? new URL(origin).hostname;
  const cookieSecure =
    env.COOKIE_SECURE !== undefined ? env.COOKIE_SECURE === '1' : origin.startsWith('https://');
  return {
    port,
    dataDir: env.DATA_DIR ?? './data',
    rpId,
    rpName: env.RP_NAME ?? 'Mumcord Crash Reports',
    origin,
    setupToken: secret(env.SETUP_TOKEN),
    cookieSecure,
    trustProxy: env.TRUST_PROXY === '1',
    rateLimitPerMinute: Number(env.RATE_LIMIT_PER_MINUTE ?? 10),
    reportRetentionDays: Math.max(1, Number(env.REPORT_RETENTION_DAYS ?? 90)),
    githubRepo: env.GITHUB_REPO ?? 'Mumcord/mumcord',
    githubToken: secret(env.GITHUB_TOKEN),
    anthropicApiKey: secret(env.ANTHROPIC_API_KEY),
    aiIncludeLogs: env.AI_INCLUDE_LOGS === '1',
    aiIncludeSource: (env.AI_INCLUDE_SOURCE ?? '1') === '1',
    aiTimeoutMs: Number(env.AI_TIMEOUT_MS ?? 30_000),
    mumbotWebhookUrl: secret(env.MUMBOT_WEBHOOK_URL?.trim()),
    mumbotWebhookToken: secret(env.MUMBOT_WEBHOOK_TOKEN?.trim()),
    mumbotChannel: secret(env.MUMBOT_CHANNEL?.trim()),
    mumbotGithubChannel: secret(env.MUMBOT_GITHUB_CHANNEL?.trim()) || secret(env.MUMBOT_CHANNEL?.trim()),
    githubWebhookSecret: secret(env.GITHUB_WEBHOOK_SECRET?.trim()),
    githubOrg: (env.GITHUB_ORG ?? 'Mumcord').trim(),
    githubStats: env.GITHUB_STATS !== '0',
    githubStatsTime: env.GITHUB_STATS_TIME?.trim() || '22:00',
    githubStatsTz: env.GITHUB_STATS_TZ?.trim() || 'Europe/Berlin',
    totpEncryptionKey: parseEncryptionKey(env.TOTP_ENCRYPTION_KEY),
  };
}
