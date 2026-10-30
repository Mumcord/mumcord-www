// The people behind Mumcord, read from the GitHub API at build time like the releases.
// Avatars are downloaded and served by the site itself, so visitors never talk to GitHub.

import { REPO } from "./release";
import { MUMBOT_REPO } from "./mumbot";

/** Every repo that counts: the app, Mumbot and this website. */
const REPOS = [REPO, MUMBOT_REPO, "Mumcord/mumcord-www"];

export interface Contributor {
  login: string;
  name: string;
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

let cached: Promise<Contributor[]> | undefined;

async function load(): Promise<Contributor[]> {
  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "User-Agent": "mumcord-www-build",
  };
  if (process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;

  const byLogin = new Map<string, Contributor>();
  try {
    for (const repo of REPOS) {
      const res = await fetch(`https://api.github.com/repos/${repo}/contributors?per_page=100`, { headers });
      if (!res.ok) {
        console.warn(`[contributors] GitHub API answered ${res.status} for ${repo}; leaving it out`);
        continue;
      }
      for (const c of (await res.json()) as GhContributor[]) {
        if (c.type !== "User") continue; // dependabot, github-actions and friends
        const known = byLogin.get(c.login);
        if (known) known.commits += c.contributions;
        else byLogin.set(c.login, { login: c.login, name: c.login, url: c.html_url, avatar: `${c.avatar_url}&s=128`, commits: c.contributions });
      }
    }
    // The display name, where the profile has one.
    await Promise.all(
      [...byLogin.values()].map(async (c) => {
        const res = await fetch(`https://api.github.com/users/${c.login}`, { headers });
        if (res.ok) c.name = ((await res.json()) as { name: string | null }).name || c.login;
      }),
    );
  } catch (err) {
    console.warn("[contributors] could not reach GitHub; building with what came back", err);
  }
  return [...byLogin.values()].sort((a, b) => b.commits - a.commits);
}

/** Everyone who committed to a Mumcord repo, most commits first (bots are left out). */
export function getContributors(): Promise<Contributor[]> {
  cached ??= load();
  return cached;
}
