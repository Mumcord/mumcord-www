import type { GroupRow, ReportRow } from './db.ts';
import { blobUrl } from './source.ts';
import { redactHome } from './fingerprint.ts';

export interface IssueDraft {
  title: string;
  body: string;
}

function trimMessage(s: string, max = 70): string {
  const oneLine = s.replace(/\s+/g, ' ').trim();
  return oneLine.length > max ? oneLine.slice(0, max - 1) + '…' : oneLine;
}

/** A code fence that cannot be closed by the content inside it. */
function fence(content: string): string {
  const longest = Math.max(2, ...[...content.matchAll(/`+/g)].map((m) => m[0].length));
  const f = '`'.repeat(longest + 1);
  return `${f}\n${content}\n${f}`;
}

export function buildIssue(group: GroupRow, latest: ReportRow | null, includePrivate: boolean, repo: string): IssueDraft {
  const title = group.ai?.title || `Crash: ${trimMessage(redactHome(group.message))}`;
  const lines: string[] = [];
  if (group.ai) {
    lines.push('### Summary', group.ai.summary, '', `**Likely cause:** ${group.ai.likely_cause}`,
      `**Component (guess):** ${group.ai.component} · **Severity (guess):** ${group.ai.severity}`);
    if (group.ai.suspect_location) lines.push(`**Suspect location:** \`${group.ai.suspect_location}\``);
    if (group.ai.fix_hint) lines.push(`**Fix hint:** ${group.ai.fix_hint}`);
    lines.push('');
  }
  lines.push(
    '### Crash group',
    `- **Kind:** ${group.kind}`,
    `- **Count:** ${group.count}`,
    `- **Versions:** ${group.versions.join(', ')}`,
    `- **OS:** ${group.os_list.join(', ')}`,
    `- **First seen:** ${group.first_seen}`,
    `- **Last seen:** ${group.last_seen}`,
    `- **Fingerprint:** \`${group.id.slice(0, 16)}\``,
    '',
    '### Message',
    fence(redactHome(group.message)),
    '',
    group.weak ? '### Grouping (no backtrace)' : '### Top app frames',
    fence(group.top_frames.join('\n') || '(no frames)'),
  );
  if (latest) {
    const ctx = [
      latest.thread ? `thread: ${latest.thread}` : '',
      latest.uptime ? `uptime: ${latest.uptime}` : '',
      ...Object.entries(latest.running).map(([k, v]) => `running / ${k}: ${v}`),
      ...Object.entries(latest.system).map(([k, v]) => `system / ${k}: ${v}`),
    ].filter(Boolean);
    if (ctx.length) lines.push('', '### Context (latest report)', fence(ctx.join('\n')));
  }
  const sources = group.ai?.sources ?? [];
  if (sources.length) {
    lines.push('', '### Source locations');
    for (const s of sources) lines.push(`- [\`${s.path}:${s.line}\`](${blobUrl(repo, s.ref, s.path, s.line)}) (${s.ref})`);
  }
  if (includePrivate && latest) {
    if (latest.user_note) lines.push('', '### User note (latest report)', fence(latest.user_note));
    if (latest.log_tail) lines.push('', '### Log tail (latest report)', fence(latest.log_tail.slice(-20_000)));
  }
  if (group.ai) lines.push('', '_Summary written by an AI model from the crash data; check before relying on it._');
  return { title, body: lines.join('\n') };
}

export async function createIssue(
  fetchFn: typeof fetch,
  token: string,
  repo: string,
  draft: IssueDraft,
): Promise<string> {
  if (!token) throw new Error('GITHUB_TOKEN is not set');
  if (!/^[\w.-]+\/[\w.-]+$/.test(repo)) throw new Error('GITHUB_REPO must look like owner/name');
  const res = await fetchFn(`https://api.github.com/repos/${repo}/issues`, {
    method: 'POST',
    headers: {
      Accept: 'application/vnd.github+json',
      Authorization: `Bearer ${token}`,
      'X-GitHub-Api-Version': '2022-11-28',
      'Content-Type': 'application/json',
      'User-Agent': 'mumcord-crashreports',
    },
    body: JSON.stringify({ title: draft.title, body: draft.body }),
    signal: AbortSignal.timeout(15_000),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`GitHub API ${res.status}: ${text.slice(0, 200)}`);
  }
  const json = (await res.json()) as { html_url?: string };
  if (!json.html_url) throw new Error('GitHub response had no html_url');
  return json.html_url;
}
