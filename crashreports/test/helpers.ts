import { loadConfig, type Config } from '../src/config.ts';
import { Store } from '../src/db.ts';
import { createApp, type AppDeps } from '../src/app.ts';
import { hashToken } from '../src/auth.ts';

export function makeApp(over: Partial<Config> = {}, deps: Partial<AppDeps> = {}) {
  const config = { ...loadConfig({ ORIGIN: 'http://localhost:8787', SETUP_TOKEN: 'setup-secret' }), ...over };
  const store = new Store(':memory:');
  const { app, analyze, notificationsSettled } = createApp({ config, store, getClientIp: (c) => c.req.header('x-test-ip') ?? 'ip', ...deps });
  return { app, analyze, notificationsSettled, store, config };
}

export function adminCookie(store: Store): string {
  const token = 'test-session-token';
  store.createSession(hashToken(token), new Date(Date.now() + 3600_000));
  return `cr_session=${token}`;
}

export const sampleReport = (over: Record<string, unknown> = {}) => ({
  app_version: '0.7.0',
  os: 'linux',
  os_version: 'Arch 6.9',
  arch: 'x86_64',
  kind: 'panic',
  message: "thread 'audio' panicked at crates/engine/src/audio/mixer.rs:142:17:\nindex out of bounds: the len is 3 but the index is 7",
  backtrace: [
    '   0: std::panicking::begin_panic_handler',
    '             at /rustc/abc123/library/std/src/panicking.rs:665:5',
    '   1: core::panicking::panic_fmt',
    '   2: mumcord_engine::audio::mixer::Mixer::mix::h0123456789abcdef',
    '             at /home/runner/work/mumcord/mumcord/crates/engine/src/audio/mixer.rs:142:17',
    '   3: mumcord_engine::audio::pipeline::run::hfedcba9876543210',
    '             at /home/runner/work/mumcord/mumcord/crates/engine/src/audio/pipeline.rs:88:9',
    '   4: std::thread::spawn::{{closure}}',
  ].join('\n'),
  ...over,
});

export function post(app: { request: (p: string, i: RequestInit) => Response | Promise<Response> }, body: unknown, headers: Record<string, string> = {}) {
  return app.request('/api/v1/reports', {
    method: 'POST',
    headers: { 'content-type': 'application/json', ...headers },
    body: typeof body === 'string' ? body : JSON.stringify(body),
  });
}

import { readFileSync } from 'node:fs';
export const fixture = (name: 'panic' | 'sigsegv'): string =>
  readFileSync(new URL(`./fixtures/${name}.txt`, import.meta.url), 'utf8');

export function postText(app: { request: (p: string, i: RequestInit) => Response | Promise<Response> }, text: string, headers: Record<string, string> = {}) {
  return app.request('/api/v1/reports', { method: 'POST', headers: { 'content-type': 'text/plain; charset=utf-8', ...headers }, body: text });
}
