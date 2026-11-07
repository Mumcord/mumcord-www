import { mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { serve } from '@hono/node-server';
import { getConnInfo } from '@hono/node-server/conninfo';
import { loadConfig } from './config.ts';
import { Store } from './db.ts';
import { createApp } from './app.ts';
import { createAnthropic } from './ai.ts';
import { MumbotNotifier } from './mumbot.ts';
import { GithubStats } from './githubstats.ts';

const config = loadConfig();
mkdirSync(config.dataDir, { recursive: true });
const store = new Store(join(config.dataDir, 'crashreports.db'));
const anthropic = config.anthropicApiKey ? createAnthropic(config.anthropicApiKey, config.aiTimeoutMs) : null;

const githubMumbot = new MumbotNotifier({
  url: config.mumbotWebhookUrl,
  token: config.mumbotWebhookToken,
  channel: config.mumbotGithubChannel,
});

const { app } = createApp({
  config,
  store,
  anthropic,
  githubMumbot,
  getClientIp: (c, _env) => {
    // Behind Traefik (TRUST_PROXY=1) the proxy appends the real client address as the last
    // X-Forwarded-For entry; earlier entries can be forged by the client. Used only for the
    // in-memory rate limit, never stored.
    if (config.trustProxy) {
      const xff = c.req.header('x-forwarded-for');
      const last = xff?.split(',').pop()?.trim();
      if (last) return last;
    }
    return getConnInfo(c as Parameters<typeof getConnInfo>[0]).remote.address ?? 'unknown';
  },
});

if (!config.setupToken && store.credentialCount() === 0) {
  console.warn('No passkey registered and SETUP_TOKEN is not set: the admin UI cannot be set up.');
}

// Retention: reports are deleted REPORT_RETENTION_DAYS (default 90) after they arrive, checked at start and every 6 hours.
const DAY_MS = 86_400_000;
const pruneOld = () => {
  const r = store.prune(new Date(Date.now() - config.reportRetentionDays * DAY_MS));
  if (r.reports || r.sessions || r.invites) {
    console.log(`retention: deleted ${r.reports} reports, ${r.sessions} sessions, ${r.invites} expired invites`);
  }
};
pruneOld();
const pruneTimer = setInterval(pruneOld, 6 * 3_600_000);
pruneTimer.unref();

// Daily GitHub statistics card (GITHUB_ORG, Mumbot configured, GITHUB_STATS not 0).
let githubStats: GithubStats | null = null;
if (config.githubStats && config.githubOrg && githubMumbot.enabled) {
  try {
    githubStats = new GithubStats({
      store,
      mumbot: githubMumbot,
      org: config.githubOrg,
      time: config.githubStatsTime,
      tz: config.githubStatsTz,
      token: config.githubToken,
    });
    githubStats.start();
    console.log(`github stats: ${config.githubOrg} daily at ${config.githubStatsTime} ${config.githubStatsTz}`);
  } catch (e) {
    console.warn(`github stats: off: ${e instanceof Error ? e.message : String(e)}`);
  }
}

const server = serve({ fetch: app.fetch, port: config.port }, (info) => {
  console.log(`crashreports listening on :${info.port} (origin ${config.origin}, AI ${anthropic ? 'on' : 'off'})`);
});

const shutdown = () => {
  githubStats?.stop();
  server.close(() => {
    store.close();
    process.exit(0);
  });
};
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
