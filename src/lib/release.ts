// Latest Mumcord release, read from the GitHub API at build time. Visitors never
// talk to GitHub until they click a download, so the page itself stays
// request-free. A scheduled pipeline rebuilds the site to pick up new releases.

export const REPO = "ToBee94/mumcord";
export const REPO_URL = `https://github.com/${REPO}`;
export const RELEASES_URL = `${REPO_URL}/releases`;
export const LATEST_URL = `${REPO_URL}/releases/latest`;
export const ACTIONS_URL = `${REPO_URL}/actions`;
export const WIKI_URL = `${REPO_URL}/wiki`;
export const ISSUES_URL = `${REPO_URL}/issues`;

export type Platform = "windows" | "macos" | "linux";

export interface Asset {
  name: string;
  url: string;
  size: number;
}

export interface Release {
  tag: string;
  name: string;
  url: string;
  publishedAt: string;
  prerelease: boolean;
  assets: Record<Platform, Asset[]>;
  checksums?: Asset;
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
  assets: GhAsset[];
}

function platformOf(name: string): Platform | null {
  const n = name.toLowerCase();
  if (n.endsWith(".exe") || n.endsWith(".msi")) return "windows";
  if (n.endsWith(".dmg")) return "macos";
  if (n.endsWith(".appimage") || n.endsWith(".deb") || n.endsWith(".rpm")) return "linux";
  return null;
}

let cached: Promise<Release | null> | undefined;

async function load(): Promise<Release | null> {
  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "User-Agent": "mumcord-www-build",
  };
  if (process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;

  try {
    // /releases (not /releases/latest) so pre-releases count too: Mumcord is in alpha.
    const res = await fetch(`https://api.github.com/repos/${REPO}/releases?per_page=10`, { headers });
    if (!res.ok) {
      console.warn(`[release] GitHub API answered ${res.status}; building without release data`);
      return null;
    }
    const list = (await res.json()) as GhRelease[];
    const rel = list.find((r) => !r.draft);
    if (!rel) return null;

    const assets: Record<Platform, Asset[]> = { windows: [], macos: [], linux: [] };
    let checksums: Asset | undefined;
    for (const a of rel.assets) {
      const asset = { name: a.name, url: a.browser_download_url, size: a.size };
      if (/sha256sums/i.test(a.name)) checksums = asset;
      const p = platformOf(a.name);
      if (p) assets[p].push(asset);
    }
    return {
      tag: rel.tag_name,
      name: rel.name || rel.tag_name,
      url: rel.html_url,
      publishedAt: rel.published_at,
      prerelease: rel.prerelease,
      assets,
      checksums,
    };
  } catch (err) {
    console.warn("[release] could not reach GitHub; building without release data", err);
    return null;
  }
}

export function getLatestRelease(): Promise<Release | null> {
  cached ??= load();
  return cached;
}

export function formatSize(bytes: number): string {
  return `${(bytes / 1024 / 1024).toFixed(0)} MB`;
}
