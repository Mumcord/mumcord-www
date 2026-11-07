import { createHash, randomBytes, randomUUID, timingSafeEqual } from 'node:crypto';
import { Hono, type Context, type MiddlewareHandler } from 'hono';
import { deleteCookie, getCookie, setCookie } from 'hono/cookie';
import QRCode from 'qrcode';
import {
  generateAuthenticationOptions,
  generateRegistrationOptions,
  verifyAuthenticationResponse,
  verifyRegistrationResponse,
} from '@simplewebauthn/server';
import type { Config } from './config.ts';
import { USERNAME_RE, type InviteProblem, type Store, type UserRow } from './db.ts';
import { COMMON_PASSWORDS, PASSWORD_MAX, PASSWORD_MIN, POLICY_TEXT, checkPassword, dummyVerify, hashPassword, verifyPassword } from './password.ts';
import {
  decryptSecret,
  encryptSecret,
  newRecoveryCodes,
  newTotpSecret,
  otpauthUrl,
  recoveryCodeHash,
  verifyTotp,
} from './totp.ts';

/** The two verify calls, injectable so tests can stand in for a real authenticator. */
export interface WebAuthnVerifier {
  verifyRegistrationResponse: typeof verifyRegistrationResponse;
  verifyAuthenticationResponse: typeof verifyAuthenticationResponse;
}
const defaultVerifier: WebAuthnVerifier = { verifyRegistrationResponse, verifyAuthenticationResponse };

/** Invite validity choices, in hours. */
export const INVITE_TTL_HOURS = [1, 24, 168] as const;
const INVITE_ERRORS: Record<InviteProblem, string> = {
  invalid: 'This invite link is not valid.',
  expired: 'This invite link has expired.',
  used: 'This invite link has already been used.',
  revoked: 'This invite link has been revoked.',
};

/** Hash of a client-supplied invite token, or null when it is not shaped like one. */
export function inviteTokenHash(token: unknown): string | null {
  return typeof token === 'string' && /^[A-Za-z0-9_-]{20,100}$/.test(token) ? hashToken(token) : null;
}

export const SESSION_COOKIE = 'cr_session';
export const CSRF_HEADER = 'x-crashreports-csrf';
const SESSION_DAYS = 7;
const CHALLENGE_TTL_MS = 5 * 60_000;
/** The step between password and code: 5 minutes, 5 attempts. */
export const PENDING_LOGIN_TTL_MS = 5 * 60_000;
export const PENDING_LOGIN_ATTEMPTS = 5;
const ENROLL_TTL_MS = 10 * 60_000;
const ENROLL_ATTEMPTS = 5;

export const LOGIN_FAILED = 'Username or password is wrong.';
const CODE_WRONG = 'The code is wrong.';
const PASSWORD_OFF = 'Password sign-in is off: the server has no TOTP_ENCRYPTION_KEY. Use a passkey.';

export const hashToken = (t: string): string => createHash('sha256').update(t).digest('hex');

function safeEqual(a: string, b: string): boolean {
  return timingSafeEqual(createHash('sha256').update(a).digest(), createHash('sha256').update(b).digest());
}

export function setupTokenOk(config: Config, token: unknown): boolean {
  return typeof token === 'string' && config.setupToken.length > 0 && safeEqual(token, config.setupToken);
}

const str = (v: unknown, max = 1024): string => (typeof v === 'string' ? v.slice(0, max) : '');
/** For logs: the username only, quoted and cut, never a password or code. */
const logName = (u: string): string => JSON.stringify(u.slice(0, 64));

/** Pending WebAuthn challenges, in memory; each is single-use. */
class Challenges {
  private map = new Map<string, { purpose: string; expires: number }>();
  add(challenge: string, purpose: string): void {
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

/** A TOTP enrollment waiting for its first valid code (server side, in memory). */
interface Enrollment {
  kind: 'setup' | 'invite' | 'add' | 'reset';
  username: string;
  /** For 'add' and 'reset': the signed-in user. */
  userId: string | null;
  passwordHash: string | null;
  secret: string;
  inviteHash: string | null;
  expires: number;
  attempts: number;
}

interface PendingLogin {
  userId: string;
  expires: number;
  attempts: number;
}

/** Shared state of the auth routes and the account routes. */
export class AuthCore {
  readonly challenges = new Challenges();
  readonly enrollments = new Map<string, Enrollment>();
  readonly pendingLogins = new Map<string, PendingLogin>();
  readonly now: () => number;
  readonly log: (msg: string) => void;
  private config: Config;
  private store: Store;

  constructor(config: Config, store: Store, opts: { now?: () => number; log?: (msg: string) => void } = {}) {
    this.config = config;
    this.store = store;
    this.now = opts.now ?? Date.now;
    this.log = opts.log ?? ((m) => console.warn(m));
  }

  get passwordEnabled(): boolean {
    return !!this.config.totpEncryptionKey;
  }

  private sweep(): void {
    const t = this.now();
    for (const [k, v] of this.enrollments) if (v.expires < t) this.enrollments.delete(k);
    for (const [k, v] of this.pendingLogins) if (v.expires < t) this.pendingLogins.delete(k);
  }

  async beginEnrollment(e: Omit<Enrollment, 'secret' | 'expires' | 'attempts'>) {
    this.sweep();
    const id = randomBytes(24).toString('base64url');
    const secret = newTotpSecret();
    this.enrollments.set(hashToken(id), { ...e, secret, expires: this.now() + ENROLL_TTL_MS, attempts: 0 });
    const otpauth = otpauthUrl(e.username, secret);
    const svg = await QRCode.toString(otpauth, { type: 'svg', errorCorrectionLevel: 'M', margin: 2 });
    return { enroll_id: id, secret, otpauth, qr: `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}` };
  }

  /**
   * Checks the first code of an enrollment. Returns the enrollment and the matched step, or an
   * error (the enrollment is dropped after 5 wrong codes or when it expired).
   */
  checkEnrollment(id: unknown, code: unknown, kinds: Enrollment['kind'][]):
    | { ok: true; e: Enrollment; step: number; key: string }
    | { ok: false; status: 400 | 410; error: string; restart: boolean } {
    const key = typeof id === 'string' && id.length < 100 ? hashToken(id) : '';
    const e = this.enrollments.get(key);
    if (!e || !kinds.includes(e.kind) || e.expires < this.now()) {
      this.enrollments.delete(key);
      return { ok: false, status: 410, error: 'This setup step has expired. Please start again.', restart: true };
    }
    const step = verifyTotp(e.secret, str(code, 20).replace(/\s/g, ''), this.now());
    if (step === null) {
      e.attempts++;
      if (e.attempts >= ENROLL_ATTEMPTS) {
        this.enrollments.delete(key);
        return { ok: false, status: 410, error: 'Too many wrong codes. Please start again.', restart: true };
      }
      return { ok: false, status: 400, error: CODE_WRONG, restart: false };
    }
    return { ok: true, e, step, key };
  }

  encrypt(secret: string, userId: string): string {
    return encryptSecret(this.config.totpEncryptionKey!, secret, userId);
  }

  /** New recovery codes: the plain codes (shown once) and their hashes (stored). */
  recoveryCodes(): { codes: string[]; hashes: string[] } {
    const codes = newRecoveryCodes();
    return { codes, hashes: codes.map((c) => recoveryCodeHash(c)!) };
  }

  /**
   * Checks a TOTP code (replay-protected) or a recovery code (single use). No side effect on
   * failure; the caller counts it.
   */
  secondFactorOk(user: UserRow, code: unknown): boolean {
    const c = str(code, 40).replace(/\s/g, '');
    if (!user.totp_secret_enc || !this.config.totpEncryptionKey) return false;
    if (/^\d{6}$/.test(c)) {
      let secret: string;
      try {
        secret = decryptSecret(this.config.totpEncryptionKey, user.totp_secret_enc, user.id);
      } catch {
        this.log(`[auth] cannot decrypt the TOTP secret of user ${logName(user.username)} (wrong TOTP_ENCRYPTION_KEY?)`);
        return false;
      }
      const step = verifyTotp(secret, c, this.now(), user.totp_last_step);
      return step !== null && this.store.useTotpStep(user.id, step);
    }
    const h = recoveryCodeHash(c);
    return !!h && this.store.useRecoveryCode(user.id, h, new Date(this.now()));
  }

  /** Counts a failed password or code towards the lockout and logs it (username only). */
  fail(user: UserRow, what: string): { lockedMs: number } {
    const r = this.store.recordFailure(user.id, new Date(this.now()));
    this.log(`[auth] failed ${what} for user ${logName(user.username)} (${r.failed} in a row)`);
    return { lockedMs: this.store.lockedForMs(user.id, new Date(this.now())) };
  }

  lockedMs(user: UserRow): number {
    return this.store.lockedForMs(user.id, new Date(this.now()));
  }

  addPendingLogin(userId: string): string {
    this.sweep();
    const token = randomBytes(24).toString('base64url');
    this.pendingLogins.set(hashToken(token), { userId, expires: this.now() + PENDING_LOGIN_TTL_MS, attempts: 0 });
    return token;
  }
}

export const lockedMessage = (ms: number): string =>
  `Too many failed attempts. Try again in ${Math.max(1, Math.ceil(ms / 60_000))} min.`;

export function hasSession(c: Context, store: Store): boolean {
  return currentSession(c, store) !== null;
}

/** The hash of the request's valid session token, or null. */
export function currentSession(c: Context, store: Store): string | null {
  const token = getCookie(c, SESSION_COOKIE);
  if (!token || token.length > 128) return null;
  const hash = hashToken(token);
  return store.sessionValid(hash) ? hash : null;
}

/** The session and the user it belongs to (user null for sessions from before users existed). */
export function currentUser(c: Context, store: Store): { session: string | null; user: UserRow | null } {
  const session = currentSession(c, store);
  const uid = session ? store.sessionUser(session) : null;
  return { session, user: uid ? store.getUser(uid) : null };
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

function startSession(c: Context, config: Config, store: Store, credentialId: string | null, userId: string): void {
  const token = randomBytes(32).toString('base64url');
  const expires = new Date(Date.now() + SESSION_DAYS * 86_400_000);
  store.purgeExpiredSessions();
  store.createSession(hashToken(token), expires, credentialId, userId);
  setCookie(c, SESSION_COOKIE, token, {
    httpOnly: true,
    secure: config.cookieSecure,
    sameSite: 'Strict',
    path: '/',
    expires,
    maxAge: SESSION_DAYS * 86_400,
  });
}

/** Problems with a username for a new user, or null. */
function usernameProblem(store: Store, username: string): { status: 400 | 409; error: string } | null {
  if (!USERNAME_RE.test(username)) {
    return { status: 400, error: 'Username: 2–40 characters, letters, digits and . _ - @, starting with a letter or digit.' };
  }
  if (store.getUserByName(username)) return { status: 409, error: 'This username is taken.' };
  return null;
}

function policyError(password: string, username: string): { error: string; rules: string[] } | null {
  const bad = checkPassword(password, username);
  return bad.length ? { error: `Password: ${bad.map((r) => POLICY_TEXT[r].toLowerCase()).join('; ')}.`, rules: bad } : null;
}

export interface AuthRouteOptions {
  verifier?: WebAuthnVerifier;
  core?: AuthCore;
}

export function authRoutes(config: Config, store: Store, opts: AuthRouteOptions = {}): Hono {
  const app = new Hono();
  const verifier = opts.verifier ?? defaultVerifier;
  const core = opts.core ?? new AuthCore(config, store);
  const { challenges } = core;
  const setupOpen = () => store.signInUserCount() === 0;

  /** First user: needs the setup token. Further passkeys: need a session with a user. */
  const registrant = (c: Context, token: unknown): { first: true } | { first: false; user: UserRow } | null => {
    if (setupOpen()) return setupTokenOk(config, token) ? { first: true } : null;
    const { user } = currentUser(c, store);
    return user ? { first: false, user } : null;
  };

  app.get('/state', (c) => {
    const { session, user } = currentUser(c, store);
    return c.json({
      hasCredentials: !setupOpen(),
      loggedIn: session !== null,
      passwordLogin: core.passwordEnabled,
      user: user ? { id: user.id, username: user.username } : null,
    });
  });

  app.get('/policy', (c) =>
    c.json({ min: PASSWORD_MIN, max: PASSWORD_MAX, rules: POLICY_TEXT, common: COMMON_PASSWORDS, username: USERNAME_RE.source }),
  );

  // ---- passkeys ----

  app.post('/register/options', async (c) => {
    const body = (await c.req.json().catch(() => ({}))) as { setup_token?: unknown; username?: unknown };
    const who = registrant(c, body.setup_token);
    if (!who) return c.json({ error: 'forbidden' }, 403);
    let username: string;
    let userID: Uint8Array<ArrayBuffer>;
    if (who.first) {
      username = str(body.username, 64).trim();
      // The options call may come before the username is known (older clients); verify checks it.
      if (username) {
        const p = usernameProblem(store, username);
        if (p) return c.json({ error: p.error }, p.status);
      }
      userID = randomBytes(16);
    } else {
      username = who.user.username;
      userID = new TextEncoder().encode(who.user.id);
    }
    const options = await generateRegistrationOptions({
      rpName: config.rpName,
      rpID: config.rpId,
      userName: username || 'admin',
      userDisplayName: username ? `Crash report admin (${username})` : 'Crash report admin',
      userID,
      attestationType: 'none',
      excludeCredentials: who.first
        ? []
        : store.listCredentials().filter((cr) => cr.user_id === who.user.id).map((cr) => ({ id: cr.id, transports: cr.transports })),
      authenticatorSelection: { residentKey: 'required', userVerification: 'preferred' },
    });
    challenges.add(options.challenge, 'register');
    return c.json(options);
  });

  app.post('/register/verify', async (c) => {
    const body = (await c.req.json().catch(() => ({}))) as { setup_token?: unknown; response?: unknown; name?: unknown; username?: unknown };
    const who = registrant(c, body.setup_token);
    if (!who) return c.json({ error: 'forbidden' }, 403);
    const username = who.first ? str(body.username, 64).trim() : who.user.username;
    if (who.first) {
      const p = usernameProblem(store, username);
      if (p) return c.json({ error: p.error }, p.status);
    }
    try {
      const v = await verifier.verifyRegistrationResponse({
        response: body.response as Parameters<typeof verifyRegistrationResponse>[0]['response'],
        expectedChallenge: (ch) => challenges.consume(ch, 'register'),
        expectedOrigin: config.origin,
        expectedRPID: config.rpId,
        requireUserVerification: false,
      });
      if (!v.verified) return c.json({ error: 'registration not verified' }, 400);
      const cred = v.registrationInfo.credential;
      const name = str(body.name, 60).trim() || (who.first ? username : '');
      const userId = store.transaction(() => {
        if (who.first && !setupOpen()) throw new Error('already set up');
        const uid = who.first ? store.createUser({ username }) : who.user.id;
        store.addCredential({ id: cred.id, publicKey: cred.publicKey, counter: cred.counter, transports: cred.transports ?? [], name, userId: uid });
        return uid;
      });
      if (who.first) startSession(c, config, store, cred.id, userId);
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
    if (!cred || !cred.user_id) return c.json({ error: 'unknown passkey' }, 401);
    try {
      const v = await verifier.verifyAuthenticationResponse({
        response: body.response as Parameters<typeof verifyAuthenticationResponse>[0]['response'],
        expectedChallenge: (ch) => challenges.consume(ch, 'login'),
        expectedOrigin: config.origin,
        expectedRPID: config.rpId,
        credential: { id: cred.id, publicKey: new Uint8Array(cred.public_key), counter: cred.counter, transports: cred.transports },
        requireUserVerification: false,
      });
      if (!v.verified) return c.json({ error: 'login not verified' }, 401);
      store.markCredentialUsed(cred.id, v.authenticationInfo.newCounter);
      startSession(c, config, store, cred.id, cred.user_id);
      return c.json({ ok: true });
    } catch (e) {
      return c.json({ error: e instanceof Error ? e.message : 'login failed' }, 401);
    }
  });

  // ---- password + TOTP sign-in ----

  app.post('/password/login', async (c) => {
    if (!core.passwordEnabled) return c.json({ error: PASSWORD_OFF }, 403);
    const body = (await c.req.json().catch(() => ({}))) as { username?: unknown; password?: unknown };
    const username = str(body.username, 64).trim();
    const password = str(body.password, PASSWORD_MAX * 4);
    const user = username ? store.getUserByName(username) : null;
    if (!user || !user.password_hash || !user.totp_secret_enc || !password) {
      // Same work as a real check, so the response time does not tell whether the user exists.
      await dummyVerify(password);
      core.log(`[auth] failed password sign-in for user ${logName(username)} (unknown or no password)`);
      return c.json({ error: LOGIN_FAILED }, 401);
    }
    const locked = core.lockedMs(user);
    if (locked > 0) {
      await dummyVerify(password);
      core.log(`[auth] sign-in for locked user ${logName(user.username)} refused`);
      return c.json({ error: lockedMessage(locked) }, 429);
    }
    if (!(await verifyPassword(password, user.password_hash))) {
      const { lockedMs } = core.fail(user, 'password');
      return c.json({ error: lockedMs > 0 ? lockedMessage(lockedMs) : LOGIN_FAILED }, lockedMs > 0 ? 429 : 401);
    }
    // The failure counter is reset only after the code: a known password does not reopen the code guessing.
    return c.json({ step: 'code', pending: core.addPendingLogin(user.id) });
  });

  app.post('/password/verify', async (c) => {
    if (!core.passwordEnabled) return c.json({ error: PASSWORD_OFF }, 403);
    const body = (await c.req.json().catch(() => ({}))) as { pending?: unknown; code?: unknown };
    const key = typeof body.pending === 'string' && body.pending.length < 100 ? hashToken(body.pending) : '';
    const p = core.pendingLogins.get(key);
    const restart = (error: string, status: 401 | 429 = 401) => {
      core.pendingLogins.delete(key);
      return c.json({ error, restart: true }, status);
    };
    if (!p || p.expires < core.now()) return restart('This sign-in has expired. Enter your password again.');
    const user = store.getUser(p.userId);
    if (!user) return restart(LOGIN_FAILED);
    const locked = core.lockedMs(user);
    if (locked > 0) return restart(lockedMessage(locked), 429);
    if (core.secondFactorOk(user, body.code)) {
      core.pendingLogins.delete(key);
      store.resetFailures(user.id);
      startSession(c, config, store, null, user.id);
      return c.json({ ok: true });
    }
    p.attempts++;
    const { lockedMs } = core.fail(user, 'code');
    if (lockedMs > 0) return restart(lockedMessage(lockedMs), 429);
    if (p.attempts >= PENDING_LOGIN_ATTEMPTS) return restart('Too many wrong codes. Enter your password again.');
    return c.json({ error: CODE_WRONG }, 401);
  });

  // ---- password + TOTP enrollment for a new person (setup or invite) ----

  app.post('/enroll/start', async (c) => {
    if (!core.passwordEnabled) return c.json({ error: PASSWORD_OFF }, 403);
    const body = (await c.req.json().catch(() => ({}))) as { setup_token?: unknown; invite_token?: unknown; username?: unknown; password?: unknown };
    let kind: 'setup' | 'invite';
    let inviteHash: string | null = null;
    let username = str(body.username, 64).trim();
    let existing = false;
    if (body.invite_token !== undefined) {
      kind = 'invite';
      inviteHash = inviteTokenHash(body.invite_token);
      const check = inviteHash ? store.checkInvite(inviteHash) : ({ ok: false, problem: 'invalid' } as const);
      if (!check.ok) return c.json({ error: INVITE_ERRORS[check.problem], code: check.problem }, check.problem === 'invalid' ? 404 : 410);
      if (check.forUserId) {
        username = store.getUser(check.forUserId)!.username;
        existing = true;
      }
    } else {
      kind = 'setup';
      if (!setupOpen() || !setupTokenOk(config, body.setup_token)) return c.json({ error: 'forbidden' }, 403);
    }
    if (!existing) {
      const p = usernameProblem(store, username);
      if (p) return c.json({ error: p.error }, p.status);
    }
    const password = str(body.password, PASSWORD_MAX * 4);
    const bad = policyError(password, username);
    if (bad) return c.json(bad, 400);
    const enrollment = await core.beginEnrollment({ kind, username, userId: null, passwordHash: await hashPassword(password), inviteHash });
    return c.json({ ...enrollment, username });
  });

  app.post('/enroll/finish', async (c) => {
    if (!core.passwordEnabled) return c.json({ error: PASSWORD_OFF }, 403);
    const body = (await c.req.json().catch(() => ({}))) as { enroll_id?: unknown; code?: unknown };
    const r = core.checkEnrollment(body.enroll_id, body.code, ['setup', 'invite']);
    if (!r.ok) return c.json({ error: r.error, restart: r.restart }, r.status);
    const { e, step } = r;
    const { codes, hashes } = core.recoveryCodes();
    let userId: string;
    try {
      if (e.kind === 'setup') {
        userId = store.transaction(() => {
          if (!setupOpen()) throw new Error('This service is already set up.');
          const uid = randomUUID();
          store.createUser({ id: uid, username: e.username, passwordHash: e.passwordHash, totpSecretEnc: core.encrypt(e.secret, uid), totpLastStep: step });
          store.replaceRecoveryCodes(uid, hashes);
          return uid;
        });
      } else {
        const redeemed = store.redeemInvite(e.inviteHash!, ({ forUserId, creatorUsername, creatorName }) => {
          if (forUserId) {
            store.setPasswordAndTotp(forUserId, { passwordHash: e.passwordHash!, totpSecretEnc: core.encrypt(e.secret, forUserId), totpLastStep: step, recoveryHashes: hashes });
            store.resetFailures(forUserId);
            return { userId: forUserId };
          }
          const uid = randomUUID();
          store.createUser({ id: uid, username: e.username, invitedBy: creatorUsername ?? creatorName, passwordHash: e.passwordHash, totpSecretEnc: core.encrypt(e.secret, uid), totpLastStep: step });
          store.replaceRecoveryCodes(uid, hashes);
          return { userId: uid };
        });
        if (!redeemed.ok) {
          core.enrollments.delete(r.key);
          return c.json({ error: INVITE_ERRORS[redeemed.problem], code: redeemed.problem, restart: true }, 410);
        }
        userId = redeemed.result.userId;
      }
    } catch (err) {
      core.enrollments.delete(r.key);
      const msg = err instanceof Error && /UNIQUE/.test(err.message) ? 'This username is taken.' : err instanceof Error ? err.message : 'failed';
      return c.json({ error: msg, restart: true }, 409);
    }
    core.enrollments.delete(r.key);
    startSession(c, config, store, null, userId);
    return c.json({ ok: true, recovery_codes: codes });
  });

  // ---- invites: another person gets their own sign-in ----
  // The token travels only in request bodies (the link keeps it in the URL fragment), and only
  // its SHA-256 hash is looked up. It is never logged.

  type InviteBody = { invite_token?: unknown; response?: unknown; name?: unknown; username?: unknown };
  const inviteError = (c: Context, problem: InviteProblem) =>
    c.json({ error: INVITE_ERRORS[problem], code: problem }, problem === 'invalid' ? 404 : 410);
  const readInvite = async (c: Context) => {
    const body = (await c.req.json().catch(() => ({}))) as InviteBody;
    const hash = inviteTokenHash(body.invite_token);
    const check = hash ? store.checkInvite(hash) : ({ ok: false, problem: 'invalid' } as const);
    return { body, hash, check };
  };

  app.post('/invite/info', async (c) => {
    const { check } = await readInvite(c);
    if (!check.ok) return inviteError(c, check.problem);
    const forUser = check.forUserId ? store.getUser(check.forUserId)!.username : null;
    return c.json({ label: check.label, ...(forUser ? { username: forUser } : {}) });
  });

  app.post('/invite/register/options', async (c) => {
    const { body, check } = await readInvite(c);
    if (!check.ok) return inviteError(c, check.problem);
    const target = check.forUserId ? store.getUser(check.forUserId) : null;
    const username = target?.username ?? str(body.username, 64).trim();
    if (!target && username) {
      const p = usernameProblem(store, username);
      if (p) return c.json({ error: p.error }, p.status);
    }
    const display = username || check.label;
    const options = await generateRegistrationOptions({
      rpName: config.rpName,
      rpID: config.rpId,
      userName: display || 'admin',
      userDisplayName: display ? `Crash report admin (${display})` : 'Crash report admin',
      // A user handle of their own, so the invitee's passkey never replaces another admin's on a shared device.
      userID: target ? new TextEncoder().encode(target.id) : randomBytes(16),
      attestationType: 'none',
      authenticatorSelection: { residentKey: 'required', userVerification: 'preferred' },
    });
    challenges.add(options.challenge, `invite:${check.id}`);
    return c.json(options);
  });

  app.post('/invite/register/verify', async (c) => {
    const { body, hash, check } = await readInvite(c);
    if (!hash || !check.ok) return inviteError(c, check.ok ? 'invalid' : check.problem);
    const target = check.forUserId ? store.getUser(check.forUserId) : null;
    const username = target?.username ?? str(body.username, 64).trim();
    if (!target) {
      const p = usernameProblem(store, username);
      if (p) return c.json({ error: p.error }, p.status);
    }
    try {
      const v = await verifier.verifyRegistrationResponse({
        response: body.response as Parameters<typeof verifyRegistrationResponse>[0]['response'],
        expectedChallenge: (ch) => challenges.consume(ch, `invite:${check.id}`),
        expectedOrigin: config.origin,
        expectedRPID: config.rpId,
        requireUserVerification: false,
      });
      if (!v.verified) return c.json({ error: 'registration not verified' }, 400);
      const cred = v.registrationInfo.credential;
      const name = str(body.name, 60).trim() || check.label || username;
      const redeemed = store.redeemInvite(hash, ({ forUserId, creatorName, creatorUsername }) => {
        const uid = forUserId ?? store.createUser({ username, invitedBy: creatorUsername ?? creatorName });
        store.addCredential({
          id: cred.id,
          publicKey: cred.publicKey,
          counter: cred.counter,
          transports: cred.transports ?? [],
          name,
          invitedBy: creatorName,
          userId: uid,
        });
        if (forUserId) store.resetFailures(forUserId);
        return { userId: uid, credentialId: cred.id };
      });
      if (!redeemed.ok) return inviteError(c, redeemed.problem);
      startSession(c, config, store, cred.id, redeemed.result.userId);
      return c.json({ ok: true });
    } catch (e) {
      const msg = e instanceof Error && /UNIQUE/.test(e.message) ? 'This username is taken.' : e instanceof Error ? e.message : 'registration failed';
      return c.json({ error: msg }, 400);
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

/**
 * The signed-in user's own sign-in methods (mounted under /api/admin/account, behind the
 * session and CSRF checks).
 */
export function accountRoutes(config: Config, store: Store, core: AuthCore): Hono<{ Variables: { user: UserRow; session: string } }> {
  const app = new Hono<{ Variables: { user: UserRow; session: string } }>();

  app.use('*', async (c, next) => {
    const { session, user } = currentUser(c, store);
    if (!session) return c.json({ error: 'unauthorized' }, 401);
    if (!user) return c.json({ error: 'This session has no user; sign in again.' }, 403);
    c.set('user', user);
    c.set('session', session);
    await next();
  });

  const needPassword = (c: Context) => (core.passwordEnabled ? null : c.json({ error: PASSWORD_OFF }, 403));
  /** Checks the second factor for an account action; failures count towards the lockout. */
  const verifyCode = (user: UserRow, code: unknown): { ok: true } | { ok: false; status: 401 | 429; error: string } => {
    const locked = core.lockedMs(user);
    if (locked > 0) return { ok: false, status: 429, error: lockedMessage(locked) };
    if (core.secondFactorOk(user, code)) return { ok: true };
    const { lockedMs } = core.fail(user, 'code (account)');
    return lockedMs > 0 ? { ok: false, status: 429, error: lockedMessage(lockedMs) } : { ok: false, status: 401, error: CODE_WRONG };
  };

  app.get('/', (c) => {
    const user = c.get('user');
    return c.json({
      id: user.id,
      username: user.username,
      password_2fa: !!(user.password_hash && user.totp_secret_enc),
      recovery_codes_left: store.recoveryCodesLeft(user.id),
      passkeys: store.passkeyCount(user.id),
      password_login: core.passwordEnabled,
    });
  });

  /** Set up password + TOTP for a user who has only passkeys. */
  app.post('/password/setup', async (c) => {
    const off = needPassword(c);
    if (off) return off;
    const user = c.get('user');
    if (user.password_hash && user.totp_secret_enc) return c.json({ error: 'Password and 2FA are set up already.' }, 409);
    const body = (await c.req.json().catch(() => ({}))) as { password?: unknown };
    const password = str(body.password, PASSWORD_MAX * 4);
    const bad = policyError(password, user.username);
    if (bad) return c.json(bad, 400);
    return c.json(await core.beginEnrollment({ kind: 'add', username: user.username, userId: user.id, passwordHash: await hashPassword(password), inviteHash: null }));
  });

  /** Reset TOTP: needs a current code (or a recovery code), then a new secret is enrolled. */
  app.post('/totp/reset', async (c) => {
    const off = needPassword(c);
    if (off) return off;
    const user = c.get('user');
    if (!user.totp_secret_enc) return c.json({ error: 'No authenticator app is set up.' }, 409);
    const body = (await c.req.json().catch(() => ({}))) as { code?: unknown };
    const v = verifyCode(user, body.code);
    if (!v.ok) return c.json({ error: v.error }, v.status);
    store.resetFailures(user.id);
    return c.json(await core.beginEnrollment({ kind: 'reset', username: user.username, userId: user.id, passwordHash: null, inviteHash: null }));
  });

  app.post('/enroll/finish', async (c) => {
    const off = needPassword(c);
    if (off) return off;
    const user = c.get('user');
    const body = (await c.req.json().catch(() => ({}))) as { enroll_id?: unknown; code?: unknown };
    const r = core.checkEnrollment(body.enroll_id, body.code, ['add', 'reset']);
    if (!r.ok) return c.json({ error: r.error, restart: r.restart }, r.status);
    if (r.e.userId !== user.id) return c.json({ error: 'forbidden' }, 403);
    const { codes, hashes } = core.recoveryCodes();
    store.setPasswordAndTotp(user.id, {
      passwordHash: r.e.passwordHash ?? undefined,
      totpSecretEnc: core.encrypt(r.e.secret, user.id),
      totpLastStep: r.step,
      recoveryHashes: hashes,
    });
    core.enrollments.delete(r.key);
    // A 2FA reset ends the user's other sessions.
    const ended = r.e.kind === 'reset' ? store.deleteUserSessions(user.id, c.get('session')) : 0;
    return c.json({ ok: true, recovery_codes: codes, sessions_ended: ended });
  });

  app.post('/password/change', async (c) => {
    const off = needPassword(c);
    if (off) return off;
    const user = c.get('user');
    if (!user.password_hash || !user.totp_secret_enc) return c.json({ error: 'No password is set up.' }, 409);
    const body = (await c.req.json().catch(() => ({}))) as { current_password?: unknown; code?: unknown; new_password?: unknown };
    const locked = core.lockedMs(user);
    if (locked > 0) return c.json({ error: lockedMessage(locked) }, 429);
    const newPassword = str(body.new_password, PASSWORD_MAX * 4);
    const bad = policyError(newPassword, user.username);
    if (bad) return c.json(bad, 400);
    if (!(await verifyPassword(str(body.current_password, PASSWORD_MAX * 4), user.password_hash))) {
      const { lockedMs } = core.fail(user, 'password (change)');
      return c.json({ error: lockedMs > 0 ? lockedMessage(lockedMs) : 'The current password is wrong.' }, lockedMs > 0 ? 429 : 401);
    }
    const v = verifyCode(user, body.code);
    if (!v.ok) return c.json({ error: v.error }, v.status);
    store.setPasswordHash(user.id, await hashPassword(newPassword));
    store.resetFailures(user.id);
    // A password change ends the user's other sessions.
    const ended = store.deleteUserSessions(user.id, c.get('session'));
    return c.json({ ok: true, sessions_ended: ended });
  });

  app.post('/recovery-codes', async (c) => {
    const off = needPassword(c);
    if (off) return off;
    const user = c.get('user');
    if (!user.totp_secret_enc) return c.json({ error: 'No authenticator app is set up.' }, 409);
    const body = (await c.req.json().catch(() => ({}))) as { code?: unknown };
    const v = verifyCode(user, body.code);
    if (!v.ok) return c.json({ error: v.error }, v.status);
    store.resetFailures(user.id);
    const { codes, hashes } = core.recoveryCodes();
    store.replaceRecoveryCodes(user.id, hashes);
    return c.json({ ok: true, recovery_codes: codes });
  });

  return app;
}
