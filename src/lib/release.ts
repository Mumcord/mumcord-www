// Latest Mumcord release, read from the GitHub API at build time. Visitors never
// talk to GitHub until they click a download, so the page itself stays
// request-free. A scheduled pipeline rebuilds the site to pick up new releases.

import { readFile } from "node:fs/promises";

export const REPO = "ToBee94/mumcord";
export const REPO_URL = `https://github.com/${REPO}`;
export const RELEASES_URL = `${REPO_URL}/releases`;
export const LATEST_URL = `${REPO_URL}/releases/latest`;
export const WIKI_URL = `${REPO_URL}/wiki`;
export const ISSUES_URL = `${REPO_URL}/issues`;
/** The Linux installer as users type it; always the latest release's copy. */
export const INSTALL_COMMAND = `curl -fsSL ${REPO_URL}/releases/latest/download/install.sh | sh`;
export const UNINSTALL_COMMAND = `${INSTALL_COMMAND} -s -- --uninstall`;

export type Platform = "windows" | "macos" | "linux";

export interface Asset {
  name: string;
  url: string;
  size: number;
}

export interface Release {
  tag: string;
  version: string;
  name: string;
  url: string;
  publishedAt: string;
  prerelease: boolean;
  assets: Record<Platform, Asset[]>;
  checksums?: Asset;
  /** The one-line Linux installer (install.sh), in releases that ship it. */
  installer?: Asset;
  /** Whether the release notes say the platform's build is signed (written by Mumcord's release.yml). */
  signed: Record<"windows" | "macos", boolean>;
}

interface GhAsset {
  name: string;
  browser_download_url: string;
  size: number;
}

interface GhRelease {
  tag_name: string;
  name: string | null;
  html_url: string;
  published_at: string;
  prerelease: boolean;
  draft: boolean;
  body?: string | null;
  assets: GhAsset[];
}

function platformOf(name: string): Platform | null {
  const n = name.toLowerCase();
  if (n.endsWith(".exe") || n.endsWith(".msi")) return "windows";
  if (n.endsWith(".dmg")) return "macos";
  if (n.endsWith(".appimage") || n.endsWith(".deb") || n.endsWith(".rpm")) return "linux";
  return null;
}

// The first asset is the platform's main download: the x86_64 AppImage on Linux (it runs on any
// distro), then the native packages, x86_64 before ARM.
function rank(name: string): number {
  const n = name.toLowerCase();
  const arm = /aarch64|arm64/.test(n) ? 10 : 0;
  const kind = n.endsWith(".appimage") ? 0 : n.endsWith(".deb") ? 1 : n.endsWith(".rpm") ? 2 : 3;
  return arm + kind;
}

let cached: Promise<Release[]> | undefined;

function toRelease(rel: GhRelease): Release {
  const assets: Record<Platform, Asset[]> = { windows: [], macos: [], linux: [] };
  let checksums: Asset | undefined;
  let installer: Asset | undefined;
  for (const a of rel.assets) {
    const asset = { name: a.name, url: a.browser_download_url, size: a.size };
    if (/sha256sums/i.test(a.name)) checksums = asset;
    if (a.name === "install.sh") installer = asset;
    const p = platformOf(a.name);
    if (p) assets[p].push(asset);
  }
  for (const p of Object.keys(assets) as Platform[]) assets[p].sort((x, y) => rank(x.name) - rank(y.name));
  return {
    tag: rel.tag_name,
    version: rel.tag_name.replace(/^v/, ""),
    name: rel.name || rel.tag_name,
    url: rel.html_url,
    publishedAt: rel.published_at,
    prerelease: rel.prerelease,
    assets,
    checksums,
    installer,
    signed: {
      windows: /Windows: the app and installer are signed/.test(rel.body ?? ""),
      macos: /macOS: the app is signed and notarized/.test(rel.body ?? ""),
    },
  };
}

async function load(): Promise<Release[]> {
  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "User-Agent": "mumcord-www-build",
  };
  if (process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;

  try {
    let list: GhRelease[];
    if (process.env.RELEASE_FIXTURE) {
      // Preview the download section before a release exists (see README).
      list = JSON.parse(await readFile(process.env.RELEASE_FIXTURE, "utf8")) as GhRelease[];
    } else {
      // /releases (not /releases/latest) so pre-releases count too: Mumcord is in alpha.
      const res = await fetch(`https://api.github.com/repos/${REPO}/releases?per_page=50`, { headers });
      if (!res.ok) {
        console.warn(`[release] GitHub API answered ${res.status}; building without release data`);
        return [];
      }
      list = (await res.json()) as GhRelease[];
    }
    return list.filter((r) => !r.draft).map(toRelease);
  } catch (err) {
    console.warn("[release] could not reach GitHub; building without release data", err);
    return [];
  }
}

/** Published releases, newest first (drafts are left out). */
export function getReleases(): Promise<Release[]> {
  cached ??= load();
  return cached;
}

export async function getLatestRelease(): Promise<Release | null> {
  return (await getReleases())[0] ?? null;
}

export function formatSize(bytes: number): string {
  return `${(bytes / 1024 / 1024).toFixed(0)} MB`;
}
