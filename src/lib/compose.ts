// Builds the docker-compose.yml, .env and setup commands for a Mumble server, for the server guide
// (with its defaults) and for the configurator on the same page (in the browser, from the form).
// Pure functions only: this file is bundled into the page's script, so it must not import Astro code.
// Images and example configs follow mumbot's examples/peer-with-relay and examples/webhook-with-server.

export type CommentLang = "de" | "en";

export const IMAGE = "mumblevoip/mumble-server:v1.5.735";
export const MUMPEER_IMAGE = "ghcr.io/mumcord/mumpeer:0.1.0";
export const MUMBOT_IMAGE = "ghcr.io/mumcord/mumbot";
/** The Mumbot release that brings the music and history bots. */
export const MUMBOT_MODULES_FROM = "0.2.0";

/** Most a person may send, in bit/s: Mumble's own default, room for music, and the hi-fi value of Mumble's sample config. */
export const BANDWIDTH = { standard: 72000, good: 192000, best: 558000 } as const;
export type Quality = keyof typeof BANDWIDTH;
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
  /** The most a person may send (`bandwidth`). */
  quality: Quality;
  /** Mumbot's music bot: plays MP3s into a voice channel over HTTP (from 0.2.0). */
  music: boolean;
  /** Mumbot's history bot: keeps channel chat for Mumcord users who were away (from 0.2.0). */
  history: boolean;
  /** The Mumbot image tag every bot service uses. */
  mumbotVersion: string;
}

/** The Mumble server's own defaults; only other values go into the file. */
export const PLUGIN_DEFAULTS = { limit: 4, burst: 15 };

export interface Secrets {
  superuser: string;
  server: string;
  peer: string;
  webhookKey: string;
  musicKey: string;
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
    bandwidth: "höchste Bitrate pro Person in bit/s (72000 Sprache, 192000 Musik, 558000 Hi-Fi)",
    music: "Musik-Bot: spielt MP3s aus ./media über HTTP im Sprachkanal",
    history: "Verlaufs-Bot: hebt Kanal-Chat für Mumcord-Nutzer auf, die weg waren",
    relay: "Relay für Mumcords direkte Verbindungen (QUIC und TLS auf 443)",
    peer: "kündigt das Relay an und vergibt Tokens; teilt sich das Netz mit dem Relay",
    peerMissing: "PEER_API_SECRET fehlt in .env",
    webhook: "Webhook-Bot: schreibt Meldungen von außen in einen Kanal",
    bot: "Mumbot, ein Bot mit diesen Modulen",
    botToml: "Mumbot: ein Bot, Module:",
    botPin: "SHA-256 des Server-Zertifikats; ohne startet das Peer-Modul nicht",
    webhookPort: "nur von diesem Rechner aus erreichbar",
    env: "Bleibt auf dem Server. Nie in Git, Chats oder Screenshots teilen.",
    envSuper: "hier-das-zufallspasswort-einfuegen",
    envServer: "hier-das-server-passwort-einfuegen",
    envPeer: "hier-ein-langes-zufallsgeheimnis-einfuegen",
    put: "docker-compose.yml, .env und bot.toml von unten hier ablegen",
    showEnv: "die Passwörter: einmal notieren",
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
    bandwidth: "most bit/s a person may send (72000 speech, 192000 music, 558000 hi-fi)",
    music: "music bot: plays MP3s from ./media into a voice channel over HTTP",
    history: "history bot: keeps channel chat for Mumcord users who were away",
    relay: "relay for Mumcord's direct connections (QUIC and TLS on 443)",
    peer: "announces the relay and hands out tokens; shares the relay's network",
    peerMissing: "PEER_API_SECRET is missing in .env",
    webhook: "webhook bot: posts messages from outside into a channel",
    bot: "Mumbot, one bot with these modules",
    botToml: "Mumbot: one bot, modules:",
    botPin: "SHA-256 of the server certificate; the peer module won't start without it",
    webhookPort: "reachable from this machine only",
    env: "Stays on the server. Never share it in Git, chats or screenshots.",
    envSuper: "paste-the-random-password-here",
    envServer: "paste-the-server-password-here",
    envPeer: "paste-a-long-random-secret-here",
    put: "put docker-compose.yml, .env and bot.toml from below in here",
    showEnv: "your passwords: note them once",
  },
} as const;

export const DEFAULTS: Record<CommentLang, ServerOptions> = {
  de: { name: "Unser Server", welcome: "Willkommen! Sag Hallo im Chat.", users: 50, password: false, bigImages: true, longText: true, relay: false, webhook: false, pluginLimit: 4, pluginBurst: 15, quality: "standard", music: false, history: false, mumbotVersion: "0.1.0" },
  en: { name: "Our Server", welcome: "Welcome! Say hi in the chat.", users: 50, password: false, bigImages: true, longText: true, relay: false, webhook: false, pluginLimit: 4, pluginBurst: 15, quality: "standard", music: false, history: false, mumbotVersion: "0.1.0" },
};

/** Whether version a is at least b (plain x.y.z). */
export const atLeast = (a: string, b: string) => {
  const [x, y] = [a, b].map((v) => v.split(".").map(Number));
  for (let i = 0; i < 3; i++) if ((x[i] ?? 0) !== (y[i] ?? 0)) return (x[i] ?? 0) > (y[i] ?? 0);
  return true;
};

// A double-quoted YAML string; "$" is doubled so Compose doesn't read it as a variable.
const yaml = (s: string) => JSON.stringify(s).replaceAll("$", "$$$$");

/**
 * The compose file. With `template`, name, welcome text, user limit and the hidden-packet limits are
 * Caddy template actions that read the query string, so one static file per feature mix serves
 * every `curl` from the configurator (see `src/pages/server/compose/[variant].ts` and the Caddyfile).
 */
export function buildCompose(lang: CommentLang, o: ServerOptions, template = false): string {
  const c = COMMENTS[lang];
  const users = Math.max(1, Math.min(10000, Math.round(o.users) || 50));
  // Query values: JSON-quoted (a valid double-quoted YAML string), "$" doubled for Compose; numbers through atoi and clamped.
  const q = (key: string, fallback: string) => `{{ $.Req.URL.Query.Get "${key}" | default ${JSON.stringify(fallback)} | toJson | replace "$" "$$" }}`;
  const n = (key: string, fallback: number, max: number) => `"{{ $.Req.URL.Query.Get "${key}" | default "${fallback}" | atoi | max 1 | min ${max} }}"`;
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
    `      MUMBLE_CONFIG_REGISTER_NAME: ${template ? q("name", o.name) : yaml(o.name)}   # ${c.nameNote}`,
    `      MUMBLE_CONFIG_WELCOME_TEXT: ${template ? q("welcome", o.welcome) : yaml(o.welcome)}   # ${c.welcomeNote}`,
    `      MUMBLE_CONFIG_USERS: ${template ? n("users", 50, 10000) : `"${users}"`}   # ${c.users}`,
    `      MUMBLE_CONFIG_BANDWIDTH: "${BANDWIDTH[o.quality] ?? BANDWIDTH.standard}"   # ${c.bandwidth}`,
  ];
  if (o.bigImages) out.push(`      MUMBLE_CONFIG_IMAGE_MESSAGE_LENGTH: "1048576"   # ${c.images}`);
  if (o.longText) out.push(`      MUMBLE_CONFIG_TEXT_MESSAGE_LENGTH: "10000"   # ${c.text}`);
  const limit = Math.max(1, Math.min(1000, Math.round(o.pluginLimit) || PLUGIN_DEFAULTS.limit));
  const burst = Math.max(1, Math.min(1000, Math.round(o.pluginBurst) || PLUGIN_DEFAULTS.burst));
  if (template) {
    // Only written when the URL carries them; "{{-" eats the line break before, so nothing is left otherwise.
    out[out.length - 1] += `{{- with .Req.URL.Query.Get "pl" }}\n      MUMBLE_CONFIG_PLUGIN_MESSAGE_LIMIT: ${n("pl", PLUGIN_DEFAULTS.limit, 1000)}   # ${c.pluginLimit}{{ end }}`;
    out[out.length - 1] += `{{- with .Req.URL.Query.Get "pb" }}\n      MUMBLE_CONFIG_PLUGIN_MESSAGE_BURST: ${n("pb", PLUGIN_DEFAULTS.burst, 1000)}   # ${c.pluginBurst}{{ end }}`;
  } else {
    if (limit !== PLUGIN_DEFAULTS.limit) out.push(`      MUMBLE_CONFIG_PLUGIN_MESSAGE_LIMIT: "${limit}"   # ${c.pluginLimit}`);
    if (burst !== PLUGIN_DEFAULTS.burst) out.push(`      MUMBLE_CONFIG_PLUGIN_MESSAGE_BURST: "${burst}"   # ${c.pluginBurst}`);
  }
  const volumes = ["data"];
  const modules = botModules(o);
  // HTTP ports of the bot; with the relay the bot lives in mumpeer's network, so mumpeer publishes them.
  const httpPorts = [...(o.webhook ? ["8080"] : []), ...(o.music ? ["8081"] : [])].map((p) => `      - "127.0.0.1:${p}:${p}"   # ${c.webhookPort}`);
  if (o.relay) {
    out.push(
      "",
      `  # ${c.relay}`,
      "  mumpeer:",
      `    image: ${MUMPEER_IMAGE}`,
      "    restart: unless-stopped",
      "    environment:",
      `      MUMPEER_API_SECRET: \${PEER_API_SECRET:?${c.peerMissing}}`,
      "    ports:",
      '      - "443:443/udp"',
      '      - "443:443/tcp"',
      ...httpPorts,
      "    volumes:",
      "      - ./mumpeer.toml:/config/mumpeer.toml:ro",
      "      - mumpeer-data:/var/lib/mumpeer",
    );
    volumes.push("mumpeer-data");
  }
  if (modules.length) {
    out.push(
      "",
      `  # ${c.bot}: ${modules.join(", ")}`,
      "  mumbot:",
      `    image: ${MUMBOT_IMAGE}:${o.mumbotVersion}`,
      '    command: ["run"]',
      "    restart: unless-stopped",
      `    depends_on: [mumble-server${o.relay ? ", mumpeer" : ""}]`,
      ...(o.relay ? ['    network_mode: "service:mumpeer"'] : []),
      "    environment:",
      "      MUMBOT_CONFIG: /config/bot.toml",
      `      MUMBOT_MODULES: ${modules.join(",")}`,
      "      SERVER_PASSWORD: ${SERVER_PASSWORD:-}",
      ...(o.relay ? [`      MUMBOT_PEER_API_SECRET: \${PEER_API_SECRET:?${c.peerMissing}}`] : []),
      ...(!o.relay && httpPorts.length ? ["    ports:", ...httpPorts] : []),
      "    volumes:",
      "      - ./bot.toml:/config/bot.toml:ro",
      ...(o.music ? ["      - ./media:/media:ro"] : []),
      "      - mumbot-data:/data",
      // The image checks the webhook module's /health; the music module answers on its own port.
      ...(o.webhook
        ? []
        : o.music
          ? ["    healthcheck:", `      test: ["CMD-SHELL", "wget -q -O - http://127.0.0.1:8081/health | grep -q '\\"connected\\":true'"]`]
          : ["    healthcheck:", "      disable: true"]),
    );
    volumes.push("mumbot-data");
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

/** The Mumbot modules these options need, in Mumbot's own order. */
export const botModules = (o: ServerOptions) =>
  [o.webhook && "webhook", o.relay && "peer", o.history && "history", o.music && "music"].filter(Boolean) as string[];

/** Music below the server's limit: the Opus bitrate the music module sends per quality step. */
const MUSIC_BITRATE: Record<Quality, number> = { standard: 64000, good: 128000, best: 256000 };

/**
 * One bot.toml for every chosen module, after mumbot's examples (webhook-with-server, peer-with-relay,
 * music, history). Keys are filled in by the browser, or left as "$(openssl …)" for the shell.
 */
export function buildBotToml(lang: CommentLang, o: ServerOptions, keys?: { webhook: string; music: string }): string {
  const c = COMMENTS[lang];
  const key = (k?: string) => k ?? "$(openssl rand -hex 32)";
  const out = [
    `# ${c.botToml} ${botModules(o).join(", ")}`,
    "# https://github.com/Mumcord/mumbot/blob/main/docs/configuration.md",
    "[server]",
    'host = "mumble-server"',
    "port = 64738",
    'name = "Mumbot"',
    'channel = "Root"',
  ];
  if (o.relay) out.push(`# ${c.botPin}`, 'server_cert_sha256 = "REPLACE-WITH-THE-SERVER-CERTIFICATE-SHA256"');
  if (o.webhook)
    out.push("", "[http]", 'listen = "0.0.0.0:8080"', "rate_limit_per_minute = 20", "delivery_timeout_secs = 3", "", "[[keys]]", `key = "${key(keys?.webhook)}"`, 'label = "webhook"', 'channels = ["Root"]');
  if (o.relay) out.push("", "[peer]", 'api_url = "http://127.0.0.1:7480"');
  if (o.history)
    out.push("", "[history]", 'channels = ["*"]', "retention_days = 7", "max_messages_per_channel = 5000", 'database = "/data/history.sqlite3"');
  if (o.music)
    out.push(
      "",
      "[music]",
      'listen = "0.0.0.0:8081"',
      'channel = "Root"',
      'media_dir = "/media"',
      "volume = 60",
      `bitrate = ${MUSIC_BITRATE[o.quality] ?? MUSIC_BITRATE.standard}`,
      "",
      "[[music.keys]]",
      `key = "${key(keys?.music)}"`,
      'label = "jukebox"',
      'channels = ["Root"]',
    );
  return out.join("\n") + "\n";
}

/** The switches that pick one of the prebuilt compose files, in the order of the variant id. */
export const FLAGS = ["password", "bigImages", "longText", "relay", "webhook", "music", "history"] as const;
const QUALITIES = Object.keys(BANDWIDTH) as Quality[];

/** Id of the prebuilt file for these options, e.g. "en-0110100s": comment language, switches, quality. */
export const variantId = (lang: CommentLang, o: ServerOptions) => `${lang}-${FLAGS.map((f) => (o[f] ? 1 : 0)).join("")}${o.quality[0]}`;

/** Every variant, with its options; the free-text parts come from the URL. */
export function allVariants(mumbotVersion: string): { id: string; lang: CommentLang; options: ServerOptions }[] {
  const out = [];
  for (const lang of ["de", "en"] as const)
    for (let bits = 0; bits < 1 << FLAGS.length; bits++)
      for (const quality of QUALITIES) {
        const options = { ...DEFAULTS[lang], quality, mumbotVersion };
        FLAGS.forEach((f, i) => (options[f] = Boolean(bits & (1 << (FLAGS.length - 1 - i)))));
        out.push({ id: variantId(lang, options), lang, options });
      }
  return out;
}

/** The steps of the one-command setup, in order; `configs` is empty when no bot or relay needs one. */
export const STEP_IDS = ["folder", "compose", "env", "configs", "start", "show"] as const;
export type StepId = (typeof STEP_IDS)[number];

/**
 * The setup for the server, step by step: the compose file by curl (name and numbers in the URL), a
 * fresh .env made with openssl right there, the bot configs, the start. Passwords never travel through
 * a URL or a browser.
 */
export function buildCurlSteps(lang: CommentLang, o: ServerOptions, site: string): Record<StepId, string> {
  const c = COMMENTS[lang];
  const query = new URLSearchParams({ name: o.name, welcome: o.welcome, users: String(Math.round(o.users) || 50) });
  if (o.pluginLimit !== PLUGIN_DEFAULTS.limit) query.set("pl", String(Math.round(o.pluginLimit)));
  if (o.pluginBurst !== PLUGIN_DEFAULTS.burst) query.set("pb", String(Math.round(o.pluginBurst)));
  const url = `${site.replace(/\/$/, "")}/server/compose/${variantId(lang, o)}.yml?${query}`;
  const env = [`# ${c.env}`, "SUPERUSER_PASSWORD=$(openssl rand -hex 16)", `SERVER_PASSWORD=${o.password ? "$(openssl rand -hex 8)" : ""}`];
  if (o.relay) env.push("PEER_API_SECRET=$(openssl rand -hex 32)");
  return {
    folder: "mkdir -p mumble && cd mumble",
    compose: `curl -fsSL -o docker-compose.yml '${url.replaceAll("'", "%27")}'`,
    env: ["cat > .env <<EOF", ...env, "EOF", "chmod 600 .env"].join("\n"),
    configs: [
      ...configCommands(o),
      ...(o.music ? ["mkdir -p media"] : []),
      ...(botModules(o).length ? ["cat > bot.toml <<EOF", buildBotToml(lang, o).trimEnd(), "EOF"] : []),
    ].join("\n"),
    start: "docker compose up -d\ndocker compose logs -f",
    show: `cat .env   # ${c.showEnv}`,
  };
}

/** All steps as one script, for "copy everything". */
export const buildCurlSetup = (lang: CommentLang, o: ServerOptions, site: string) =>
  STEP_IDS.map((id) => buildCurlSteps(lang, o, site)[id])
    .filter(Boolean)
    .join("\n");

function configCommands(o: ServerOptions): string[] {
  return o.relay ? [`curl -fsSL -o mumpeer.toml ${EXAMPLES}/peer-with-relay/mumpeer.example.toml`] : [];
}

/** Commands for the server's folder: the bot and relay configs, then the start. */
export function buildSetup(lang: CommentLang, o: ServerOptions): string {
  return ["mkdir -p mumble && cd mumble", `# ${COMMENTS[lang].put}`, ...configCommands(o), ...(o.music ? ["mkdir -p media"] : []), "docker compose up -d", "docker compose logs -f"].join("\n");
}

/** A random password from the browser's crypto; 64 shell-safe characters, so every byte maps evenly. */
export function randomSecret(length = 32): string {
  const abc = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_";
  const bytes = crypto.getRandomValues(new Uint8Array(length));
  return Array.from(bytes, (b) => abc[b % abc.length]).join("");
}
