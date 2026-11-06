import { createHash, randomBytes, timingSafeEqual } from 'node:crypto';
import { Hono, type Context, type MiddlewareHandler } from 'hono';
import { deleteCookie, getCookie, setCookie } from 'hono/cookie';
import {
  generateAuthenticationOptions,
  generateRegistrationOptions,
  verifyAuthenticationResponse,
  verifyRegistrationResponse,
} from '@simplewebauthn/server';
import type { Config } from './config.ts';
import type { Store } from './db.ts';

export const SESSION_COOKIE = 'cr_session';
export const CSRF_HEADER = 'x-crashreports-csrf';
const SESSION_DAYS = 7;
const CHALLENGE_TTL_MS = 5 * 60_000;
const USER_ID = new TextEncoder().encode('mumcord-crash-admin');

export const hashToken = (t: string): string => createHash('sha256').update(t).digest('hex');

function safeEqual(a: string, b: string): boolean {
  return timingSafeEqual(createHash('sha256').update(a).digest(), createHash('sha256').update(b).digest());
}

export function setupTokenOk(config: Config, token: unknown): boolean {
  return typeof token === 'string' && config.setupToken.length > 0 && safeEqual(token, config.setupToken);
}

/** Pending WebAuthn challenges, in memory; each is single-use. */
class Challenges {
  private map = new Map<string, { purpose: string; expires: number }>();
  add(challenge: string, purpose: 'register' | 'login'): void {
    const now = Date.now();
    for (const [k, v] of this.map) if (v.expires < now) this.map.delete(k);
    this.map.set(challenge, { purpose, expires: now + CHALLENGE_TTL_MS });
  }
  consume(challenge: string, purpose: string): boolean {
    const e = this.map.get(challenge);
    this.map.delete(challenge);
    return !!e && e.purpose === purpose && e.expires >= Date.now();
  }
}

export function hasSession(c: Context, store: Store): boolean {
  const token = getCookie(c, SESSION_COOKIE);
  return !!token && token.length <= 128 && store.sessionValid(hashToken(token));
}

export function requireSession(store: Store): MiddlewareHandler {
  return async (c, next) => {
    if (!hasSession(c, store)) return c.json({ error: 'unauthorized' }, 401);
    await next();
  };
}

/**
 * CSRF guard for state-changing requests: a custom header (which a cross-site form or
 * simple request cannot set) and, when the browser sends one, a matching Origin.
 */
export function csrfGuard(config: Config): MiddlewareHandler {
  return async (c, next) => {
    if (c.req.method !== 'GET' && c.req.method !== 'HEAD') {
      if (c.req.header(CSRF_HEADER) !== '1') return c.json({ error: 'missing CSRF header' }, 403);
      const origin = c.req.header('origin');
      if (origin && origin !== config.origin) return c.json({ error: 'bad origin' }, 403);
    }
    await next();
  };
}

function startSession(c: Context, config: Config, store: Store): void {
  const token = randomBytes(32).toString('base64url');
  const expires = new Date(Date.now() + SESSION_DAYS * 86_400_000);
  store.purgeExpiredSessions();
  store.createSession(hashToken(token), expires);
  setCookie(c, SESSION_COOKIE, token, {
    httpOnly: true,
    secure: config.cookieSecure,
    sameSite: 'Strict',
    path: '/',
    expires,
    maxAge: SESSION_DAYS * 86_400,
  });
}

export function authRoutes(config: Config, store: Store): Hono {
  const app = new Hono();
  const challenges = new Challenges();

  /** First passkey: needs the setup token. Further passkeys: need a session. */
  const mayRegister = (c: Context, token: unknown): boolean =>
    store.credentialCount() === 0 ? setupTokenOk(config, token) : hasSession(c, store);

  app.get('/state', (c) =>
    c.json({ hasCredentials: store.credentialCount() > 0, loggedIn: hasSession(c, store) }),
  );

  app.post('/register/options', async (c) => {
    const body = (await c.req.json().catch(() => ({}))) as { setup_token?: unknown };
    if (!mayRegister(c, body.setup_token)) return c.json({ error: 'forbidden' }, 403);
    const options = await generateRegistrationOptions({
      rpName: config.rpName,
      rpID: config.rpId,
      userName: 'admin',
      userDisplayName: 'Crash report admin',
      userID: USER_ID,
      attestationType: 'none',
      excludeCredentials: store.listCredentials().map((cr) => ({ id: cr.id, transports: cr.transports })),
      authenticatorSelection: { residentKey: 'required', userVerification: 'preferred' },
    });
    challenges.add(options.challenge, 'register');
    return c.json(options);
  });

  app.post('/register/verify', async (c) => {
    const body = (await c.req.json().catch(() => ({}))) as { setup_token?: unknown; response?: unknown; name?: unknown };
    const firstPasskey = store.credentialCount() === 0;
    if (!mayRegister(c, body.setup_token)) return c.json({ error: 'forbidden' }, 403);
    try {
      const v = await verifyRegistrationResponse({
        response: body.response as Parameters<typeof verifyRegistrationResponse>[0]['response'],
        expectedChallenge: (ch) => challenges.consume(ch, 'register'),
        expectedOrigin: config.origin,
        expectedRPID: config.rpId,
        requireUserVerification: false,
      });
      if (!v.verified) return c.json({ error: 'registration not verified' }, 400);
      const cred = v.registrationInfo.credential;
      store.addCredential({
        id: cred.id,
        publicKey: cred.publicKey,
        counter: cred.counter,
        transports: cred.transports ?? [],
        name: typeof body.name === 'string' ? body.name.slice(0, 60) : '',
      });
      if (firstPasskey) startSession(c, config, store);
      return c.json({ ok: true });
    } catch (e) {
      return c.json({ error: e instanceof Error ? e.message : 'registration failed' }, 400);
    }
  });

  app.post('/login/options', async (c) => {
    if (store.credentialCount() === 0) return c.json({ error: 'no passkey registered yet' }, 409);
    const options = await generateAuthenticationOptions({ rpID: config.rpId, userVerification: 'preferred' });
    challenges.add(options.challenge, 'login');
    return c.json(options);
  });

  app.post('/login/verify', async (c) => {
    const body = (await c.req.json().catch(() => ({}))) as { response?: { id?: unknown } };
    const id = body.response?.id;
    const cred = typeof id === 'string' ? store.getCredential(id) : null;
    if (!cred) return c.json({ error: 'unknown passkey' }, 401);
    try {
      const v = await verifyAuthenticationResponse({
        response: body.response as Parameters<typeof verifyAuthenticationResponse>[0]['response'],
        expectedChallenge: (ch) => challenges.consume(ch, 'login'),
        expectedOrigin: config.origin,
        expectedRPID: config.rpId,
        credential: { id: cred.id, publicKey: new Uint8Array(cred.public_key), counter: cred.counter, transports: cred.transports },
        requireUserVerification: false,
      });
      if (!v.verified) return c.json({ error: 'login not verified' }, 401);
      store.updateCounter(cred.id, v.authenticationInfo.newCounter);
      startSession(c, config, store);
      return c.json({ ok: true });
    } catch (e) {
      return c.json({ error: e instanceof Error ? e.message : 'login failed' }, 401);
    }
  });

  app.post('/logout', (c) => {
    const token = getCookie(c, SESSION_COOKIE);
    if (token) store.deleteSession(hashToken(token));
    deleteCookie(c, SESSION_COOKIE, { path: '/', secure: config.cookieSecure });
    return c.json({ ok: true });
  });

  return app;
}
