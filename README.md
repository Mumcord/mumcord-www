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

If the one-line inline script in `src/layouts/Base.astro` changes, update its hash in the
`Content-Security-Policy` in `Caddyfile`.

## License

MIT. Mumcord is compatible with Mumble but not affiliated with or endorsed by the Mumble project.
