// Mumbot, the bots for Mumble servers in their own repo. Content of the Mumbot page, following
// the Mumbot README, its specs/roadmap.md and the open issues (Epic 2); the release comes from
// the GitHub API at build time like Mumcord's.
import { localized } from "../i18n";
import { bundles } from "../i18n/locales";
import type { Status } from "./roadmap";
import { atLeast, MUMBOT_MODULES_FROM } from "./compose";

export const MUMBOT_REPO = "Mumcord/mumbot";
export const MUMBOT_REPO_URL = `https://github.com/${MUMBOT_REPO}`;
export const MUMBOT_RELEASES_URL = `${MUMBOT_REPO_URL}/releases`;
export const MUMBOT_ISSUES_URL = `${MUMBOT_REPO_URL}/issues`;
export const MUMBOT_IDEA_URL = `${MUMBOT_ISSUES_URL}/new`;
export const MUMBOT_DOCS_URL = `${MUMBOT_REPO_URL}/blob/main/docs/README.md`;
export const MUMBOT_CLI_URL = `${MUMBOT_REPO_URL}/blob/main/docs/cli.md`;
export const mumbotDoc = (name: string) => `${MUMBOT_REPO_URL}/blob/main/docs/${name}.md`;
export const MUMBOT_EXAMPLES_URL = `${MUMBOT_REPO_URL}/tree/main/examples`;
export const MUMBOT_IMAGE = "ghcr.io/mumcord/mumbot";

export type BotPlatform = "linux" | "linuxArm" | "windows" | "macos";

export interface BotAsset {
  name: string;
  url: string;
  size: number;
}

export interface BotRelease {
  version: string;
  url: string;
  publishedAt: string;
  prerelease: boolean;
  assets: Partial<Record<BotPlatform, BotAsset>>;
  checksums?: BotAsset;
}

function platformOf(name: string): BotPlatform | null {
  const n = name.toLowerCase();
  if (n.includes("linux-x86_64")) return "linux";
  if (n.includes("linux-aarch64")) return "linuxArm";
  if (n.includes("windows")) return "windows";
  if (n.includes("macos")) return "macos";
  return null;
}

interface GhRelease {
  tag_name: string;
  html_url: string;
  published_at: string;
  prerelease: boolean;
  draft: boolean;
  assets: { name: string; browser_download_url: string; size: number }[];
}

let cached: Promise<BotRelease | null> | undefined;

async function load(): Promise<BotRelease | null> {
  const headers: Record<string, string> = { Accept: "application/vnd.github+json", "User-Agent": "mumcord-www-build" };
  if (process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  try {
    const res = await fetch(`https://api.github.com/repos/${MUMBOT_REPO}/releases?per_page=10`, { headers });
    if (!res.ok) {
      console.warn(`[mumbot] GitHub API answered ${res.status}; building without release data`);
      return null;
    }
    const rel = ((await res.json()) as GhRelease[]).find((r) => !r.draft);
    if (!rel) return null;
    const assets: BotRelease["assets"] = {};
    let checksums: BotAsset | undefined;
    for (const a of rel.assets) {
      const asset = { name: a.name, url: a.browser_download_url, size: a.size };
      if (/sha256sums/i.test(a.name)) checksums = asset;
      const p = platformOf(a.name);
      if (p) assets[p] = asset;
    }
    return {
      version: rel.tag_name.replace(/^v/, ""),
      url: rel.html_url,
      publishedAt: rel.published_at,
      prerelease: rel.prerelease,
      assets,
      checksums,
    };
  } catch (err) {
    console.warn("[mumbot] could not reach GitHub; building without release data", err);
    return null;
  }
}

/** The newest published Mumbot release, or null without one (or without network). */
export function getMumbotRelease(): Promise<BotRelease | null> {
  cached ??= load();
  return cached;
}

/** The image tag for the configurator's one bot with modules: the release, but at least 0.2.0 where modules arrive. */
export async function getBotImageVersion(): Promise<string> {
  const v = await getMumbotVersion();
  return atLeast(v, MUMBOT_MODULES_FROM) ? v : MUMBOT_MODULES_FROM;
}

/** The Mumbot image tag the configurator and server guide use: the newest release, 0.1.0 before any. */
export async function getMumbotVersion(): Promise<string> {
  return (await getMumbotRelease())?.version ?? "0.1.0";
}

export interface BotEpic {
  id: string;
  tag: string;
  title: string;
  status: Status;
  version?: string;
  summary: string;
  items: string[];
  /** Items already built on main (indexes into items), ticked off on the page. */
  done?: number[];
}

export interface MumbotPage {
  title: string;
  description: string;
  label: string;
  intro: string;
  toc: { bots: string; download: string; roadmap: string };
  botsTitle: string;
  botsBody: string;
  webhook: { title: string; body: string; points: string[] };
  peer: { title: string; body: string; points: string[] };
  music: { title: string; body: string; points: string[] };
  history: { title: string; body: string; points: string[] };
  testbot: { title: string; body: string; points: string[] };
  downloadTitle: string;
  downloadBody: string;
  platforms: Record<BotPlatform, string>;
  docker: string;
  examples: string;
  checksums: string;
  noRelease: string;
  prerelease: string;
  copy: string;
  copied: string;
  roadmapTitle: string;
  roadmapBody: string;
  status: Record<Status, string>;
  epics: BotEpic[];
  ideaTitle: string;
  ideaBody: string;
  idea: string;
  source: string;
  docs: string;
}

/** Shown as is in every language: commands do not get translated. */
export const MUMBOT_CODE = {
  webhook: `curl -X POST http://127.0.0.1:8080/message \\
  -H 'X-API-Key: <your key>' \\
  -d '{"channel": 1, "message": "**deploy** finished"}'`,
  peer: `services:
  mumbot:
    image: ${MUMBOT_IMAGE}:0.2.0
    command: ["run"]
    network_mode: "service:mumpeer"
    environment:
      MUMBOT_MODULES: peer`,
  music: `curl -X POST http://127.0.0.1:8081/play \\
  -H "X-API-Key: <your key>" \\
  -d '{"file": "jingle.mp3"}'`,
  history: `[history]
channels = ["*"]
retention_days = 7`,
  testbot: `printf '%s\\n' 'join Lobby' 'say "<b>hello</b>"' \\
  'expect message --from Alice --contains hi' \\
  | mumbot --port 44738 --name Bob script`,
  docker: (version: string) => `docker run -d --name mumbot \\
  -v "$PWD/bot.toml:/config/bot.toml:ro" \\
  -v mumbot-data:/data -p 127.0.0.1:8080:8080 \\
  ${MUMBOT_IMAGE}:${version}`,
};

const source: Record<"de" | "en", MumbotPage> = {
  de: {
    title: "Mumbot",
    description:
      "Mumbot: Bots für jeden normalen Mumble-Server. Ein Webhook-Bot schreibt Nachrichten von außen in deine Kanäle, ein Test-Bot prüft Mumble-Clients automatisch.",
    label: "Bots für Mumble",
    intro:
      "Mumbot meldet sich wie ein Mensch mit eigenem Zertifikat an. Deshalb läuft er auf jedem normalen Mumble-Server, ohne Plugin und ohne Änderung an der Serverkonfiguration. Aus der Familie von Mumcord, Open Source unter AGPL-3.0.",
    toc: { bots: "Die Bots", download: "Download", roadmap: "Roadmap" },
    botsTitle: "Ein Bot, vier Module",
    botsBody: "Mumbot ist ein Programm aus Modulen, für Linux, Windows, macOS und als Docker-Image. Wähle die Module, die du brauchst: Sie laufen zusammen als ein Bot mit einer Verbindung. Der Test-Bot steckt in einem eigenen Build.",
    webhook: {
      title: "Webhook-Bot",
      body: "Monitoring, CI oder ein eigenes Skript schickt eine HTTP-Anfrage mit API-Schlüssel, und der Bot schreibt den Text in einen Mumble-Kanal.",
      points: [
        "Pro Schlüssel festlegen, in welche Kanäle er schreiben darf",
        "Fett, kursiv, Code, Listen und Links per Markdown",
        "Kanal-Passwörter, Wiederverbinden nach Abbrüchen und eine feste Identität per Zertifikat",
        "Rate-Limit und eine klare Antwort, ob die Nachricht angekommen ist",
      ],
    },
    peer: {
      title: "Relay (Peer)",
      body: "Verbindet deinen Server mit einem mumpeer-Relay: Der Bot kündigt das Relay bei Mumcord an und vergibt die Tokens für direkte Verbindungen.",
      points: [
        "Bildschirm teilen und große Bilder auch hinter CGNAT oder ohne die eigene IP zu zeigen",
        "Läuft im Netz des Relays, die API bleibt intern",
        "Nur registrierte Nutzer des eigenen Servers bekommen Tokens",
      ],
    },
    music: {
      title: "Musik",
      body: "Spielt MP3s über eine HTTP-API als normale Sprache in einen Kanal, mit Warteschlange.",
      points: [
        "Dateien aus einem Ordner, als Upload oder von freigegebenen Adressen",
        "Warteschlange, Überspringen, Lautstärke und Kanal pro Titel",
        "Bitrate passt sich dem Limit des Servers an",
      ],
    },
    history: {
      title: "Verlauf",
      body: "Hebt den Chat der gewählten Kanäle auf und gibt ihn an Mumcord-Nutzer weiter, die weg waren. Wie ein Mumcord-Client, der rund um die Uhr online ist.",
      points: [
        "Kanäle frei wählbar, 1 bis 7 Tage",
        "Private Nachrichten nie",
        "Antwortet auf Mumcords Verlaufs-Abgleich wie ein normaler Client",
      ],
    },
    testbot: {
      title: "Test-Bot (eigener Build)",
      body: "Ein geskripteter zweiter Teilnehmer für automatische Tests von Mumble-Clients. Mumcords eigene Tests laufen damit.",
      points: [
        "Chat, Status, Rechte und Moderation steuern und auf Bedingungen warten",
        "Sprache abspielen, aufnehmen und den Pegel prüfen, mit echtem Opus",
        "Ein Lasttest füllt einen lokalen Server mit bis zu 1000 Nutzern",
        "Exit-Code 0 heißt bestanden: passt in jede CI",
      ],
    },
    downloadTitle: "Download",
    downloadBody: "Das Archiv enthält das Programm `mumbot`, die README und eine Beispielkonfiguration `bot.example.toml`.",
    platforms: { linux: "Linux x86_64", linuxArm: "Linux ARM64", windows: "Windows", macos: "macOS" },
    docker: "Oder als Docker-Image für amd64 und arm64:",
    examples: "Fertige Docker-Compose-Beispiele: Webhook-Bot, Webhook-Bot mit eigenem Mumble-Server zum Ausprobieren und Test-Bot in der CI",
    checksums: "Prüfsummen",
    noRelease: "Die Downloads stehen auf GitHub.",
    prerelease: "Vorabversion",
    copy: "Kopieren",
    copied: "Kopiert",
    roadmapTitle: "Roadmap",
    roadmapBody: "Mumbot wird wie Mumcord in Epics gebaut. Epic 2 ist ein Vorschlag aus den offenen Issues und wird noch genau geplant.",
    status: { done: "fertig", now: "in Arbeit", planned: "als Nächstes", later: "später" },
    epics: [
      {
        id: "epic-0",
        tag: "Epic 0",
        title: "Test-Bot",
        status: "done",
        version: "0.1.0",
        summary: "Der geskriptete Bot aus Mumcords Tests, jetzt als eigenes Programm.",
        items: [
          "Chat, Status, Rechte und Moderation, Warten auf Bedingungen und ein Skript-Modus",
          "Sprache abspielen, aufnehmen und Pegel prüfen, mit Opus wie in Mumcord",
          "Lasttest mit bis zu 1000 Nutzern auf einem lokalen Testserver",
        ],
      },
      {
        id: "epic-1",
        tag: "Epic 1",
        title: "Webhook-Bot",
        status: "done",
        version: "0.1.0",
        summary: "Nachrichten von außen in einen Mumble-Kanal.",
        items: [
          "HTTP-API mit API-Schlüsseln und erlaubten Kanälen pro Schlüssel",
          "Markdown, Kanal-Passwörter, Wiederverbinden und Rate-Limit",
          "Programme für Linux, Windows und macOS und ein Docker-Image",
          "Seit 0.1.1: Docker-Compose-Beispiele und eine Doku zu Konfiguration, Kommandozeile, HTTP-API und Sicherheit",
        ],
      },
      {
        id: "epic-2",
        tag: "Epic 2",
        title: "Module, Musik und Verlauf",
        status: "now",
        version: "0.2.0",
        summary: "Aus einem Bot wird ein Baukasten.",
        items: [
          "Module: per Konfiguration oder Kommandozeile wählen, welche Bots laufen, in einem Programm und einem Image",
          "Musik-Bot: MP3s oder Links per HTTP schicken, der Bot spielt sie mit Warteschlange im Sprachkanal",
          "Verlaufs-Bot: speichert den Chat der Kanäle, die er sehen darf, und gibt ihn an Mumcord-Nutzer weiter, die offline waren. Private Nachrichten nie",
          "Nachrichtenkarten: Der Webhook schickt Alarme mit Titel, Statusfarbe, Graph und Link, die Mumcord als Karte zeigt",
          "Bitrate für Sprache und Musik einstellbar, nie über dem Limit des Servers",
          "Peer-Modul: meldet die Nutzer des Servers bei einem mumpeer-Relay an und teilt Mumcord mit, dass es das Relay gibt",
        ],
        done: [0, 1, 2, 3, 4, 5],
      },
      {
        id: "later",
        tag: "Danach",
        title: "Ideen",
        status: "later",
        summary: "Noch nicht geplant, aber vorgemerkt.",
        items: [
          "Ein Bot, der Chat liest und auf Befehle antwortet",
          "Sprachausgabe oder Warntöne im Kanal",
          "Ein Bot für mehrere Server oder mit mehreren Identitäten",
          "Flüstern und private Nachrichten, Schlüssel ohne Neustart tauschen, eingebautes TLS",
          "Das Zertifikat des Servers beim ersten Kontakt merken und Änderungen ablehnen",
        ],
      },
    ],
    ideaTitle: "Idee für einen Bot?",
    ideaBody: "Wünsche landen in den Issues von Mumbot auf GitHub.",
    idea: "Idee vorschlagen",
    source: "Quellcode auf GitHub",
    docs: "Doku",
  },
  en: {
    title: "Mumbot",
    description:
      "Mumbot: bots for any standard Mumble server. A webhook bot posts messages from outside into your channels, a test bot checks Mumble clients automatically.",
    label: "Bots for Mumble",
    intro:
      "Mumbot logs in like a person, with its own certificate. That's why it runs on any standard Mumble server, with no plugin and no change to the server config. From the Mumcord family, open source under AGPL-3.0.",
    toc: { bots: "The bots", download: "Download", roadmap: "Roadmap" },
    botsTitle: "One bot, four modules",
    botsBody: "Mumbot is one program built from modules, for Linux, Windows, macOS and as a Docker image. Pick the modules you need: they run together as one bot with one connection. The test bot lives in a build of its own.",
    webhook: {
      title: "Webhook bot",
      body: "Monitoring, CI or your own script sends one HTTP request with an API key, and the bot posts the text into a Mumble channel.",
      points: [
        "Set per key which channels it may write to",
        "Bold, italic, code, lists and links in Markdown",
        "Channel passwords, reconnects after drops and a fixed identity through its certificate",
        "Rate limit and a clear answer whether the message arrived",
      ],
    },
    peer: {
      title: "Relay (peer)",
      body: "Connects your server to a mumpeer relay: the bot announces the relay to Mumcord and hands out the tokens for direct connections.",
      points: [
        "Screen sharing and large images even behind CGNAT or without showing your IP",
        "Runs in the relay's network, the API stays internal",
        "Only registered users of your own server get tokens",
      ],
    },
    music: {
      title: "Music",
      body: "Plays MP3s as normal voice into a channel over an HTTP API, with a queue.",
      points: [
        "Files from a folder, as an upload or from allowed addresses",
        "Queue, skip, volume and a channel per track",
        "The bitrate follows the server's limit",
      ],
    },
    history: {
      title: "History",
      body: "Keeps the chat of the channels you choose and hands it to Mumcord users who were away. Like a Mumcord client that is online around the clock.",
      points: [
        "Any channels you like, 1 to 7 days",
        "Never private messages",
        "Answers Mumcord's history sync like a normal client",
      ],
    },
    testbot: {
      title: "Test bot (own build)",
      body: "A scripted second participant for automated tests of Mumble clients. Mumcord's own tests run on it.",
      points: [
        "Drive chat, state, permissions and moderation, and wait for conditions",
        "Play, record and check the level of voice, with real Opus",
        "A load test fills a local server with up to 1000 users",
        "Exit code 0 means passed: fits into any CI",
      ],
    },
    downloadTitle: "Download",
    downloadBody: "The archive holds the `mumbot` program, the README and an example config, `bot.example.toml`.",
    platforms: { linux: "Linux x86_64", linuxArm: "Linux ARM64", windows: "Windows", macos: "macOS" },
    docker: "Or as a Docker image for amd64 and arm64:",
    examples: "Ready-made Docker Compose examples: webhook bot, webhook bot with its own Mumble server to try it out, and test bot in CI",
    checksums: "Checksums",
    noRelease: "The downloads are on GitHub.",
    prerelease: "Pre-release",
    copy: "Copy",
    copied: "Copied",
    roadmapTitle: "Roadmap",
    roadmapBody: "Like Mumcord, Mumbot is built in epics. Epic 2 is a proposal from the open issues and still gets planned in detail.",
    status: { done: "done", now: "in progress", planned: "up next", later: "later" },
    epics: [
      {
        id: "epic-0",
        tag: "Epic 0",
        title: "Test bot",
        status: "done",
        version: "0.1.0",
        summary: "The scripted bot from Mumcord's tests, now a program of its own.",
        items: [
          "Chat, state, permissions and moderation, waiting for conditions and a script mode",
          "Play, record and check the level of voice, with Opus as in Mumcord",
          "Load test with up to 1000 users on a local test server",
        ],
      },
      {
        id: "epic-1",
        tag: "Epic 1",
        title: "Webhook bot",
        status: "done",
        version: "0.1.0",
        summary: "Messages from outside into a Mumble channel.",
        items: [
          "HTTP API with API keys and allowed channels per key",
          "Markdown, channel passwords, reconnects and a rate limit",
          "Programs for Linux, Windows and macOS and a Docker image",
          "Since 0.1.1: Docker Compose examples and docs for the config, command line, HTTP API and security",
        ],
      },
      {
        id: "epic-2",
        tag: "Epic 2",
        title: "Modules, music and history",
        status: "now",
        version: "0.2.0",
        summary: "One bot becomes a toolkit.",
        items: [
          "Modules: pick which bots run in the config or on the command line, in one program and one image",
          "Music bot: send MP3s or links over HTTP, and the bot plays them in the voice channel with a queue",
          "History bot: keeps the chat of the channels it may see and hands it to Mumcord users who were offline. Never private messages",
          "Message cards: the webhook sends alerts with a title, status colour, graph and link that Mumcord shows as a card",
          "Adjustable bitrate for speech and music, never above the server's limit",
          "Peer module: registers the server's users with a mumpeer relay and tells Mumcord the relay exists",
        ],
        done: [0, 1, 2, 3, 4, 5],
      },
      {
        id: "later",
        tag: "Beyond",
        title: "Ideas",
        status: "later",
        summary: "Not planned yet, but noted.",
        items: [
          "A bot that reads chat and answers commands",
          "Text-to-speech or alert sounds in a channel",
          "One bot for several servers or with several identities",
          "Whispers and private messages, swapping keys without a restart, built-in TLS",
          "Remember the server's certificate on first contact and refuse a changed one",
        ],
      },
    ],
    ideaTitle: "An idea for a bot?",
    ideaBody: "Wishes go into Mumbot's issues on GitHub.",
    idea: "Suggest an idea",
    source: "Source on GitHub",
    docs: "Docs",
  },
};

/** The words of the Mumbot page in one extra language (see i18n/bundle.ts). */
export type MumbotText = Omit<MumbotPage, "epics" | "platforms"> & {
  epics: { id: string; tag?: string; title: string; summary: string; items: string[] }[];
};

// Words from the translation; ids, tags, statuses and versions from English.
const mergeMumbot = (en: MumbotPage, tr: MumbotText | undefined): MumbotPage => {
  if (!tr) return en;
  const { epics: _epics, ...words } = tr;
  return {
    ...en,
    ...words,
    epics: en.epics.map((e) => {
      const te = tr.epics.find((x) => x.id === e.id);
      return te ? { ...e, tag: te.tag ?? e.tag, title: te.title, summary: te.summary, items: te.items } : e;
    }),
  };
};

export const mumbotPage = localized(source, (l) => mergeMumbot(source.en, bundles[l]?.mumbot));
