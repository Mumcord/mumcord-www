// The smaller Mumcord tools in their own repos: mumpeer (the relay) and mumquiz (the quiz bot).
// Content follows each repo's README; the latest release comes from the GitHub API at build time.
// Texts may contain `code` in backticks; code, commands and links are never translated.
import { localized } from "../i18n";
import { bundles } from "../i18n/locales";
import type { ToolsText } from "../i18n/bundle";

export type ToolId = "mumpeer" | "mumquiz";

export const TOOL_REPO: Record<ToolId, string> = { mumpeer: "Mumcord/mumpeer", mumquiz: "Mumcord/mumquiz" };
export const toolRepoUrl = (id: ToolId) => `https://github.com/${TOOL_REPO[id]}`;

/** Code blocks and command names: the same in every language. */
export const TOOL_CODE: Record<ToolId, { file: string; code: string; terms?: string[] }> = {
  mumpeer: {
    file: "docker-compose.yml",
    code: `services:
  mumpeer:
    image: ghcr.io/mumcord/mumpeer:0.1.0
    restart: unless-stopped
    environment:
      MUMPEER_API_SECRET: \${PEER_API_SECRET:?set PEER_API_SECRET in .env}
    ports: ["443:443/udp", "443:443/tcp"]
    volumes:
      - ./mumpeer.toml:/config/mumpeer.toml:ro
      - mumpeer-data:/var/lib/mumpeer
  mumbot:
    image: ghcr.io/mumcord/mumbot:0.2.0
    command: ["peer"]
    restart: unless-stopped
    network_mode: "service:mumpeer"
    environment:
      MUMBOT_CONFIG: /config/bot.toml
      MUMBOT_PEER_API_SECRET: \${PEER_API_SECRET:?set PEER_API_SECRET in .env}
    volumes:
      - ./bot.toml:/config/bot.toml:ro
      - mumbot-data:/data
    healthcheck:
      disable: true
volumes:
  mumpeer-data:
  mumbot-data:`,
  },
  mumquiz: {
    file: "Terminal",
    code: `git clone https://github.com/Mumcord/mumquiz && cd mumquiz
cp examples/bot.example.toml bot.toml
cp data/questions.example.toml questions.toml
cargo build --release
./target/release/mumquiz --config bot.toml --questions questions.toml`,
    terms: ["!help", "!score", "!hiscore", "!botsnack", "!reload", "!join", "!op / !deop"],
  },
};

export interface ToolPage {
  title: string;
  description: string;
  lead: string;
  features: { title: string; body: string }[];
  listTitle: string;
  /** For mumquiz each line belongs to the command in TOOL_CODE.terms at the same place. */
  list: string[];
  startTitle: string;
  startBody: string;
  startNote: string;
  credit?: string;
}

export interface ToolsPage {
  label: string;
  release: string;
  noRelease: string;
  copy: string;
  copied: string;
  source: string;
  issues: string;
  readme: string;
  pages: Record<ToolId, ToolPage>;
}

const source: Record<"de" | "en", ToolsPage> = {
  de: {
    label: "Tools",
    release: "Aktuelle Version",
    noRelease: "Noch kein Release",
    copy: "Kopieren",
    copied: "Kopiert",
    source: "Quellcode",
    issues: "Ideen und Fehler",
    readme: "Ganze Anleitung im README",
    pages: {
      mumpeer: {
        title: "mumpeer",
        description: "mumpeer ist ein kleines Relay für Mumcords direkte Verbindungen: wenn zwei Leute sich nicht direkt erreichen oder ihre IP-Adresse verbergen wollen.",
        lead: "Ein kleines Relay für Mumcords direkte Verbindungen zwischen Nutzern, etwa beim Bildschirm teilen oder für Bilder in voller Größe. Erreichen sich zwei Leute nicht direkt, hinter CGNAT, strengen Firewalls oder in Netzen ohne UDP, oder wollen sie ihre IP-Adresse nicht zeigen, verbinden sich beide mit dem Relay. Es reicht die verschlüsselten Pakete nur weiter, wie ein TURN-Server.",
        features: [
          { title: "Neben deinem Mumble-Server", body: "Eine Community betreibt mumpeer neben ihrem Mumble-Server, zusammen mit dem Relay-Bot `mumbot peer`. Der Bot kündigt das Relay an und vergibt kurzlebige Tokens. Der Mumble-Server bleibt unverändert." },
          { title: "Nur für verifizierte Nutzer", body: "Ein Token gilt nur für genau zwei Zertifikate, einmal pro Seite und standardmäßig 120 Sekunden. Das Relay leitet nirgendwo anders hin und öffnet selbst keine Verbindungen. Ein offener Proxy ist es also nicht." },
          { title: "Ende-zu-Ende verschlüsselt", body: "Was durchs Relay geht, ist eine eigene verschlüsselte Verbindung zwischen den beiden Nutzern, gebunden an ihre Mumble-Zertifikate. Das Relay kann sie weder lesen noch ändern." },
          { title: "Durch fast jede Firewall", body: "QUIC über UDP oder, wo UDP blockiert ist, TLS über TCP. Beides auf Port 443 und mit TLS 1.3." },
          { title: "Ganz optional", body: "Mumcord funktioniert auch ohne Bot und Relay. In Mumcord wählst du: Relay aus, nur wenn direkt nicht klappt, oder immer." },
        ],
        listTitle: "Was der Betreiber sieht",
        list: [
          "Die IP-Adressen beider Nutzer einer Sitzung",
          "Welche zwei Zertifikate miteinander sprechen",
          "Wie viele Daten wann fließen",
          "Nicht die Inhalte: Die sind Ende-zu-Ende verschlüsselt. Mumcord sagt dir das, bevor du ein Relay nutzt",
          "Nie protokolliert werden volle IP-Adressen, volle Zertifikat-Hashes, Tokens und Paketinhalte",
        ],
        startTitle: "Starten mit Docker",
        startBody: "Ein langes, zufälliges Secret als `PEER_API_SECRET` in die `.env` schreiben (etwa aus `openssl rand -hex 32`). Aus Mumbots Relay-Beispiel `mumpeer.example.toml` als `mumpeer.toml` speichern und darin `public_host` setzen, dazu `bot.example.toml` als `bot.toml`. Dann Relay und Bot zusammen starten:",
        startNote: "Beim ersten Start steht der Fingerabdruck des Relays im Log. Der Bot kündigt ihn Mumcord an, sonst muss nichts geteilt werden. Öffne UDP und TCP auf Port 443, die API bleibt zwischen Relay und Bot. Mumcord nutzt das Relay ab Version 0.5.0.",
      },
      mumquiz: {
        title: "mumquiz",
        description: "mumquiz ist ein Quiz-Bot für Mumble-Server: Er stellt Fragen, liest die Antworten im Chat, gibt Tipps und vergibt Punkte.",
        lead: "Ein Quiz-Bot für Mumble-Server: Er stellt Fragen, liest die Antworten im Chat, gibt Tipps, vergibt Punkte und merkt sich die Siege. Er meldet sich an wie ein Mensch, mit eigenem Zertifikat. Damit läuft er auf jedem normalen Mumble-Server, ohne Plugin und ohne Änderung an der Konfiguration.",
        features: [
          { title: "Das Spiel", body: "Sobald genug Leute im Kanal sind, geht's los. Nach einer Weile gibt es einen Tipp mit ein paar Buchstaben, nach fünf Tipps die Auflösung. Wer zuerst die Punktzahl der Runde erreicht, gewinnt." },
          { title: "Großzügig bei Antworten", body: "Groß- und Kleinschreibung, Satzzeichen und Schreibweisen wie ae und ä oder ss und ß zählen gleich." },
          { title: "Schön in Mumcord", body: "In Mumcord erscheinen die Spielnachrichten als Nachrichtenkarten, im offiziellen Mumble-Client als normaler Chat-Text." },
          { title: "Eigene Fragen", body: "Die Fragen liegen in einer einfachen TOML-Datei. Auf Wunsch übernimmt ein Skript die Fragen des ursprünglichen Bots." },
        ],
        listTitle: "Befehle im Chat",
        list: [
          "Die Hilfe, privat an dich",
          "Die besten fünf dieser Runde",
          "Die besten fünf aller Zeiten",
          "Den Bot füttern, sonst wird er hungrig",
          "Die Fragen neu laden (Spielleitung)",
          "In einen anderen Kanal wechseln (Spielleitung)",
          "Spielleitung hinzufügen oder entfernen",
        ],
        startTitle: "Selbst bauen und starten",
        startBody: "Mit Rust baust du den Bot so:",
        startNote: "Dann den Kanal „Quiz“ betreten und `!help` schreiben. Das Spiel beginnt, sobald zwei Leute da sind.",
        credit: "Das Spiel und seine Texte stammen von zorgch/irc-quizbot (GPL-3.0), nach Rust und aufs Mumble-Protokoll portiert, mit derselben Protokoll-Schicht wie Mumcord.",
      },
    },
  },
  en: {
    label: "Tools",
    release: "Latest version",
    noRelease: "No release yet",
    copy: "Copy",
    copied: "Copied",
    source: "Source code",
    issues: "Ideas and bugs",
    readme: "Full guide in the README",
    pages: {
      mumpeer: {
        title: "mumpeer",
        description: "mumpeer is a small relay for Mumcord's direct connections: for when two people cannot reach each other directly or want to hide their IP address.",
        lead: "A small relay for Mumcord's direct connections between users, for screen sharing or full-size images, for example. When two people cannot reach each other directly, behind CGNAT, strict firewalls or in networks without UDP, or don't want to show their IP address, both connect to the relay instead. It only passes the encrypted packets along, like a TURN server.",
        features: [
          { title: "Next to your Mumble server", body: "A community runs mumpeer next to its Mumble server, together with the relay bot `mumbot peer`. The bot announces the relay and hands out short-lived tokens. The Mumble server stays unmodified." },
          { title: "Verified users only", body: "A token works only for exactly two certificates, once per side and for 120 seconds by default. The relay never forwards anywhere else and never opens connections itself, so it is not an open proxy." },
          { title: "End-to-end encrypted", body: "What goes through the relay is a separate encrypted connection between the two users, pinned to their Mumble certificates. The relay can neither read nor change it." },
          { title: "Through almost any firewall", body: "QUIC over UDP or, where UDP is blocked, TLS over TCP. Both on port 443 and with TLS 1.3." },
          { title: "Entirely optional", body: "Mumcord works without bot and relay too. In Mumcord you choose: relay off, only when a direct connection fails, or always." },
        ],
        listTitle: "What the operator can see",
        list: [
          "The IP addresses of both users of a session",
          "Which two certificates talk to each other",
          "How much data flows and when",
          "Not the contents: they are encrypted end to end. Mumcord tells you this before you use a relay",
          "Never logged: full IP addresses, full certificate hashes, tokens and packet contents",
        ],
        startTitle: "Run it with Docker",
        startBody: "Put a long random secret into `.env` as `PEER_API_SECRET` (for example from `openssl rand -hex 32`). From Mumbot's relay example, save `mumpeer.example.toml` as `mumpeer.toml` and set `public_host` in it, and `bot.example.toml` as `bot.toml`. Then start relay and bot together:",
        startNote: "On first start the relay's fingerprint shows in the log. The bot announces it to Mumcord, nothing else needs to be shared. Open UDP and TCP on port 443, the API stays between relay and bot. Mumcord uses the relay from version 0.5.0.",
      },
      mumquiz: {
        title: "mumquiz",
        description: "mumquiz is a quiz bot for Mumble servers: it asks questions, reads the answers in chat, gives hints and awards points.",
        lead: "A quiz bot for Mumble servers: it asks questions, reads the answers in chat, gives hints, awards points and remembers the wins. It logs in like a person, with its own certificate. So it runs on any standard Mumble server, with no plugin and no config change.",
        features: [
          { title: "The game", body: "As soon as enough people are in the channel, it starts. After a while there is a hint with a few letters, after five hints the answer. Whoever reaches the round's score first wins." },
          { title: "Generous with answers", body: "Upper and lower case, punctuation and spellings like ae and ä or ss and ß count as the same." },
          { title: "Nice in Mumcord", body: "In Mumcord the game messages show as message cards, in the official Mumble client as plain chat text." },
          { title: "Your own questions", body: "The questions live in a simple TOML file. A script can bring over the original bot's questions if you like." },
        ],
        listTitle: "Commands in the chat",
        list: [
          "The help, privately to you",
          "Top five of this round",
          "Top five of all time",
          "Feed the bot, or it gets hungry",
          "Reload the questions (game masters)",
          "Move to another channel (game masters)",
          "Add or remove a game master",
        ],
        startTitle: "Build and run it yourself",
        startBody: "With Rust you build the bot like this:",
        startNote: "Then join the channel “Quiz” and type `!help`. The game starts as soon as two people are there.",
        credit: "The game and its messages come from zorgch/irc-quizbot (GPL-3.0), ported to Rust and to the Mumble protocol, with the same protocol layer as Mumcord.",
      },
    },
  },
};

// Words from the translation; anything a translation lacks comes from English.
const mergeTools = (en: ToolsPage, tr: ToolsText | undefined): ToolsPage => {
  if (!tr) return en;
  const { pages, ...words } = tr;
  return {
    ...en,
    ...words,
    pages: {
      mumpeer: { ...en.pages.mumpeer, ...pages?.mumpeer },
      mumquiz: { ...en.pages.mumquiz, ...pages?.mumquiz },
    },
  };
};

export const toolsPage = localized(source, (l) => mergeTools(source.en, bundles[l]?.tools));

export interface ToolRelease {
  version: string;
  url: string;
}

const cache = new Map<ToolId, Promise<ToolRelease | null>>();

async function load(id: ToolId): Promise<ToolRelease | null> {
  const headers: Record<string, string> = { Accept: "application/vnd.github+json", "User-Agent": "mumcord-www-build" };
  if (process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  try {
    const res = await fetch(`https://api.github.com/repos/${TOOL_REPO[id]}/releases?per_page=5`, { headers });
    if (!res.ok) {
      console.warn(`[tools] GitHub API answered ${res.status} for ${id}; building without release data`);
      return null;
    }
    const list = (await res.json()) as { tag_name: string; html_url: string; draft: boolean }[];
    const rel = list.find((r) => !r.draft);
    return rel ? { version: rel.tag_name.replace(/^v/, ""), url: rel.html_url } : null;
  } catch (err) {
    console.warn(`[tools] could not reach GitHub for ${id}; building without release data`, err);
    return null;
  }
}

/** The newest published release of a tool, or null before the first one. */
export function getToolRelease(id: ToolId): Promise<ToolRelease | null> {
  if (!cache.has(id)) cache.set(id, load(id));
  return cache.get(id)!;
}
