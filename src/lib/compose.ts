// Builds the docker-compose.yml, .env and setup commands for a Mumble server, for the server guide
// (with its defaults) and for the configurator on the same page (in the browser, from the form).
// Pure functions only: this file is bundled into the page's script, so it must not import Astro code.
// Images and example configs follow mumbot's examples/peer-with-relay and examples/webhook-with-server.

export type CommentLang = "de" | "en";

export const IMAGE = "mumblevoip/mumble-server:v1.5.735";
export const MUMPEER_IMAGE = "ghcr.io/mumcord/mumpeer:0.1.0";
export const MUMBOT_IMAGE = "ghcr.io/mumcord/mumbot:0.1.0";
const EXAMPLES = "https://raw.githubusercontent.com/Mumcord/mumbot/main/examples";

export interface ServerOptions {
  name: string;
  welcome: string;
  users: number;
  /** A server password, so only people who know it get in. */
  password: boolean;
  /** Images in chat up to 1 MB instead of 128 KB. */
  bigImages: boolean;
  /** Messages up to 10000 characters instead of 5000. */
  longText: boolean;
  /** mumpeer relay plus `mumbot peer` for Mumcord's direct connections. */
  relay: boolean;
  /** Mumbot's webhook bot: alerts and CI messages into a channel. */
  webhook: boolean;
  /** Hidden plugin-data packets per person and second (`pluginmessagelimit`, server default 4). */
  pluginLimit: number;
  /** How many of them may come at once (`pluginmessageburst`, server default 15). */
  pluginBurst: number;
}

/** The Mumble server's own defaults; only other values go into the file. */
export const PLUGIN_DEFAULTS = { limit: 4, burst: 15 };

export interface Secrets {
  superuser: string;
  server: string;
  peer: string;
}

const COMMENTS = {
  de: {
    head: "Mumble-Server für Mumcord und jeden anderen Mumble-Client",
    image: "feste Version; zum Aktualisieren hier erhöhen",
    tcp: "Verbindung und Chat",
    udp: "Sprache",
    data: "Kanäle, Registrierungen und Zertifikat",
    secrets: "Passwörter kommen aus der Datei .env daneben, nie direkt hier rein.",
    missing: "SUPERUSER_PASSWORD fehlt in .env",
    password: "leer = jeder mit der Adresse darf rein",
    nameNote: "Name des obersten Kanals",
    welcomeNote: "steht in Mumcord oben im Chat",
    users: "höchstens so viele gleichzeitig",
    images: "Bilder im Chat bis 1 MB (Standard: 128 KB)",
    text: "längere Nachrichten (Standard: 5000 Zeichen)",
    pluginLimit: "versteckte Pakete (Plugin-Daten) pro Person und Sekunde (Standard: 4)",
    pluginBurst: "so viele davon kurz hintereinander (Standard: 15)",
    relay: "Relay für Mumcords direkte Verbindungen (QUIC und TLS auf 443)",
    peer: "kündigt das Relay an und vergibt Tokens; teilt sich das Netz mit dem Relay",
    peerMissing: "PEER_API_SECRET fehlt in .env",
    webhook: "Webhook-Bot: schreibt Meldungen von außen in einen Kanal",
    webhookPort: "nur von diesem Rechner aus erreichbar",
    env: "Bleibt auf dem Server. Nie in Git, Chats oder Screenshots teilen.",
    envSuper: "hier-das-zufallspasswort-einfuegen",
    envServer: "hier-das-server-passwort-einfuegen",
    envPeer: "hier-ein-langes-zufallsgeheimnis-einfuegen",
    put: "docker-compose.yml und .env aus 2. und 3. hier ablegen",
  },
  en: {
    head: "Mumble server for Mumcord and any other Mumble client",
    image: "pinned version; raise it here to update",
    tcp: "connection and chat",
    udp: "voice",
    data: "channels, registrations and certificate",
    secrets: "Passwords come from the .env file next to this one, never straight in here.",
    missing: "SUPERUSER_PASSWORD is missing in .env",
    password: "empty = anyone with the address can join",
    nameNote: "name of the top channel",
    welcomeNote: "pinned at the top of the chat in Mumcord",
    users: "at most this many at once",
    images: "images in chat up to 1 MB (default: 128 KB)",
    text: "longer messages (default: 5000 characters)",
    pluginLimit: "hidden packets (plugin data) per person and second (default: 4)",
    pluginBurst: "this many of them in a quick burst (default: 15)",
    relay: "relay for Mumcord's direct connections (QUIC and TLS on 443)",
    peer: "announces the relay and hands out tokens; shares the relay's network",
    peerMissing: "PEER_API_SECRET is missing in .env",
    webhook: "webhook bot: posts messages from outside into a channel",
    webhookPort: "reachable from this machine only",
    env: "Stays on the server. Never share it in Git, chats or screenshots.",
    envSuper: "paste-the-random-password-here",
    envServer: "paste-the-server-password-here",
    envPeer: "paste-a-long-random-secret-here",
    put: "put docker-compose.yml and .env from 2. and 3. in here",
  },
} as const;

export const DEFAULTS: Record<CommentLang, ServerOptions> = {
  de: { name: "Unser Server", welcome: "Willkommen! Sag Hallo im Chat.", users: 50, password: false, bigImages: true, longText: true, relay: false, webhook: false, pluginLimit: 4, pluginBurst: 15 },
  en: { name: "Our Server", welcome: "Welcome! Say hi in the chat.", users: 50, password: false, bigImages: true, longText: true, relay: false, webhook: false, pluginLimit: 4, pluginBurst: 15 },
};

// A double-quoted YAML string; "$" is doubled so Compose doesn't read it as a variable.
const yaml = (s: string) => JSON.stringify(s).replaceAll("$", "$$$$");

export function buildCompose(lang: CommentLang, o: ServerOptions): string {
  const c = COMMENTS[lang];
  const users = Math.max(1, Math.min(10000, Math.round(o.users) || 50));
  const out = [
    `# ${c.head}`,
    "name: mumble",
    "",
    "services:",
    "  mumble-server:",
    `    image: ${IMAGE}   # ${c.image}`,
    "    restart: unless-stopped",
    "    ports:",
    `      - "64738:64738/tcp"   # ${c.tcp}`,
    `      - "64738:64738/udp"   # ${c.udp}`,
    "    volumes:",
    `      - data:/data          # ${c.data}`,
    "    environment:",
    `      # ${c.secrets}`,
    `      MUMBLE_SUPERUSER_PASSWORD: \${SUPERUSER_PASSWORD:?${c.missing}}`,
    `      MUMBLE_CONFIG_SERVER_PASSWORD: \${SERVER_PASSWORD:-}   # ${c.password}`,
    `      MUMBLE_CONFIG_REGISTER_NAME: ${yaml(o.name)}   # ${c.nameNote}`,
    `      MUMBLE_CONFIG_WELCOME_TEXT: ${yaml(o.welcome)}   # ${c.welcomeNote}`,
    `      MUMBLE_CONFIG_USERS: "${users}"   # ${c.users}`,
  ];
  if (o.bigImages) out.push(`      MUMBLE_CONFIG_IMAGE_MESSAGE_LENGTH: "1048576"   # ${c.images}`);
  if (o.longText) out.push(`      MUMBLE_CONFIG_TEXT_MESSAGE_LENGTH: "10000"   # ${c.text}`);
  const limit = Math.max(1, Math.min(1000, Math.round(o.pluginLimit) || PLUGIN_DEFAULTS.limit));
  const burst = Math.max(1, Math.min(1000, Math.round(o.pluginBurst) || PLUGIN_DEFAULTS.burst));
  if (limit !== PLUGIN_DEFAULTS.limit) out.push(`      MUMBLE_CONFIG_PLUGIN_MESSAGE_LIMIT: "${limit}"   # ${c.pluginLimit}`);
  if (burst !== PLUGIN_DEFAULTS.burst) out.push(`      MUMBLE_CONFIG_PLUGIN_MESSAGE_BURST: "${burst}"   # ${c.pluginBurst}`);
  const volumes = ["data"];
  if (o.relay) {
    out.push(
      "",
      `  # ${c.relay}`,
      "  mumpeer:",
      `    image: ${MUMPEER_IMAGE}`,
      "    restart: unless-stopped",
      "    environment:",
      `      MUMPEER_API_SECRET: \${PEER_API_SECRET:?${c.peerMissing}}`,
      '    ports: ["443:443/udp", "443:443/tcp"]',
      "    volumes:",
      "      - ./mumpeer.toml:/config/mumpeer.toml:ro",
      "      - mumpeer-data:/var/lib/mumpeer",
      "",
      `  # ${c.peer}`,
      "  mumbot-peer:",
      `    image: ${MUMBOT_IMAGE}`,
      '    command: ["peer"]',
      "    restart: unless-stopped",
      "    depends_on: [mumble-server, mumpeer]",
      '    network_mode: "service:mumpeer"',
      "    environment:",
      "      MUMBOT_CONFIG: /config/bot.toml",
      `      MUMBOT_PEER_API_SECRET: \${PEER_API_SECRET:?${c.peerMissing}}`,
      "      SERVER_PASSWORD: ${SERVER_PASSWORD:-}",
      "    volumes:",
      "      - ./bot-peer.toml:/config/bot.toml:ro",
      "      - mumbot-peer-data:/data",
      "    healthcheck:",
      "      disable: true",
    );
    volumes.push("mumpeer-data", "mumbot-peer-data");
  }
  if (o.webhook) {
    out.push(
      "",
      `  # ${c.webhook}`,
      "  mumbot-webhook:",
      `    image: ${MUMBOT_IMAGE}`,
      '    command: ["webhook"]',
      "    restart: unless-stopped",
      "    depends_on: [mumble-server]",
      "    environment:",
      "      MUMBOT_CONFIG: /config/bot.toml",
      "      SERVER_PASSWORD: ${SERVER_PASSWORD:-}",
      "    ports:",
      `      - "127.0.0.1:8080:8080"   # ${c.webhookPort}`,
      "    volumes:",
      "      - ./bot-webhook.toml:/config/bot.toml:ro",
      "      - mumbot-webhook-data:/data",
    );
    volumes.push("mumbot-webhook-data");
  }
  out.push("", "volumes:", ...volumes.map((v) => `  ${v}:`), "");
  return out.join("\n");
}

export function buildEnv(lang: CommentLang, o: ServerOptions, s?: Secrets): string {
  const c = COMMENTS[lang];
  const out = [`# ${c.env}`, `SUPERUSER_PASSWORD=${s?.superuser ?? c.envSuper}`, `SERVER_PASSWORD=${o.password ? (s?.server ?? c.envServer) : ""}`];
  if (o.relay) out.push(`PEER_API_SECRET=${s?.peer ?? c.envPeer}`);
  return out.join("\n") + "\n";
}

/** Commands for the server's folder: the bot and relay configs, then the start. */
export function buildSetup(lang: CommentLang, o: ServerOptions): string {
  const out = ["mkdir -p mumble && cd mumble", `# ${COMMENTS[lang].put}`];
  if (o.relay)
    out.push(
      `curl -fsSL -o mumpeer.toml ${EXAMPLES}/peer-with-relay/mumpeer.example.toml`,
      `curl -fsSL -o bot-peer.toml ${EXAMPLES}/peer-with-relay/bot.example.toml`,
    );
  if (o.webhook) out.push(`curl -fsSL -o bot-webhook.toml ${EXAMPLES}/webhook-with-server/bot.example.toml`);
  out.push("docker compose up -d", "docker compose logs -f");
  return out.join("\n");
}

/** A random password from the browser's crypto; 64 shell-safe characters, so every byte maps evenly. */
export function randomSecret(length = 32): string {
  const abc = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_";
  const bytes = crypto.getRandomValues(new Uint8Array(length));
  return Array.from(bytes, (b) => abc[b % abc.length]).join("");
}
