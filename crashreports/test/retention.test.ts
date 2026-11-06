import { test } from 'node:test';
import assert from 'node:assert/strict';
import { loadConfig } from '../src/config.ts';
import { makeApp, post, sampleReport } from './helpers.ts';

test('reports are kept 90 days by default', () => {
  assert.equal(loadConfig({}).reportRetentionDays, 90);
  assert.equal(loadConfig({ REPORT_RETENTION_DAYS: '30' }).reportRetentionDays, 30);
});

test('prune deletes reports older than the cut-off and keeps the group', async () => {
  const { app, store } = makeApp();
  const res = await post(app, sampleReport());
  assert.equal(res.status, 201);
  const { id, group } = (await res.json()) as { id: string; group: string };

  assert.deepEqual(store.prune(new Date(Date.now() - 90 * 86_400_000)), { reports: 0, sessions: 0 });
  assert.equal(store.latestReports(group, 10).length, 1);

  const r = store.prune(new Date(Date.now() + 1000));
  assert.equal(r.reports, 1);
  assert.equal(store.latestReports(group, 10).length, 0);
  assert.ok(store.getGroup(group), 'group survives');
  assert.ok(id);
});
