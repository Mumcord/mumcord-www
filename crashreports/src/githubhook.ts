import { createHmac, timingSafeEqual } from 'node:crypto';
import { attr, cardUrl, text, type Card } from './mumbot.ts';

/**
 * GitHub organisation webhook: new issues and pull requests become Mumcord cards.
 * Payload docs: https://docs.github.com/webhooks/webhook-events-and-payloads
 * Only public metadata goes into the card: title, repo, number, author, labels, branches, size.
 */

export const GITHUB_WEBHOOK_MAX_BODY = 1024 * 1024;

/** Checks `X-Hub-Signature-256: sha256=<hex>` (HMAC-SHA256 of the raw body) in constant time. */
export function verifySignature(secret: string, body: Uint8Array, header: string | undefined): boolean {
  if (!secret || !header) return false;
  const m = /^sha256=([0-9a-f]{64})$/i.exec(header.trim());
  if (!m) return false;
  const want = createHmac('sha256', secret).update(body).digest();
  const got = Buffer.from(m[1], 'hex');
  return got.length === want.length && timingSafeEqual(got, want);
}

interface GhUser {
  login?: string;
  type?: string;
}

interface GhItem {
  number?: number;
  title?: string;
  html_url?: string;
  user?: GhUser;
  labels?: { name?: string }[];
  draft?: boolean;
  base?: { ref?: string };
  head?: { ref?: string; label?: string; repo?: { full_name?: string } | null };
  additions?: number;
  deletions?: number;
}

export interface GhPayload {
  action?: string;
  issue?: GhItem & { pull_request?: unknown };
  pull_request?: GhItem;
  repository?: { full_name?: string; html_url?: string };
  sender?: GhUser;
}

export type WebhookDecision =
  | { kind: 'ping' }
  | { kind: 'ignore'; reason: string }
  | { kind: 'post'; key: string; card: Card };

export function isBot(user: GhUser | undefined): boolean {
  if (!user) return false;
  return user.type === 'Bot' || /\[bot\]$/i.test(user.login ?? '');
}

const GITHUB_URL = /^https:\/\/github\.com\/[\w.\-/#?=&%]+$/;

function link(url: string | undefined, fallback: string): string {
  return cardUrl(url && GITHUB_URL.test(url) ? url : fallback);
}

const count = (n: unknown) => (typeof n === 'number' && Number.isFinite(n) ? n : 0);

export function buildGithubCard(event: 'issues' | 'pull_request', item: GhItem, repo: string, repoUrl?: string): Card {
  const isPr = event === 'pull_request';
  const title = attr(`${isPr ? 'New pull request' : 'New issue'}: ${(item.title ?? '').trim() || '(no title)'}`, 120);
  const lines = [`- Repo: ${text(repo, 100)}`, `- Number: #${count(item.number)}`, `- Author: ${text(item.user?.login ?? 'unknown', 60)}`];
  const labels = (item.labels ?? []).map((l) => text(l.name ?? '', 40)).filter(Boolean);
  if (labels.length) lines.push(`- Labels: ${labels.slice(0, 10).join(', ')}`);
  if (isPr) {
    const base = text(item.base?.ref ?? '', 80);
    // A branch from a fork is shown as owner:branch, like GitHub does.
    const fork = item.head?.repo?.full_name && item.head.repo.full_name !== repo;
    const head = text((fork ? item.head?.label : item.head?.ref) ?? '', 100);
    if (base || head) lines.push(`- Branches: ${base} ← ${head}`);
    lines.push(`- Changes: +${count(item.additions)} / −${count(item.deletions)}`);
  }
  return {
    title,
    color: isPr ? 'success' : 'info',
    icon: isPr ? 'check' : 'info',
    url: link(item.html_url, repoUrl && GITHUB_URL.test(repoUrl) ? repoUrl : `https://github.com/${repo}`),
    lines,
  };
}

/** What to do with a delivery: answer a ping, ignore it, or post a card (deduped by `key`). */
export function decide(event: string, payload: GhPayload): WebhookDecision {
  if (event === 'ping') return { kind: 'ping' };
  const repo = payload.repository?.full_name ?? '';
  if (event === 'issues') {
    if (payload.action !== 'opened') return { kind: 'ignore', reason: `issues.${payload.action}` };
    const issue = payload.issue;
    if (!issue || !repo) return { kind: 'ignore', reason: 'no issue' };
    if (issue.pull_request) return { kind: 'ignore', reason: 'pull request issue' };
    if (isBot(issue.user) || isBot(payload.sender)) return { kind: 'ignore', reason: 'bot' };
    return { kind: 'post', key: `issue:${repo}#${issue.number}`, card: buildGithubCard('issues', issue, repo, payload.repository?.html_url) };
  }
  if (event === 'pull_request') {
    if (payload.action !== 'opened' && payload.action !== 'ready_for_review') {
      return { kind: 'ignore', reason: `pull_request.${payload.action}` };
    }
    const pr = payload.pull_request;
    if (!pr || !repo) return { kind: 'ignore', reason: 'no pull request' };
    if (pr.draft) return { kind: 'ignore', reason: 'draft' };
    if (isBot(pr.user)) return { kind: 'ignore', reason: 'bot' };
    // One card per PR: a PR that goes back to draft and is ready again stays quiet.
    return { kind: 'post', key: `pr:${repo}#${pr.number}`, card: buildGithubCard('pull_request', pr, repo, payload.repository?.html_url) };
  }
  return { kind: 'ignore', reason: event || 'no event' };
}
