import { createCipheriv, createDecipheriv, createHash, createHmac, randomBytes, randomInt } from 'node:crypto';

/** RFC 6238 defaults used by every common authenticator app. */
export const TOTP_STEP_S = 30;
export const TOTP_DIGITS = 6;
export const TOTP_ISSUER = 'Mumcord Crash Reports';

const B32 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';

export function base32Encode(buf: Uint8Array): string {
  let bits = 0;
  let value = 0;
  let out = '';
  for (const byte of buf) {
    value = (value << 8) | byte;
    bits += 8;
    while (bits >= 5) {
      out += B32[(value >>> (bits - 5)) & 31];
      bits -= 5;
    }
  }
  if (bits > 0) out += B32[(value << (5 - bits)) & 31];
  return out;
}

export function base32Decode(s: string): Buffer {
  const clean = s.toUpperCase().replace(/[\s=-]/g, '');
  let bits = 0;
  let value = 0;
  const out: number[] = [];
  for (const ch of clean) {
    const i = B32.indexOf(ch);
    if (i < 0) throw new Error('invalid base32');
    value = (value << 5) | i;
    bits += 5;
    if (bits >= 8) {
      out.push((value >>> (bits - 8)) & 255);
      bits -= 8;
    }
  }
  return Buffer.from(out);
}

/** A new 160-bit secret, base32 encoded. */
export const newTotpSecret = (): string => base32Encode(randomBytes(20));

/** RFC 4226 HOTP with SHA-1. */
export function hotp(key: Uint8Array, counter: number, digits = TOTP_DIGITS): string {
  const msg = Buffer.alloc(8);
  msg.writeBigUInt64BE(BigInt(counter));
  const mac = createHmac('sha1', key).update(msg).digest();
  const off = mac[mac.length - 1] & 0x0f;
  const bin = mac.readUInt32BE(off) & 0x7fffffff;
  return String(bin % 10 ** digits).padStart(digits, '0');
}

export const totpStep = (nowMs: number): number => Math.floor(nowMs / 1000 / TOTP_STEP_S);

export function totpCode(secretB32: string, nowMs: number, digits = TOTP_DIGITS): string {
  return hotp(base32Decode(secretB32), totpStep(nowMs), digits);
}

/**
 * Checks a code against the steps now-1, now and now+1 (clock drift). Steps at or before
 * `lastStep` are refused, so a code works once. Returns the matched step, or null.
 */
export function verifyTotp(secretB32: string, code: string, nowMs: number, lastStep: number | null = null): number | null {
  if (!/^\d{6}$/.test(code)) return null;
  const key = base32Decode(secretB32);
  const now = totpStep(nowMs);
  let match: number | null = null;
  for (const step of [now - 1, now, now + 1]) {
    // No early exit: every candidate is computed.
    if (hotp(key, step) === code && (lastStep === null || step > lastStep) && match === null) match = step;
  }
  return match;
}

export function otpauthUrl(username: string, secretB32: string): string {
  const issuer = encodeURIComponent(TOTP_ISSUER);
  return `otpauth://totp/${issuer}:${encodeURIComponent(username)}?secret=${secretB32}&issuer=${issuer}&algorithm=SHA1&digits=${TOTP_DIGITS}&period=${TOTP_STEP_S}`;
}

// ---- encryption at rest ----

/** Parses TOTP_ENCRYPTION_KEY (32 bytes, hex or base64); null when unset or malformed. */
export function parseEncryptionKey(v: string | undefined): Buffer | null {
  if (!v || v.startsWith('CHANGE_ME')) return null;
  const s = v.trim();
  const key = /^[0-9a-fA-F]{64}$/.test(s) ? Buffer.from(s, 'hex') : Buffer.from(s, 'base64');
  return key.length === 32 ? key : null;
}

/** AES-256-GCM; the user id is bound as associated data. Format: `v1.<iv>.<tag>.<ciphertext>` (base64url). */
export function encryptSecret(key: Buffer, secret: string, userId: string): string {
  const iv = randomBytes(12);
  const c = createCipheriv('aes-256-gcm', key, iv);
  c.setAAD(Buffer.from(`totp:${userId}`));
  const ct = Buffer.concat([c.update(secret, 'utf8'), c.final()]);
  return ['v1', iv, c.getAuthTag(), ct].map((p) => (typeof p === 'string' ? p : p.toString('base64url'))).join('.');
}

export function decryptSecret(key: Buffer, blob: string, userId: string): string {
  const [v, iv, tag, ct] = blob.split('.');
  if (v !== 'v1' || !ct) throw new Error('bad TOTP secret format');
  const d = createDecipheriv('aes-256-gcm', key, Buffer.from(iv, 'base64url'));
  d.setAAD(Buffer.from(`totp:${userId}`));
  d.setAuthTag(Buffer.from(tag, 'base64url'));
  return Buffer.concat([d.update(Buffer.from(ct, 'base64url')), d.final()]).toString('utf8');
}

// ---- recovery codes ----

export const RECOVERY_CODE_COUNT = 10;
const RC_ALPHABET = 'abcdefghjkmnpqrstuvwxyz23456789';

/** `xxxxx-xxxxx`, about 49 bits each. */
export function newRecoveryCodes(n = RECOVERY_CODE_COUNT): string[] {
  const one = () => Array.from({ length: 10 }, () => RC_ALPHABET[randomInt(RC_ALPHABET.length)]).join('');
  return Array.from({ length: n }, () => {
    const s = one();
    return `${s.slice(0, 5)}-${s.slice(5)}`;
  });
}

/** Normalized (case, spaces and dashes ignored), then SHA-256; null when not shaped like a code. */
export function recoveryCodeHash(code: string): string | null {
  const n = code.toLowerCase().replace(/[\s-]/g, '');
  return /^[a-z0-9]{10}$/.test(n) ? createHash('sha256').update(n).digest('hex') : null;
}
