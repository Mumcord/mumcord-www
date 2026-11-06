import { mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { serve } from '@hono/node-server';
import { getConnInfo } from '@hono/node-server/conninfo';
import { loadConfig } from './config.ts';
import { Store } from './db.ts';
import { createApp } from './app.ts';
import { createAnthropic } from './ai.ts';

const config = loadConfig();
mkdirSync(config.dataDir, { recursive: true });
const store = new Store(join(config.dataDir, 'crashreports.db'));
const anthropic = config.anthropicApiKey ? createAnthropic(config.anthropicApiKey, config.aiTimeoutMs) : null;

const { app } = createApp({
  config,
  store,
  anthropic,
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

const server = serve({ fetch: app.fetch, port: config.port }, (info) => {
  console.log(`crashreports listening on :${info.port} (origin ${config.origin}, AI ${anthropic ? 'on' : 'off'})`);
});

const shutdown = () => {
  server.close(() => {
    store.close();
    process.exit(0);
  });
};
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
