import { randomBytes, scrypt as scryptCb, timingSafeEqual, type ScryptOptions } from 'node:crypto';

export const PASSWORD_MIN = 12;
export const PASSWORD_MAX = 256;

/**
 * A small list of the most common passwords (lower case). Most short ones already fail the length
 * rule; the list catches the long, still predictable ones. Compared case-insensitively.
 */
export const COMMON_PASSWORDS: readonly string[] = [
  '123456789012', '1234567890123', '12345678901234', '123456789abc', '1234567890qwerty', '1q2w3e4r5t6y',
  '1qaz2wsx3edc', '1qaz2wsx3edc4rfv', 'qwertyuiop12', 'qwertyuiop123', 'qwerty123456', 'qwerty123456!',
  'qwertyuiopasdfgh', 'asdfghjkl123', 'zxcvbnm12345', 'password1234', 'password12345', 'password123!',
  'password1234!', 'password@123', 'passw0rd1234', 'p@ssw0rd1234', 'p@ssw0rd123!', 'p@ssword1234',
  'passwort1234', 'passwort123!', 'passwort1234!', 'iloveyou1234', 'iloveyou123!', 'letmein12345',
  'letmein123!!', 'welcome12345', 'welcome123!!', 'welcome@1234', 'administrator', 'administrator1',
  'administrator1!', 'admin1234567', 'admin123456!', 'admin@123456', 'changeme1234', 'changeme123!',
  'trustno1trustno1', 'football1234', 'baseball1234', 'superman1234', 'sunshine1234', 'princess1234',
  'starwars1234', 'dragon123456', 'monkey123456', 'abc123456789', 'abcdefghijkl', 'abcd1234abcd',
  'aa123456789!', 'q1w2e3r4t5y6', 'summer2024!!', 'winter2024!!', 'spring2025!!', 'autumn2025!!',
  'sommer2025!!', 'mumcord12345', 'mumcord1234!', 'correcthorsebatterystaple',
];
const COMMON = new Set(COMMON_PASSWORDS);

export type PolicyRule = 'length' | 'max' | 'upper' | 'lower' | 'digit' | 'special' | 'username' | 'common';

export const POLICY_TEXT: Record<PolicyRule, string> = {
  length: `At least ${PASSWORD_MIN} characters`,
  max: `At most ${PASSWORD_MAX} characters`,
  upper: 'An uppercase letter',
  lower: 'A lowercase letter',
  digit: 'A digit',
  special: 'A special character (not a letter or digit)',
  username: 'Does not contain the username',
  common: 'Not a commonly used password',
};

/** The rules the password breaks (empty: it passes). The UI runs the same checks. */
export function checkPassword(password: string, username: string): PolicyRule[] {
  const bad: PolicyRule[] = [];
  const chars = [...password];
  if (chars.length < PASSWORD_MIN) bad.push('length');
  if (chars.length > PASSWORD_MAX) bad.push('max');
  if (!/\p{Lu}/u.test(password)) bad.push('upper');
  if (!/\p{Ll}/u.test(password)) bad.push('lower');
  if (!/\p{Nd}/u.test(password)) bad.push('digit');
  if (!/[^\p{L}\p{N}]/u.test(password)) bad.push('special');
  const u = username.trim().toLowerCase();
  if (u && password.toLowerCase().includes(u)) bad.push('username');
  if (COMMON.has(password.toLowerCase())) bad.push('common');
  return bad;
}

// ---- scrypt ----

const PARAMS = { N: 2 ** 15, r: 8, p: 1, keylen: 64, saltlen: 16 } as const;

function scrypt(password: string, salt: Buffer, keylen: number, opts: ScryptOptions): Promise<Buffer> {
  return new Promise((resolve, reject) =>
    scryptCb(password.normalize('NFC'), salt, keylen, opts, (err, key) => (err ? reject(err) : resolve(key))),
  );
}
const maxmem = (N: number, r: number) => 128 * N * r * 2 + 1024 * 1024;

/** `scrypt$N$r$p$<salt b64>$<key b64>`: the parameters are stored with the hash. */
export async function hashPassword(password: string): Promise<string> {
  const { N, r, p, keylen, saltlen } = PARAMS;
  const salt = randomBytes(saltlen);
  const key = await scrypt(password, salt, keylen, { N, r, p, maxmem: maxmem(N, r) });
  return `scrypt$${N}$${r}$${p}$${salt.toString('base64')}$${key.toString('base64')}`;
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const parts = stored.split('$');
  if (parts.length !== 6 || parts[0] !== 'scrypt') return false;
  const [N, r, p] = parts.slice(1, 4).map(Number);
  if (![N, r, p].every((n) => Number.isInteger(n) && n > 0) || N > 2 ** 20 || r > 32 || p > 16) return false;
  const salt = Buffer.from(parts[4], 'base64');
  const expected = Buffer.from(parts[5], 'base64');
  if (expected.length < 16) return false;
  const key = await scrypt(password, salt, expected.length, { N, r, p, maxmem: maxmem(N, r) });
  return timingSafeEqual(key, expected);
}

let dummy: Promise<string> | null = null;
/** Runs a full scrypt verify against a throwaway hash, so unknown users take as long as known ones. */
export async function dummyVerify(password: string): Promise<void> {
  dummy ??= hashPassword(randomBytes(16).toString('hex'));
  await verifyPassword(password, await dummy);
}
