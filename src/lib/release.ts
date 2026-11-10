// Latest Mumcord release, read from the GitHub API at build time. Visitors never
// talk to GitHub until they click a download, so the page itself stays
// request-free. A scheduled pipeline rebuilds the site to pick up new releases.

import { readFile } from "node:fs/promises";

export const REPO = "Mumcord/mumcord";
export const REPO_URL = `https://github.com/${REPO}`;
export const RELEASES_URL = `${REPO_URL}/releases`;
export const LATEST_URL = `${REPO_URL}/releases/latest`;
export const WIKI_URL = `${REPO_URL}/wiki`;
export const ISSUES_URL = `${REPO_URL}/issues`;
/** The Linux installer as users type it; always the latest release's copy. */
export const INSTALL_COMMAND = `curl -fsSL ${REPO_URL}/releases/latest/download/install.sh | sh`;
export const UNINSTALL_COMMAND = `${INSTALL_COMMAND} -s -- --uninstall`;
/** Homebrew: a cask on macOS, a formula (the AppImage) on Linux, both from Mumcord/homebrew-tap. */
export const BREW_TAP_URL = "https://github.com/Mumcord/homebrew-tap";
export const BREW_CASK = "brew install --cask mumcord/tap/mumcord";
export const BREW_FORMULA = "brew install mumcord/tap/mumcord";

export type Platform = "windows" | "macos" | "linux";

export type Arch = "x86_64" | "arm64" | "universal";
export type Kind = "setup" | "portable" | "dmg" | "appimage" | "deb" | "rpm" | "other";

export interface Asset {
  name: string;
  url: string;
  size: number;
}

/** A platform download with what it is: processor and package type. */
export interface PlatformAsset extends Asset {
  arch: Arch;
  kind: Kind;
}

export interface Release {
  tag: string;
  version: string;
  name: string;
  url: string;
  publishedAt: string;
  prerelease: boolean;
  assets: Record<Platform, PlatformAsset[]>;
  checksums?: Asset;
  /** CycloneDX software bills of materials, one per build. */
  sboms: Asset[];
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
  if (n.endsWith(".exe") || n.endsWith(".msi") || (n.endsWith(".zip") && n.includes("portable"))) return "windows";
  if (n.endsWith(".dmg")) return "macos";
  if (n.endsWith(".appimage") || n.endsWith(".deb") || n.endsWith(".rpm")) return "linux";
  return null;
}

function kindOf(name: string): Kind {
  const n = name.toLowerCase();
  if (n.endsWith(".exe") || n.endsWith(".msi")) return "setup";
  if (n.endsWith(".zip")) return "portable";
  if (n.endsWith(".dmg")) return "dmg";
  if (n.endsWith(".appimage")) return "appimage";
  if (n.endsWith(".deb")) return "deb";
  if (n.endsWith(".rpm")) return "rpm";
  return "other";
}

function archOf(name: string): Arch {
  const n = name.toLowerCase();
  if (/aarch64|arm64/.test(n)) return "arm64";
  if (/universal/.test(n)) return "universal";
  return "x86_64";
}

const KIND_ORDER: Kind[] = ["setup", "dmg", "appimage", "deb", "rpm", "portable", "other"];

// The first asset is the platform's main download: the installer on Windows, the x86_64 AppImage
// on Linux (it runs on any distro), then the native packages, x86_64 before ARM.
function rank(a: PlatformAsset): number {
  return (a.arch === "arm64" ? 10 : 0) + KIND_ORDER.indexOf(a.kind);
}

/** The asset of a kind and processor, if the release ships it. */
export function findAsset(r: Release, p: Platform, kind: Kind, arch?: Arch): PlatformAsset | undefined {
  return r.assets[p].find((a) => a.kind === kind && (!arch || a.arch === arch));
}

/** A tag with a pre-release suffix such as v0.8.0-rc.3. */
export const isCandidate = (tag: string) => /^v?\d+\.\d+\.\d+-/.test(tag);

let cached: Promise<Release[]> | undefined;

function toRelease(rel: GhRelease): Release {
  const assets: Record<Platform, PlatformAsset[]> = { windows: [], macos: [], linux: [] };
  const sboms: Asset[] = [];
  let checksums: Asset | undefined;
  let installer: Asset | undefined;
  for (const a of rel.assets) {
    const asset = { name: a.name, url: a.browser_download_url, size: a.size };
    if (/sha256sums/i.test(a.name)) checksums = asset;
    if (a.name === "install.sh") installer = asset;
    if (a.name.endsWith(".cdx.json")) sboms.push(asset);
    const p = platformOf(a.name);
    if (p) assets[p].push({ ...asset, arch: archOf(a.name), kind: kindOf(a.name) });
  }
  for (const p of Object.keys(assets) as Platform[]) assets[p].sort((x, y) => rank(x) - rank(y));
  return {
    tag: rel.tag_name,
    version: rel.tag_name.replace(/^v/, ""),
    name: rel.name || rel.tag_name,
    url: rel.html_url,
    publishedAt: rel.published_at,
    prerelease: rel.prerelease,
    assets,
    checksums,
    sboms,
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
    // Release candidates (v0.8.0-rc.3) are for testers on GitHub only; the site shows final versions.
    return list.filter((r) => !r.draft && !isCandidate(r.tag_name)).map(toRelease);
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

let tap: Promise<boolean> | undefined;

/** Whether the Homebrew tap exists yet; until then the brew commands show as coming soon. */
export function hasHomebrewTap(): Promise<boolean> {
  tap ??= (async () => {
    if (process.env.HOMEBREW_TAP) return process.env.HOMEBREW_TAP === "1";
    const headers: Record<string, string> = { Accept: "application/vnd.github+json", "User-Agent": "mumcord-www-build" };
    if (process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
    try {
      const res = await fetch("https://api.github.com/repos/Mumcord/homebrew-tap/contents/Casks/mumcord.rb", { headers });
      return res.ok;
    } catch {
      return false;
    }
  })();
  return tap;
}

export function formatSize(bytes: number): string {
  return `${(bytes / 1024 / 1024).toFixed(0)} MB`;
}
