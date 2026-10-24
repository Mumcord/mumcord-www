# Mumcord website: Astro build → static files served by Caddy.
#
#   docker build -t mumcord-www .
#   docker run --rm -p 8080:80 mumcord-www
#
# The build reads the latest Mumcord release from the GitHub API. Unauthenticated
# calls are rate-limited; a read-only token avoids that:
#   docker build --build-arg GITHUB_TOKEN=... .
# The token only exists in the build stage, never in the final image.

FROM node:24-bookworm-slim AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund
COPY . .
ARG SITE_URL=https://mumcord.app
ARG GITHUB_TOKEN=""
RUN SITE_URL="$SITE_URL" GITHUB_TOKEN="$GITHUB_TOKEN" npm run build

FROM caddy:2-alpine
COPY Caddyfile /etc/caddy/Caddyfile
COPY --from=build /app/dist /srv
EXPOSE 80
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s CMD wget -qO- http://localhost/ >/dev/null || exit 1
