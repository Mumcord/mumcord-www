// The Docker image tags in the site's examples follow the newest published GitHub release of each
// tool at build time, like Mumcord's own downloads; the nightly rebuild picks up new releases.
// The tags written in the code are only the fallback when GitHub can't be reached.
import { getMumbotRelease } from "./mumbot";
import { getToolRelease } from "./tools";

export type ImageName = "mumbot" | "mumpeer";
export type ImageVersions = Record<ImageName, string>;

/** Last known releases, used only when the GitHub API doesn't answer during the build. */
export const IMAGE_FALLBACK: ImageVersions = { mumbot: "0.5.4", mumpeer: "0.2.0" };

let cached: Promise<ImageVersions> | undefined;
export function getImageVersions(): Promise<ImageVersions> {
  cached ??= Promise.all([getMumbotRelease(), getToolRelease("mumpeer")]).then(([bot, peer]) => ({
    mumbot: bot?.version ?? IMAGE_FALLBACK.mumbot,
    mumpeer: peer?.version ?? IMAGE_FALLBACK.mumpeer,
  }));
  return cached;
}

/** Puts the current tags into every `ghcr.io/mumcord/mumbot:…` and `ghcr.io/mumcord/mumpeer:…` in a code block. */
export const withImageVersions = (code: string, v: ImageVersions) =>
  code.replace(/ghcr\.io\/mumcord\/(mumbot|mumpeer):[\w.-]+/g, (_, name: ImageName) => `ghcr.io/mumcord/${name}:${v[name]}`);
