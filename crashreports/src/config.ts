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
  };
}
