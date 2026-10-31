// The people behind Mumcord, read from the GitHub API at build time like the releases.
// Avatars are downloaded and served by the site itself, so visitors never talk to GitHub.

import { REPO } from "./release";
import { MUMBOT_REPO } from "./mumbot";

/** Every repo that counts: the app, its tools and this website. */
const REPOS = [REPO, MUMBOT_REPO, "Mumcord/mumpeer", "Mumcord/mumquiz", "Mumcord/mumcord-www"];

export interface Contributor {
  /** Only the GitHub username is shown, never a real name. */
  login: string;
  url: string;
  avatar: string;
  commits: number;
}

interface GhContributor {
  login: string;
  type: string;
  html_url: string;
  avatar_url: string;
  contributions: number;
}

const headers: Record<string, string> = {
  Accept: "application/vnd.github+json",
  "User-Agent": "mumcord-www-build",
};
if (process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;

// One request per repo, however many pages ask.
const repoCache = new Map<string, Promise<Contributor[]>>();

async function loadRepo(repo: string): Promise<Contributor[]> {
  try {
    const res = await fetch(`https://api.github.com/repos/${repo}/contributors?per_page=100`, { headers });
    if (!res.ok) {
      console.warn(`[contributors] GitHub API answered ${res.status} for ${repo}; leaving it out`);
      return [];
    }
    const people = ((await res.json()) as GhContributor[]).filter((c) => c.type === "User"); // no dependabot and friends
    return people.map((c) => ({ login: c.login, url: c.html_url, avatar: `${c.avatar_url}&s=128`, commits: c.contributions }));
  } catch (err) {
    console.warn(`[contributors] could not reach GitHub for ${repo}; leaving it out`, err);
    return [];
  }
}

/** Everyone who committed to one repo, most commits first (bots are left out). */
export function getRepoContributors(repo: string): Promise<Contributor[]> {
  if (!repoCache.has(repo)) repoCache.set(repo, loadRepo(repo));
  return repoCache.get(repo)!;
}

/** Everyone who committed to a Mumcord repo, commits added up, most first. */
export async function getContributors(): Promise<Contributor[]> {
  const byLogin = new Map<string, Contributor>();
  for (const list of await Promise.all(REPOS.map(getRepoContributors)))
    for (const c of list) {
      const known = byLogin.get(c.login);
      if (known) known.commits += c.commits;
      else byLogin.set(c.login, { ...c });
    }
  return [...byLogin.values()].sort((a, b) => b.commits - a.commits);
}
