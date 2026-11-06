# syntax=docker/dockerfile:1
# Mumcord crash report service (Hono + node:sqlite, TypeScript run directly by Node 24).
#
#   docker build -t mumcord-crashreports crashreports/
#   docker run -d --name crashreports -p 8787:8787 -v crashreports-data:/data \
#     -e RP_ID=crash.mumcord.app -e ORIGIN=https://crash.mumcord.app \
#     -e SETUP_TOKEN=$(openssl rand -hex 24) -e TRUST_PROXY=1 \
#     -e GITHUB_TOKEN=... -e ANTHROPIC_API_KEY=... \
#     mumcord-crashreports

FROM node:24-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY package.json package-lock.json ./
RUN npm ci --omit=dev --no-audit --no-fund && npm cache clean --force
COPY src ./src
COPY public ./public

RUN mkdir -p /data && chown node:node /data
VOLUME /data
ENV DATA_DIR=/data PORT=8787 \
    RP_ID=crash.mumcord.app ORIGIN=https://crash.mumcord.app
USER node
EXPOSE 8787
HEALTHCHECK --interval=30s --timeout=3s CMD wget -qO- http://127.0.0.1:8787/healthz || exit 1
CMD ["node", "--disable-warning=ExperimentalWarning", "src/server.ts"]
