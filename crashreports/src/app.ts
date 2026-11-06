import { readFileSync } from 'node:fs';
import { Hono, type Context } from 'hono';
import { bodyLimit } from 'hono/body-limit';
import { secureHeaders } from 'hono/secure-headers';
import type { Config } from './config.ts';
import { STATUSES, type Status, type Store } from './db.ts';
import { fingerprint, redactHome } from './fingerprint.ts';
import { parseCrashText } from './report.ts';
import { validateReport } from './validate.ts';
import { RateLimiter } from './ratelimit.ts';
import { authRoutes, csrfGuard, requireSession, setupTokenOk } from './auth.ts';
import { buildIssue, createIssue } from './github.ts';
import { analyzeCrash, describeAiError, type AnthropicLike } from './ai.ts';
import { SourceFetcher, gatherSnippets } from './source.ts';

export interface AppDeps {
  config: Config;
  store: Store;
  /** Injected for tests; defaults to global fetch. Used for GitHub only. */
  fetchFn?: typeof fetch;
  /** Anthropic client; null disables AI analysis. */
  anthropic?: AnthropicLike | null;
  /** Returns the client IP for rate limiting (never stored). */
  getClientIp?: (c: { req: { header(name: string): string | undefined } }, raw: unknown) => string;
}

const MAX_BODY = 256 * 1024;

function staticFile(rel: string): string {
  return readFileSync(new URL(rel, import.meta.url), 'utf8');
}

export function createApp(deps: AppDeps) {
  const { config, store } = deps;
  const fetchFn = deps.fetchFn ?? fetch;
  const anthropic = deps.anthropic ?? null;
  const limiter = new RateLimiter(config.rateLimitPerMinute);
  const sources = new SourceFetcher({ fetchFn, repo: config.githubRepo, token: config.githubToken });
  const repoName = config.githubRepo.split('/')[1] ?? 'mumcord';
  const running = new Set<string>();

  const files = {
    html: staticFile('../public/index.html'),
    js: staticFile('../public/app.js'),
    css: staticFile('../public/style.css'),
    webauthn: staticFile('../node_modules/@simplewebauthn/browser/dist/bundle/index.umd.min.js'),
  };

  /** Run the AI analysis for a group; never throws. Resolves when done (tests can await it). */
  async function analyze(groupId: string): Promise<void> {
    if (!anthropic || running.has(groupId)) return;
    const group = store.getGroup(groupId);
    if (!group) return;
    running.add(groupId);
    store.setAiPending(groupId);
    try {
      const latest = store.latestReports(groupId, 1)[0];
      const snippets =
        config.aiIncludeSource && latest
          ? await gatherSnippets(sources, { message: latest.message, backtrace: latest.backtrace, app_version: latest.app_version }, repoName)
          : [];
      const analysis = await analyzeCrash(
        anthropic,
        {
          kind: group.kind,
          message: redactHome(group.message),
          top_frames: group.top_frames,
          versions: group.versions,
          os_list: group.os_list,
          thread: latest?.thread ?? null,
          uptime: latest?.uptime ?? null,
          running: latest?.running ?? {},
          system: latest?.system ?? {},
          log_tail: config.aiIncludeLogs ? latest?.log_tail : null,
          user_note: config.aiIncludeLogs ? latest?.user_note : null,
          snippets,
        },
        config.aiTimeoutMs,
      );
      analysis.sources = snippets.map((s) => ({ path: s.path, line: s.line, ref: s.ref }));
      store.setAiResult(groupId, analysis);
    } catch (e) {
      store.setAiError(groupId, describeAiError(e));
    } finally {
      running.delete(groupId);
    }
  }

  const app = new Hono();

  app.use(
    '*',
    secureHeaders({
      contentSecurityPolicy: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'"],
        imgSrc: ["'self'", 'data:'],
        connectSrc: ["'self'"],
        frameAncestors: ["'none'"],
        baseUri: ["'none'"],
        formAction: ["'self'"],
      },
      referrerPolicy: 'no-referrer',
    }),
  );

  app.get('/healthz', (c) => c.json({ ok: true }));

  // ---- public ingest ----
  app.post(
    '/api/v1/reports',
    bodyLimit({ maxSize: MAX_BODY, onError: (c) => c.json({ error: 'body too large' }, 413) }),
    async (c) => {
      const ip = deps.getClientIp ? deps.getClientIp(c, c.env) : 'unknown';
      const wait = limiter.check(ip);
      if (wait > 0) {
        c.header('Retry-After', String(wait));
        return c.json({ error: 'rate limited' }, 429);
      }
      const type = (c.req.header('content-type') ?? '').split(';')[0].trim().toLowerCase();
      let parsed;
      if (type === 'text/plain') {
        const text = await c.req.text();
        if (text.includes('\u0000')) return c.json({ error: 'invalid report' }, 400);
        parsed = parseCrashText(text);
      } else if (type === 'application/json') {
        let body: unknown;
        try {
          body = await c.req.json();
        } catch {
          return c.json({ error: 'invalid JSON' }, 400);
        }
        parsed = validateReport(body);
      } else {
        return c.json({ error: 'content-type must be text/plain (crash file) or application/json' }, 415);
      }
      if (!parsed.ok) return c.json({ error: 'invalid report', details: parsed.errors }, 400);
      const fp = fingerprint(parsed.value);
      const group = fp.id;
      const { id, isNew } = store.ingest(parsed.value, fp);
      if (isNew && anthropic) setImmediate(() => void analyze(group));
      return c.json({ id, group }, 201);
    },
  );

  // ---- auth ----
  app.use('/api/auth/*', csrfGuard(config));
  app.route('/api/auth', authRoutes(config, store));

  // ---- admin API ----
  app.use('/api/admin/*', requireSession(store), csrfGuard(config));
  const admin = new Hono();

  admin.get('/config', (c) =>
    c.json({ ai: !!anthropic, github: !!config.githubToken, githubRepo: config.githubRepo, statuses: STATUSES }),
  );

  admin.get('/groups', (c) =>
    c.json(store.listGroups({ q: c.req.query('q')?.slice(0, 200), status: c.req.query('status') })),
  );

  admin.get('/groups/:id', (c) => {
    const group = store.getGroup(c.req.param('id'));
    if (!group) return c.json({ error: 'not found' }, 404);
    return c.json({ group, reports: store.latestReports(group.id, 20) });
  });

  admin.patch('/groups/:id', async (c) => {
    const body = (await c.req.json().catch(() => ({}))) as { status?: unknown };
    if (!(STATUSES as readonly unknown[]).includes(body.status)) return c.json({ error: 'invalid status' }, 400);
    if (!store.setStatus(c.req.param('id'), body.status as Status)) return c.json({ error: 'not found' }, 404);
    return c.json({ ok: true });
  });

  admin.delete('/groups/:id', (c) =>
    store.deleteGroup(c.req.param('id')) ? c.json({ ok: true }) : c.json({ error: 'not found' }, 404),
  );

  admin.delete('/reports/:id', (c) =>
    store.deleteReport(c.req.param('id')) ? c.json({ ok: true }) : c.json({ error: 'not found' }, 404),
  );

  admin.post('/groups/:id/analyze', async (c) => {
    if (!anthropic) return c.json({ error: 'ANTHROPIC_API_KEY is not set' }, 400);
    const group = store.getGroup(c.req.param('id'));
    if (!group) return c.json({ error: 'not found' }, 404);
    await analyze(group.id);
    return c.json({ group: store.getGroup(group.id) });
  });

  admin.post('/groups/:id/issue', async (c) => {
    const group = store.getGroup(c.req.param('id'));
    if (!group) return c.json({ error: 'not found' }, 404);
    if (group.issue_url) return c.json({ error: 'issue already exists', url: group.issue_url }, 409);
    const body = (await c.req.json().catch(() => ({}))) as { include_private?: unknown };
    const latest = store.latestReports(group.id, 1)[0] ?? null;
    const draft = buildIssue(group, latest, body.include_private === true, config.githubRepo);
    try {
      const url = await createIssue(fetchFn, config.githubToken, config.githubRepo, draft);
      store.setIssueUrl(group.id, url);
      return c.json({ url });
    } catch (e) {
      return c.json({ error: e instanceof Error ? e.message : 'GitHub request failed' }, 502);
    }
  });

  admin.get('/credentials', (c) =>
    c.json(store.listCredentials().map((cr) => ({ id: cr.id, name: cr.name, created_at: cr.created_at }))),
  );

  admin.delete('/credentials/:id', (c) => {
    if (store.credentialCount() <= 1) return c.json({ error: 'cannot delete the last passkey' }, 400);
    return store.deleteCredential(c.req.param('id')) ? c.json({ ok: true }) : c.json({ error: 'not found' }, 404);
  });

  app.route('/api/admin', admin);

  // ---- UI ----
  const page = (c: Context) => c.html(files.html);
  app.get('/', (c) => page(c));
  app.get('/setup', (c) => {
    if (store.credentialCount() > 0) return c.redirect('/');
    if (!setupTokenOk(config, c.req.query('token'))) return c.text('Invalid or missing setup token', 403);
    return page(c);
  });
  const asset = (body: string, type: string) => () =>
    new Response(body, { headers: { 'content-type': type, 'cache-control': 'no-cache' } });
  app.get('/static/app.js', asset(files.js, 'text/javascript; charset=utf-8'));
  app.get('/static/style.css', asset(files.css, 'text/css; charset=utf-8'));
  app.get('/static/webauthn.js', asset(files.webauthn, 'text/javascript; charset=utf-8'));

  return { app, analyze };
}
