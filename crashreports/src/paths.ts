const SOURCE_EXT = /\.(rs|ts|tsx|js|mjs|svelte|vue|toml|c|cpp|h)$/;

/**
 * Reduce an absolute build path to a path relative to the repo root, or null when it points
 * outside the repo (toolchain, cargo registry, unknown absolute paths).
 */
export function toRepoPath(raw: string, repoName: string): string | null {
  let p = raw.trim().replace(/\\/g, '/').replace(/^\.\//, '');
  if (/\/(\.cargo|\.rustup)\/|^\/rustc\/|\/rustc\/[0-9a-f]+\/|\/library\/(std|core|alloc)\//.test(p)) return null;
  const isAbsolute = p.startsWith('/') || /^[a-z]:\//i.test(p);
  if (isAbsolute) {
    // GitHub Actions: /home/runner/work/<repo>/<repo>/... and D:\a\<repo>\<repo>\...
    const ci = p.match(/^(?:.*\/work|[a-z]:\/a)\/[^/]+\/[^/]+\/(.+)$/i);
    if (ci) p = ci[1];
    else {
      const marker = `/${repoName.toLowerCase()}/`;
      const i = p.toLowerCase().lastIndexOf(marker);
      if (i < 0) return null;
      p = p.slice(i + marker.length);
    }
  }
  if (p.length > 200 || !/^[\w.@+-]+(\/[\w.@+-]+)*$/.test(p)) return null;
  if (p.split('/').some((s) => s === '..' || s === '.')) return null;
  if (!SOURCE_EXT.test(p)) return null;
  return p;
}

