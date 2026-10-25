# mumcord-www

Website for [Mumcord](https://github.com/ToBee94/mumcord) — live at **https://mumcord.app**.

Static [Astro](https://astro.build) site, German (`/`) and English (`/en`). No cookies, no
tracking, no third-party requests: fonts are self-hosted, the latest release is read from the
GitHub API at build time.

## Develop

```bash
npm ci
npm run dev        # http://localhost:4321
npm run check      # type check
npm run build      # → dist/
```

Content lives in `src/i18n/de.ts` and `src/i18n/en.ts` (same shape, type-checked).
Screenshots come from the Mumcord repo (`docs/images/screenshots`) into `src/assets/shots`.
Legal pages: `src/pages/impressum.astro`, `src/pages/datenschutz.astro` and their `en/` twins.
The changelog (`/changelog`, `/en/changelog`) is written by hand in `src/lib/changelog.ts`; the
date and download link of each version come from the matching GitHub release once it is published.
The features page (`/funktionen`, `/en/features`) lives in `src/lib/features.ts`; each feature
names its screenshot in `src/assets/shots`, features without one show as text cards.
The server hosting guide (`/server`, `/en/server`) lives in `src/lib/server-guide.ts`; its
compose file pins the same `mumblevoip/mumble-server` version the Mumcord tests use.

To preview the download section and changelog with a release before one exists, point
`RELEASE_FIXTURE` at a JSON file shaped like the GitHub `/releases` API answer:

```bash
RELEASE_FIXTURE=./release.json npm run build
```

## Container

```bash
docker buildx build -t mumcord-www --load .
docker run --rm -p 8080:80 mumcord-www   # Caddy serves dist/ with clean URLs
```

## Deploy

1. GitHub Actions (`.github/workflows/image.yml`) builds `ghcr.io/tobee94/mumcord-www`
   for amd64 + arm64 on every push to `main`, nightly (fresh release data for the download
   links) and on demand. Tags: `latest` and `sha-<commit>`.
2. Deploying is manual: **Run pipeline** in GitLab `tvorwachs/mumcord-www-deploy`. It pulls
   the current image on the fuewa.systems server and recreates the container behind Traefik.

### After a Mumcord release

1. Publish the draft release on GitHub (see `RELEASING.md` in the Mumcord repo) and add the
   version to `src/lib/changelog.ts` if it is not there yet.
2. Start the **Image** workflow here by hand (Actions → Image → Run workflow), or wait for the
   nightly build. The download cards then link the new files.
3. **Run pipeline** in GitLab.

If the one-line inline script in `src/layouts/Base.astro` changes, update its hash in the
`Content-Security-Policy` in `Caddyfile`.

## License

MIT. Mumcord is compatible with Mumble but not affiliated with or endorsed by the Mumble project.
