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
The games page (`/spiele`, `/en/games`) lives in `src/lib/games.ts`: the overlay table per
platform, the games where the in-game overlay stays off (from the app's
`crates/engine/src/ingame_overlay/blocklist.json`) and the official Mumble game plugins
(Mumble's `plugins/CMakeLists.txt` at the server version the guide pins, retracted plugins left out).
The detailed roadmap (`/roadmap`, `/en/roadmap`) lives in `src/lib/roadmap.ts`; the short version on the
home page is in the i18n dicts. Keep both in line with the Mumcord spec and the wiki's Roadmap page.
The site speaks the 24 official EU languages (`src/i18n/langs.ts`). German and English are written
in the files above. The other 22 live in `src/i18n/locales/<code>.json` and serve under `/<code>/…`
through `src/pages/[lang]/`. Those files hold only words; screenshots, versions, statuses, links and
code come from English (merged by id in each `src/lib/*.ts`), and anything a translation lacks falls
back to English. Legal pages stay German and English only. When English text changes, update the
JSON files too, or the old translation keeps showing for that string.
The server hosting guide (`/server`, `/en/server`) lives in `src/lib/server-guide.ts`; its
compose file pins the same `mumblevoip/mumble-server` version the Mumcord tests use.

The next feature release is prepared ahead of time and switches over by itself once its GitHub
release is published: the changelog entry and the features marked `since` that version say "new in"
instead of "coming in", features with `until` that version disappear, the roadmap epic with that
`version` counts as done, the home spotlight label changes, and the games page shows each overlay
row's `next` state (rows with `goneInNext` go away, `NEXT_VERSION` in `src/lib/games.ts`).

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
