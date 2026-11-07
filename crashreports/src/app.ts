import { readFileSync } from 'node:fs';
import { Hono, type Context, type MiddlewareHandler } from 'hono';
import { bodyLimit } from 'hono/body-limit';
import { secureHeaders } from 'hono/secure-headers';
import type { Config } from './config.ts';
import { STATUSES, type Status, type Store } from './db.ts';
import { fingerprint, redactHome } from './fingerprint.ts';
import { parseCrashText } from './report.ts';
import { validateReport } from './validate.ts';
import { RateLimiter } from './ratelimit.ts';
import { randomBytes } from 'node:crypto';
import {
  AuthCore,
  INVITE_TTL_HOURS,
  SESSION_COOKIE,
  accountRoutes,
  authRoutes,
  csrfGuard,
  currentSession,
  currentUser,
  hashToken,
  requireSession,
  setupTokenOk,
  type WebAuthnVerifier,
} from './auth.ts';
import { deleteCookie } from 'hono/cookie';
import { buildIssue, createIssue } from './github.ts';
import { analyzeCrash, describeAiError, type AnthropicLike } from './ai.ts';
import { SourceFetcher, gatherSnippets } from './source.ts';
import { AI_WAIT_MS, MumbotNotifier } from './mumbot.ts';
import { GITHUB_WEBHOOK_MAX_BODY, decide, verifySignature, type GhPayload } from './githubhook.ts';
import { handleMcpRequest } from './mcp.ts';
import { clientSetups, helpPage, mcpUrl } from './mcphelp.ts';

/** Expiry choices for API tokens in days; null means the token never expires. */
export const API_TOKEN_DAYS = [30, 90, 365, null] as const;
/** Working tokens a user can have at once. */
export const MAX_API_TOKENS = 25;
const API_TOKEN_RE = /^mcr_[A-Za-z0-9_-]{43}$/;
const MCP_MAX_BODY = 64 * 1024;

export interface AppDeps {
  config: Config;
  store: Store;
  /** Injected for tests; defaults to global fetch. Used for GitHub and the Mumbot webhook. */
  fetchFn?: typeof fetch;
  /** Mumbot notifier; built from the config when not given. */
  mumbot?: MumbotNotifier;
  /** Mumbot notifier for the GitHub cards (MUMBOT_GITHUB_CHANNEL); built from the config when not given. */
  githubMumbot?: MumbotNotifier;
  /** How long a new group's card waits for the AI analysis (default 30 s). */
  notifyAiWaitMs?: number;
  /** Anthropic client; null disables AI analysis. */
  anthropic?: AnthropicLike | null;
  /** WebAuthn verification; injected by tests, defaults to @simplewebauthn/server. */
  webauthn?: WebAuthnVerifier;
  /** Clock for the sign-in lockout, pending logins and TOTP; injected by tests. */
  now?: () => number;
  /** Where failed sign-ins are logged (username only); defaults to console.warn. */
  authLog?: (msg: string) => void;
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
  /** Separate budget for the token-guarded pages and calls (setup, invites). */
  const authLimiter = new RateLimiter(config.rateLimitPerMinute);
  /** Per-IP budget for the sign-in and enrollment calls. */
  const loginLimiter = new RateLimiter(config.rateLimitPerMinute);
  const authCore = new AuthCore(config, store, { now: deps.now, log: deps.authLog });
  const sources = new SourceFetcher({ fetchFn, repo: config.githubRepo, token: config.githubToken });
  const repoName = config.githubRepo.split('/')[1] ?? 'mumcord';
  const running = new Set<string>();
  const mumbot =
    deps.mumbot ??
    new MumbotNotifier({
      url: config.mumbotWebhookUrl,
      token: config.mumbotWebhookToken,
      channel: config.mumbotChannel,
      fetchFn,
    });
  const githubMumbot =
    deps.githubMumbot ??
    new MumbotNotifier({
      url: config.mumbotWebhookUrl,
      token: config.mumbotWebhookToken,
      channel: config.mumbotGithubChannel,
      fetchFn,
    });
  const aiWaitMs = deps.notifyAiWaitMs ?? AI_WAIT_MS;
  const notifications = new Set<Promise<void>>();

  const files = {
    html: staticFile('../public/index.html'),
    js: staticFile('../public/app.js'),
    css: staticFile('../public/style.css'),
    webauthn: staticFile('../node_modules/@simplewebauthn/browser/dist/bundle/index.umd.min.js'),
    help: staticFile('../public/help.js'),
    mcpHelp: helpPage(config.origin),
  };
  const version = (JSON.parse(staticFile('../package.json')) as { version: string }).version;
  const now = deps.now ?? Date.now;

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

  /**
   * Posts the group's card to Mumbot, after the AI analysis when one runs (at most `aiWaitMs`).
   * Runs in the background and never throws, so webhook trouble never touches ingest.
   */
  function notify(groupId: string, aiRun: Promise<void> | null, previousStatus: Status | null): void {
    const task = (async () => {
      if (aiRun) {
        let timer: NodeJS.Timeout | undefined;
        const wait = new Promise<void>((resolve) => {
          timer = setTimeout(resolve, aiWaitMs);
          timer.unref();
        });
        await Promise.race([aiRun, wait]);
        clearTimeout(timer);
      }
      const group = store.getGroup(groupId);
      if (!group) return;
      const latest = store.latestReports(groupId, 1)[0] ?? null;
      await mumbot.post({
        group,
        latest,
        regression: previousStatus !== null,
        previousStatus,
        origin: config.origin,
        repoName,
      });
    })().catch((e) => console.warn(`mumbot: ${e instanceof Error ? e.message : String(e)}`));
    notifications.add(task);
    void task.finally(() => notifications.delete(task));
  }

  /** Resolves when all pending channel notifications are done (tests). */
  const notificationsSettled = async () => {
    while (notifications.size) await Promise.all([...notifications]);
  };

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
      const { id, isNew, previousStatus } = store.ingest(parsed.value, fp);
      const aiRun =
        isNew && anthropic ? new Promise<void>((resolve) => setImmediate(() => void analyze(group).finally(resolve))) : null;
      // Channel card: a new group, or a fixed/ignored group that comes back. Further reports of an
      // open group stay quiet; the per-group cooldown allows one card per hour at most.
      const regression = previousStatus === 'fixed' || previousStatus === 'ignored';
      if ((isNew || regression) && mumbot.claim(group)) notify(group, aiRun, isNew ? null : previousStatus);
      return c.json({ id, group }, 201);
    },
  );

  // ---- GitHub organisation webhook ----
  app.post(
    '/api/github/webhook',
    async (c, next) => (config.githubWebhookSecret ? next() : c.json({ error: 'not found' }, 404)),
    bodyLimit({ maxSize: GITHUB_WEBHOOK_MAX_BODY, onError: (c) => c.json({ error: 'body too large' }, 413) }),
    async (c) => {
      const raw = new Uint8Array(await c.req.arrayBuffer());
      if (!verifySignature(config.githubWebhookSecret, raw, c.req.header('x-hub-signature-256'))) {
        return c.json({ error: 'bad signature' }, 401);
      }
      const event = c.req.header('x-github-event') ?? '';
      let payload: GhPayload;
      try {
        const body = new TextDecoder().decode(raw);
        const type = (c.req.header('content-type') ?? '').split(';')[0].trim().toLowerCase();
        payload = JSON.parse(type === 'application/x-www-form-urlencoded' ? (new URLSearchParams(body).get('payload') ?? '') : body);
        if (!payload || typeof payload !== 'object') throw new Error('not an object');
      } catch {
        return c.json({ error: 'invalid JSON' }, 400);
      }
      const decision = decide(event, payload);
      if (decision.kind === 'ping') return c.json({ ok: true });
      if (decision.kind === 'ignore') return c.json({ ignored: decision.reason }, 202);
      const delivery = c.req.header('x-github-delivery')?.trim();
      if (delivery && !store.claimGithubDelivery(`delivery:${delivery.slice(0, 100)}`)) return c.json({ duplicate: true });
      if (!store.claimGithubDelivery(decision.key)) return c.json({ duplicate: true });
      if (!githubMumbot.enabled) {
        console.warn('github webhook: Mumbot is not configured, card not posted');
        return c.json({ ok: true, posted: false });
      }
      // Reply right away; the card goes out in the background and failures are only logged.
      const task = githubMumbot.postCard(decision.card, `GitHub card ${decision.key}`).then(
        () => undefined,
        (e) => console.warn(`mumbot: ${e instanceof Error ? e.message : String(e)}`),
      );
      notifications.add(task);
      void task.finally(() => notifications.delete(task));
      return c.json({ ok: true });
    },
  );

  // ---- MCP (read-only, personal API tokens) ----
  const mcpLimiter = new RateLimiter(config.mcpRateLimitPerMinute);
  app.on(['GET', 'DELETE'], '/mcp', (c) => {
    // Stateless server: no SSE stream to open and no session to end.
    c.header('Allow', 'POST');
    return c.json({ jsonrpc: '2.0', error: { code: -32000, message: 'Method not allowed.' }, id: null }, 405);
  });
  app.post(
    '/mcp',
    bodyLimit({ maxSize: MCP_MAX_BODY, onError: (c) => c.json({ error: 'body too large' }, 413) }),
    async (c) => {
      const m = /^Bearer +(\S+) *$/i.exec(c.req.header('authorization') ?? '');
      const presented = m?.[1];
      const token = presented && API_TOKEN_RE.test(presented) ? store.validApiToken(hashToken(presented), new Date(now())) : null;
      if (!token) {
        c.header('WWW-Authenticate', presented ? 'Bearer realm="mcp", error="invalid_token"' : 'Bearer realm="mcp"');
        return c.json({ error: 'unauthorized' }, 401);
      }
      const wait = mcpLimiter.check(token.id);
      if (wait > 0) {
        c.header('Retry-After', String(wait));
        return c.json({ error: 'rate limited' }, 429);
      }
      store.touchApiToken(token.id, new Date(now()));
      return handleMcpRequest(c.req.raw, { store, origin: config.origin, version, now });
    },
  );

  // ---- auth ----
  const limitBy = (limiter: RateLimiter): MiddlewareHandler => async (c, next) => {
    const wait = limiter.check(deps.getClientIp ? deps.getClientIp(c, c.env) : 'unknown');
    if (wait > 0) {
      c.header('Retry-After', String(wait));
      return c.json({ error: 'Too many requests. Please wait a minute.' }, 429);
    }
    await next();
  };
  const rateLimited = limitBy(authLimiter);
  const loginLimited = limitBy(loginLimiter);
  app.use('/api/auth/*', csrfGuard(config));
  app.use('/api/auth/invite/*', rateLimited);
  for (const p of ['login', 'password', 'enroll', 'register']) app.use(`/api/auth/${p}/*`, loginLimited);
  app.route('/api/auth', authRoutes(config, store, { verifier: deps.webauthn, core: authCore }));

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

  // ---- people & sign-in ----
  const sessionCredential = (c: Context) => {
    const session = currentSession(c, store);
    return { session, credential: session ? store.sessionCredential(session) : null };
  };

  admin.route('/account', accountRoutes(config, store, authCore));

  admin.get('/users', (c) => {
    const { user, session } = currentUser(c, store);
    const credential = session ? store.sessionCredential(session) : null;
    return c.json(
      store.listUsers().map((u) => ({
        id: u.id,
        username: u.username,
        display_name: u.display_name,
        created_at: u.created_at,
        invited_by: u.invited_by,
        password_2fa: u.password_2fa,
        recovery_codes_left: u.recovery_codes_left,
        locked: !!u.locked_until && new Date(u.locked_until).getTime() > authCore.now(),
        current: u.id === user?.id,
        passkeys: u.passkeys.map((cr) => ({
          id: cr.id,
          name: cr.name,
          created_at: cr.created_at,
          last_used_at: cr.last_used_at,
          invited_by: cr.invited_by,
          current: cr.id === credential,
        })),
      })),
    );
  });

  /** Deleting a user ends their sessions; the last user who can sign in cannot be deleted. */
  admin.delete('/users/:id', (c) => {
    const id = c.req.param('id');
    const { user } = currentUser(c, store);
    const r = store.deleteUser(id);
    if (r === 'last') return c.json({ error: 'This is the last user who can sign in; it cannot be deleted.' }, 400);
    if (r === 'not found') return c.json({ error: 'not found' }, 404);
    const self = id === user?.id;
    if (self) deleteCookie(c, SESSION_COOKIE, { path: '/', secure: config.cookieSecure });
    return c.json({ ok: true, self });
  });

  /** Removes another user's password + 2FA and ends their sessions; they need a new invite link. */
  admin.post('/users/:id/reset-password', (c) => {
    const id = c.req.param('id');
    const { user } = currentUser(c, store);
    if (id === user?.id) return c.json({ error: 'Use "My sign-in" to change your own password or 2FA.' }, 400);
    const target = store.getUser(id);
    if (!target) return c.json({ error: 'not found' }, 404);
    if (!target.password_hash && !target.totp_secret_enc) return c.json({ error: 'This user has no password set up.' }, 409);
    const r = store.clearPassword(id);
    if (r === 'last') return c.json({ error: 'This is the last way to sign in to the service; it cannot be reset.' }, 400);
    if (r === 'not found') return c.json({ error: 'not found' }, 404);
    return c.json({ ok: true, needs_invite: store.passkeyCount(id) === 0 });
  });

  admin.get('/credentials', (c) => {
    const { credential } = sessionCredential(c);
    return c.json(
      store.listCredentials().map((cr) => ({
        id: cr.id,
        name: cr.name,
        created_at: cr.created_at,
        last_used_at: cr.last_used_at,
        invited_by: cr.invited_by,
        user_id: cr.user_id,
        current: cr.id === credential,
      })),
    );
  });

  admin.delete('/credentials/:id', (c) => {
    const id = c.req.param('id');
    const { credential } = sessionCredential(c);
    const r = store.deleteCredential(id);
    if (r === 'last') return c.json({ error: 'This is the last way to sign in to the service; it cannot be deleted.' }, 400);
    if (r === 'not found') return c.json({ error: 'not found' }, 404);
    // Its sessions are gone, this one included when it was your own passkey.
    const self = id === credential;
    if (self) deleteCookie(c, SESSION_COOKIE, { path: '/', secure: config.cookieSecure });
    return c.json({ ok: true, self });
  });

  admin.get('/invites', (c) => c.json(store.listInvites()));

  admin.post('/invites', async (c) => {
    const body = (await c.req.json().catch(() => ({}))) as { label?: unknown; ttl_hours?: unknown; user_id?: unknown };
    const ttl = body.ttl_hours ?? 24;
    if (!(INVITE_TTL_HOURS as readonly unknown[]).includes(ttl)) return c.json({ error: 'ttl_hours must be 1, 24 or 168' }, 400);
    const label = typeof body.label === 'string' ? body.label.trim().slice(0, 60) : '';
    let forUserId: string | null = null;
    if (body.user_id !== undefined) {
      const target = typeof body.user_id === 'string' ? store.getUser(body.user_id) : null;
      if (!target) return c.json({ error: 'user not found' }, 404);
      forUserId = target.id;
    }
    const { session, credential } = sessionCredential(c);
    const creator = session ? store.sessionUser(session) : null;
    const token = randomBytes(32).toString('base64url');
    const expiresAt = new Date(Date.now() + (ttl as number) * 3_600_000);
    const id = store.createInvite({
      tokenHash: hashToken(token),
      label,
      createdByCredential: credential,
      createdBySession: session,
      createdByUser: creator,
      forUserId,
      expiresAt,
    });
    // The token sits in the fragment, so it never reaches server or proxy logs.
    return c.json({ id, url: `${config.origin}/invite#${token}`, expires_at: expiresAt.toISOString() }, 201);
  });

  admin.delete('/invites/:id', (c) =>
    store.revokeInvite(c.req.param('id')) ? c.json({ ok: true }) : c.json({ error: 'not found or no longer open' }, 404),
  );

  // ---- personal API tokens (for /mcp only) ----
  /** The signed-in user; sessions from before users existed cannot hold tokens. */
  const tokenOwner = (c: Context) => currentUser(c, store).user;
  const tokenView = (t: { id: string; name: string; prefix: string; created_at: string; expires_at: string | null; last_used_at: string | null }) => ({
    id: t.id,
    name: t.name,
    prefix: t.prefix,
    created_at: t.created_at,
    expires_at: t.expires_at,
    last_used_at: t.last_used_at,
  });

  admin.get('/tokens', (c) => {
    const user = tokenOwner(c);
    if (!user) return c.json({ error: 'Sign in again to manage API tokens.' }, 400);
    return c.json({ mcp_url: mcpUrl(config.origin), tokens: store.listApiTokens(user.id, new Date(now())).map(tokenView) });
  });

  admin.post('/tokens', async (c) => {
    const user = tokenOwner(c);
    if (!user) return c.json({ error: 'Sign in again to manage API tokens.' }, 400);
    const body = (await c.req.json().catch(() => ({}))) as { name?: unknown; expires_in_days?: unknown };
    const name = typeof body.name === 'string' ? body.name.trim() : '';
    if (!name || name.length > 80) return c.json({ error: 'A name (1 to 80 characters) is required.' }, 400);
    const days = body.expires_in_days === undefined ? 90 : body.expires_in_days;
    if (!(API_TOKEN_DAYS as readonly unknown[]).includes(days)) return c.json({ error: 'expires_in_days must be 30, 90, 365 or null' }, 400);
    const t0 = new Date(now());
    if (store.activeApiTokenCount(user.id, t0) >= MAX_API_TOKENS) {
      return c.json({ error: `At most ${MAX_API_TOKENS} API tokens; revoke one first.` }, 409);
    }
    const token = `mcr_${randomBytes(32).toString('base64url')}`;
    const row = store.createApiToken({
      userId: user.id,
      name,
      tokenHash: hashToken(token),
      prefix: token.slice(0, 8),
      expiresAt: days === null ? null : new Date(t0.getTime() + (days as number) * 86_400_000),
      now: t0,
    });
    // The only time the token leaves the server; it is not stored.
    return c.json({ ...tokenView(row), token, mcp_url: mcpUrl(config.origin), setups: clientSetups(config.origin, token) }, 201);
  });

  admin.delete('/tokens/:id', (c) => {
    const user = tokenOwner(c);
    if (!user) return c.json({ error: 'Sign in again to manage API tokens.' }, 400);
    return store.revokeApiToken(c.req.param('id'), user.id, new Date(now()))
      ? c.json({ ok: true })
      : c.json({ error: 'not found or already revoked' }, 404);
  });

  app.route('/api/admin', admin);

  // ---- UI ----
  const page = (c: Context) => c.html(files.html);
  app.get('/', (c) => page(c));
  app.get('/invite', rateLimited, (c) => page(c));
  app.get('/setup', rateLimited, (c) => {
    if (store.signInUserCount() > 0) return c.redirect('/');
    if (!setupTokenOk(config, c.req.query('token'))) return c.text('Invalid or missing setup token', 403);
    return page(c);
  });
  const asset = (body: string, type: string) => () =>
    new Response(body, { headers: { 'content-type': type, 'cache-control': 'no-cache' } });
  app.get('/static/app.js', asset(files.js, 'text/javascript; charset=utf-8'));
  app.get('/static/style.css', asset(files.css, 'text/css; charset=utf-8'));
  app.get('/static/help.js', asset(files.help, 'text/javascript; charset=utf-8'));
  app.get('/help', (c) => c.redirect('/help/mcp'));
  app.get('/help/mcp', (c) => c.html(files.mcpHelp));
  app.get('/static/webauthn.js', asset(files.webauthn, 'text/javascript; charset=utf-8'));

  return { app, analyze, notificationsSettled };
}
