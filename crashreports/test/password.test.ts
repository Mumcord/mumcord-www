import { test } from 'node:test';
import assert from 'node:assert/strict';
import { checkPassword, hashPassword, verifyPassword } from '../src/password.ts';
import {
  base32Decode,
  base32Encode,
  decryptSecret,
  encryptSecret,
  hotp,
  newRecoveryCodes,
  otpauthUrl,
  parseEncryptionKey,
  recoveryCodeHash,
  totpCode,
  verifyTotp,
} from '../src/totp.ts';
import { Store } from '../src/db.ts';

test('password policy', () => {
  assert.deepEqual(checkPassword('Correct-Horse-9', 'alice'), []);
  assert.deepEqual(checkPassword('short1!A', 'alice'), ['length']);
  assert.deepEqual(checkPassword('alllowercase-123', 'x'), ['upper']);
  assert.deepEqual(checkPassword('ALLUPPERCASE-123', 'x'), ['lower']);
  assert.deepEqual(checkPassword('No-Digits-Here!', 'x'), ['digit']);
  assert.deepEqual(checkPassword('NoSpecials12345', 'x'), ['special']);
  assert.deepEqual(checkPassword('Ünïcödé-Pässwört-1', 'x'), [], 'unicode letters count');
  assert.deepEqual(checkPassword('My pass phrase 1', 'x'), [], 'a space is a special character');
  assert.deepEqual(checkPassword(`Aa1!${'x'.repeat(253)}`, 'z'), ['max']);
  assert.deepEqual(checkPassword(`Aa1!${'x'.repeat(252)}`, 'z'), [], '256 is allowed');
  assert.deepEqual(checkPassword('Alice-Rocks-2026', 'alice'), ['username'], 'contains the username, any case');
  assert.deepEqual(checkPassword('Alice', 'alice'), ['length', 'digit', 'special', 'username']);
  assert.deepEqual(checkPassword('Password1234!', 'bob'), ['common']);
  assert.deepEqual(checkPassword('P@ssw0rd1234', 'bob'), ['common']);
});

test('scrypt hashes carry their parameters and verify', async () => {
  const h = await hashPassword('Correct-Horse-9');
  const parts = h.split('$');
  assert.deepEqual(parts.slice(0, 4), ['scrypt', '32768', '8', '1']);
  assert.equal(Buffer.from(parts[4], 'base64').length, 16);
  assert.equal(Buffer.from(parts[5], 'base64').length, 64);
  assert.equal(await verifyPassword('Correct-Horse-9', h), true);
  assert.equal(await verifyPassword('Correct-Horse-8', h), false);
  assert.notEqual(await hashPassword('Correct-Horse-9'), h, 'salted');
  assert.equal(await verifyPassword('x', 'garbage'), false);
  assert.equal(await verifyPassword('x', 'scrypt$99999999$8$1$AAAA$AAAA'), false);
});

test('TOTP matches the RFC 6238 SHA-1 test vectors', () => {
  const secret = base32Encode(Buffer.from('12345678901234567890'));
  const vectors: [number, string][] = [
    [59, '94287082'],
    [1111111109, '07081804'],
    [1111111111, '14050471'],
    [1234567890, '89005924'],
    [2000000000, '69279037'],
    [20000000000, '65353130'],
  ];
  for (const [t, code] of vectors) assert.equal(totpCode(secret, t * 1000, 8), code, `T=${t}`);
  // RFC 4226 appendix D (HOTP), 6 digits.
  assert.equal(hotp(Buffer.from('12345678901234567890'), 0), '755224');
  assert.equal(hotp(Buffer.from('12345678901234567890'), 9), '520489');
  assert.deepEqual(base32Decode(secret), Buffer.from('12345678901234567890'));
});

test('TOTP allows one step of drift and refuses replays', () => {
  const secret = base32Encode(Buffer.from('12345678901234567890'));
  const now = 1_700_000_000_000;
  const step = Math.floor(now / 30_000);
  assert.equal(verifyTotp(secret, totpCode(secret, now), now), step);
  assert.equal(verifyTotp(secret, totpCode(secret, now - 30_000), now), step - 1);
  assert.equal(verifyTotp(secret, totpCode(secret, now + 30_000), now), step + 1);
  assert.equal(verifyTotp(secret, totpCode(secret, now - 60_000), now), null);
  assert.equal(verifyTotp(secret, totpCode(secret, now + 60_000), now), null);
  // Replay: the step used last (or an earlier one) is refused.
  assert.equal(verifyTotp(secret, totpCode(secret, now), now, step), null);
  assert.equal(verifyTotp(secret, totpCode(secret, now - 30_000), now, step), null);
  assert.equal(verifyTotp(secret, totpCode(secret, now + 30_000), now, step), step + 1);
  assert.equal(verifyTotp(secret, 'abcdef', now), null);
  assert.equal(verifyTotp(secret, '12345', now), null);
});

test('otpauth URL, key parsing and secret encryption', () => {
  assert.equal(
    otpauthUrl('alice', 'ABC'),
    'otpauth://totp/Mumcord%20Crash%20Reports:alice?secret=ABC&issuer=Mumcord%20Crash%20Reports&algorithm=SHA1&digits=6&period=30',
  );
  const key = Buffer.alloc(32, 1);
  assert.deepEqual(parseEncryptionKey(key.toString('base64')), key);
  assert.deepEqual(parseEncryptionKey(key.toString('hex')), key);
  assert.equal(parseEncryptionKey(undefined), null);
  assert.equal(parseEncryptionKey(''), null);
  assert.equal(parseEncryptionKey('CHANGE_ME'), null);
  assert.equal(parseEncryptionKey(Buffer.alloc(16).toString('base64')), null);
  const blob = encryptSecret(key, 'JBSWY3DPEHPK3PXP', 'u1');
  assert.ok(!blob.includes('JBSWY3DPEHPK3PXP'));
  assert.equal(decryptSecret(key, blob, 'u1'), 'JBSWY3DPEHPK3PXP');
  assert.throws(() => decryptSecret(key, blob, 'u2'), 'bound to the user');
  assert.throws(() => decryptSecret(Buffer.alloc(32, 2), blob, 'u1'), 'wrong key');
});

test('recovery codes are single-use and stored hashed', () => {
  const store = new Store(':memory:');
  const uid = store.createUser({ username: 'alice' });
  const codes = newRecoveryCodes();
  assert.equal(codes.length, 10);
  assert.equal(new Set(codes).size, 10);
  for (const c of codes) assert.match(c, /^[a-z0-9]{5}-[a-z0-9]{5}$/);
  store.replaceRecoveryCodes(uid, codes.map((c) => recoveryCodeHash(c)!));
  const raw = JSON.stringify(store.db.prepare('SELECT * FROM recovery_codes').all());
  assert.ok(!codes.some((c) => raw.includes(c) || raw.includes(c.replace('-', ''))));
  // Case, spaces and the dash do not matter.
  const loose = recoveryCodeHash(` ${codes[0].toUpperCase().replace('-', ' ')} `)!;
  assert.equal(store.useRecoveryCode(uid, loose), true);
  assert.equal(store.useRecoveryCode(uid, recoveryCodeHash(codes[0])!), false, 'second use');
  assert.equal(store.recoveryCodesLeft(uid), 9);
  assert.equal(recoveryCodeHash('nope'), null);
  // Regenerating replaces all codes.
  store.replaceRecoveryCodes(uid, newRecoveryCodes().map((c) => recoveryCodeHash(c)!));
  assert.equal(store.useRecoveryCode(uid, recoveryCodeHash(codes[1])!), false);
  assert.equal(store.recoveryCodesLeft(uid), 10);
});

test('lockout backs off exponentially and is capped at one hour', () => {
  const store = new Store(':memory:');
  const uid = store.createUser({ username: 'alice' });
  const t0 = new Date('2026-01-01T00:00:00Z');
  const lockMin = () => store.lockedForMs(uid, t0) / 60_000;
  for (let i = 1; i <= 4; i++) store.recordFailure(uid, t0);
  assert.equal(lockMin(), 0);
  store.recordFailure(uid, t0);
  assert.equal(lockMin(), 1);
  store.recordFailure(uid, t0);
  assert.equal(lockMin(), 2);
  store.recordFailure(uid, t0);
  assert.equal(lockMin(), 4);
  for (let i = 0; i < 30; i++) store.recordFailure(uid, t0);
  assert.equal(lockMin(), 60);
  store.resetFailures(uid);
  assert.equal(lockMin(), 0);
});
