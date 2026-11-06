import { test } from 'node:test';
import assert from 'node:assert/strict';
import { appFrames, fingerprint, lastLogModule, normalizeMessage, normalizeSymbol, redactHome } from '../src/fingerprint.ts';
import { parseCrashText, type CrashReport } from '../src/report.ts';
import { fixture } from './helpers.ts';

const parse = (text: string): CrashReport => {
  const r = parseCrashText(text);
  assert.ok(r.ok, JSON.stringify(!r.ok && r.errors));
  return r.value;
};

test('parseCrashText reads header, sections, backtrace and log lines of a panic', () => {
  const r = parse(fixture('panic'));
  assert.equal(r.app_version, '0.7.1');
  assert.equal(r.os, 'linux');
  assert.equal(r.arch, 'x86_64');
  assert.equal(r.kind, 'panic');
  assert.equal(r.signal, null);
  assert.equal(r.thread, 'screen-decode');
  assert.equal(r.message, 'decoder returned no frame for a keyframe at crates/engine/examples/crash_demo.rs:17');
  assert.equal(r.uptime, '0h 00m 03s');
  assert.equal(r.crash_time, '1794001864');
  assert.equal(r.running.camera, 'on air');
  assert.equal(r.running['watching a screen share'], 'yes');
  assert.equal(r.system.desktop, 'KDE on wayland, plasmashell 6.8.1, display wayland-1');
  assert.match(r.system['gpu 1'], /driver amdgpu/);
  assert.equal(r.os_version, 'CachyOS 7.3.0-4-cachyos');
  assert.match(r.backtrace, /^ {3}0: \{closure#0\}/);
  assert.match(r.backtrace, /23: <unknown>$/);
  assert.equal(r.log_tail, null);
  assert.equal(r.raw, fixture('panic'));
});

test('parseCrashText handles a signal without backtrace', () => {
  const r = parse(fixture('sigsegv'));
  assert.equal(r.kind, 'signal');
  assert.equal(r.signal, 'SIGSEGV');
  assert.equal(r.thread, null);
  assert.equal(r.backtrace, '');
  assert.equal(r.log_tail!.split('\n').length, 3);
  assert.equal(r.message, 'Mumcord was stopped by SIGSEGV');
});

test('parseCrashText rejects other text and missing fields', () => {
  assert.equal(parseCrashText('hello').ok, false);
  assert.equal(parseCrashText('Mumcord crash report\nkind: panic\n').ok, false);
  assert.equal(parseCrashText('Mumcord crash report\nversion: 1.0; rm\nkind: panic\n').ok, false);
  const crlf = parseCrashText(fixture('sigsegv').replace(/\n/g, '\r\n'));
  assert.ok(crlf.ok && crlf.value.signal === 'SIGSEGV' && crlf.value.running.camera === 'on air');
});

test('appFrames keeps only Mumcord frames and skips the crash handler, toolchain and <unknown>', () => {
  const frames = appFrames(parse(fixture('panic')).backtrace);
  assert.deepEqual(frames, [{ symbol: 'crash_demo::main::{closure#0}', path: 'crates/engine/examples/crash_demo.rs', line: 17 }]);
  const ci = appFrames('  0: app::run::h0123456789abcdef\n      at /home/runner/work/mumcord/mumcord/src-tauri/src/main.rs:5:1\n  1: dep::x\n      at /home/u/.cargo/registry/src/x/lib.rs:1:1');
  assert.deepEqual(ci.map((f) => f.path), ['src-tauri/src/main.rs']);
});

test('normalizeMessage strips the location suffix, numbers, addresses and paths', () => {
  assert.equal(normalizeMessage('decoder returned no frame for a keyframe at crates/engine/examples/crash_demo.rs:17'), 'decoder returned no frame for a keyframe');
  assert.equal(
    normalizeMessage('index 7 out of range at 0x7ffd1234 in /home/alice/mumcord/x id 123e4567-e89b-12d3-a456-426614174000'),
    'index <n> out of range at <addr> in <path> id <uuid>',
  );
  assert.equal(normalizeMessage('failed to open C:\\Users\\bob\\AppData\\mumcord.log'), 'failed to open <path>');
  assert.equal(normalizeSymbol('mumcord::audio::Mixer::mix::h0123456789abcdef'), 'mumcord::audio::Mixer::mix');
});

test('fingerprint groups the same panic across line shifts and versions', () => {
  const base = fixture('panic');
  const a = fingerprint(parse(base));
  const shifted = base
    .replace('version: 0.7.1', 'version: 0.7.2')
    .replace('time: 1794001864', 'time: 1794009999')
    .replace(/crash_demo\.rs:17/g, 'crash_demo.rs:19')
    .replace(/58cf8f9c35b355199727627d07ae34a4e2846d67/g, 'ffffffffffffffffffffffffffffffffffffffff');
  assert.equal(fingerprint(parse(shifted)).id, a.id);
  assert.equal(a.weak, false);
  assert.deepEqual(a.frames, ['crash_demo::main::{closure#0} at crates/engine/examples/crash_demo.rs:17']);
  assert.notEqual(fingerprint(parse(base.replace('no frame for a keyframe', 'a broken stream'))).id, a.id);
  assert.notEqual(fingerprint(parse(base.replace(/crash_demo::main/g, 'crash_demo::other'))).id, a.id);
  assert.match(a.id, /^[0-9a-f]{64}$/);
});

test('signals without backtrace get a weak fingerprint from signal, thread and last log module', () => {
  const s = parse(fixture('sigsegv'));
  assert.equal(lastLogModule(s.log_tail), 'mumcord_engine::screen_share');
  const fp = fingerprint(s);
  assert.equal(fp.weak, true);
  assert.deepEqual(fp.frames, ['(no backtrace) thread: -, last log module: mumcord_engine::screen_share']);
  const otherModule = parse(fixture('sigsegv').replace('mumcord_engine::screen_share: watching', 'mumcord_engine::camera::session: frame'));
  assert.notEqual(fingerprint(otherModule).id, fp.id);
  assert.notEqual(fingerprint(parse(fixture('sigsegv').replace(/SIGSEGV/g, 'SIGABRT'))).id, fp.id);
});

test('redactHome removes user names from home paths', () => {
  assert.equal(redactHome('open /home/alice/.config/x failed'), 'open ~/.config/x failed');
  assert.equal(redactHome('C:\\Users\\Bob\\AppData\\x'), '~\\AppData\\x');
});

test('the trailing comment section from the upload dialog becomes the user note', async () => {
  const { parseCrashText } = await import('../src/report.ts');
  const { readFileSync } = await import('node:fs');
  const text = readFileSync(new URL('./fixtures/panic.txt', import.meta.url), 'utf8').trimEnd() + '\n\ncomment:\nwatched a VP9 share in full screen\n';
  const r = parseCrashText(text);
  assert.ok(r.ok);
  if (r.ok) {
    assert.equal(r.value.user_note, 'watched a VP9 share in full screen');
    assert.ok(!r.value.log_tail?.includes('watched a VP9'));
  }
});
