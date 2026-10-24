# syntax=docker/dockerfile:1
# Mumcord website: Astro build → static files served by Caddy.
#
#   docker buildx build -t mumcord-www .
#   docker run --rm -p 8080:80 mumcord-www
#
# The site is built once on the build machine's own platform; only the small Caddy
# stage is per-architecture, so multi-arch builds need no slow emulated npm/sharp.
#
# The build reads the latest Mumcord release from the GitHub API. Unauthenticated
# calls are rate-limited; a token can be passed as a BuildKit secret:
#   docker buildx build --secret id=github_token,env=GITHUB_TOKEN .

FROM --platform=$BUILDPLATFORM node:24-bookworm-slim AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund
COPY . .
ARG SITE_URL=https://mumcord.app
RUN --mount=type=secret,id=github_token \
    SITE_URL="$SITE_URL" GITHUB_TOKEN="$(cat /run/secrets/github_token 2>/dev/null || true)" npm run build

FROM caddy:2-alpine
COPY Caddyfile /etc/caddy/Caddyfile
COPY --from=build /app/dist /srv
EXPOSE 80
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s CMD wget -qO- http://localhost/ >/dev/null || exit 1
