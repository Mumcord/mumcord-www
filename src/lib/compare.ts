// The feature comparison: the official Mumble client, Mumcord on any Mumble server, and Mumcord
// with a mumpeer relay next to the server. Cells are the same in every language; the words come
// from German, English or a translation (missing rows fall back to English).
import { localized } from "../i18n";
import { bundles } from "../i18n/locales";

/** y = yes, p = partly, s = coming soon (the note says when), n = no, for Mumble · Mumcord · Mumcord with mumpeer. */
type Cell = "y" | "p" | "s" | "n";
export type Cells = `${Cell}${Cell}${Cell}`;

export const COMPARE_CELLS: Record<string, Record<string, Cells>> = {
  voice: {
    "low-latency-opus-voice-through-the-mumbl": "yyy",
    "push-to-talk-with-keys-and-mouse-buttons": "yyy",
    "noise-suppression-and-echo-cancellation": "yyy",
    "whisper-and-shout-to-people-or-channels": "yyy",
    "music-quality-and-low-latency-mode": "yyy",
    "listen-to-a-channel-s-voice-without-join": "yss",
    "recording-conversations": "yss",
  },
  chat: {
    "text-chat-with-images": "yyy",
    "markdown-formatting": "yyy",
    "link-previews-and-youtube-twitch-music-e": "nyy",
    "replies-and-quotes": "nyy",
    "mentions-with-their-own-notification": "nyy",
    "read-and-write-in-channels-you-are-not-i": "nyy",
    "chat-history-from-before-you-joined": "npp",
    "private-conversations-kept-across-sessio": "nyy",
    "text-to-speech-for-messages": "yss",
  },
  media: {
    "full-size-images": "npy",
    "file-sharing": "nny",
    "screen-sharing-with-sound": "npy",
    "camera": "npy",
    "youtube-watch-party": "nyy",
  },
  privacy: {
    "several-servers-connected-at-once": "nyy",
    "ip-address-hidden-from-other-users": "yyy",
    "sharing-works-behind-cgnat-or-strict-fir": "npy",
    "several-identities-certificates": "pyy",
    "block-people-across-servers": "pyy",
    "control-who-may-send-private-messages": "nyy",
    "no-telemetry": "pyy",
  },
  plugins: {
    "positional-audio-in-games": "yyy",
    "in-game-overlay": "yyy",
    "mumble-plugins": "ypp",
    "mumcord-plugins": "nyy",
    "polls-dice-and-mini-games-in-the-channel": "nyy",
    "large-plugin-game-data": "npy",
  },
  admin: {
    "permissions-acl-and-groups-editor": "yyy",
    "kick-ban-and-ban-list": "yyy",
    "registered-users": "yyy",
    "create-edit-link-and-move-channels": "yyy",
    "admin-commands-in-the-chat-kick-move": "nyy",
  },
  platforms: {
    "windows": "yyy",
    "macos": "yyy",
    "linux": "yyy",
    "freebsd": "pyy",
    "android-and-ios": "nss",
    "works-with-any-standard-mumble-server": "yyy",
  },
};

/** Cells with a footnote mark (column 0 Mumble, 1 Mumcord, 2 with mumpeer); the row note is the footnote. */
export const COMPARE_FOOT: Record<string, number[]> = { "ip-address-hidden-from-other-users": [1] };

export interface CompareRow {
  id: string;
  feature: string;
  note?: string;
}

export interface CompareGroup {
  id: string;
  title: string;
  rows: CompareRow[];
}

export interface ComparePage {
  title: string;
  description: string;
  label: string;
  intro: string;
  /** Column heads: name and one line under it. */
  columns: { name: string; sub: string }[];
  yes: string;
  partly: string;
  no: string;
  soon: string;
  legend: string;
  groups: CompareGroup[];
  outroTitle: string;
  outroBody: string;
  download: string;
  relay: string;
  asOf: string;
}

const source: Record<"de" | "en", ComparePage> = {
  de: {
    title: "Mumble, Mumcord und mumpeer im Vergleich",
    description: "Was der offizielle Mumble-Client kann, was Mumcord auf jedem Mumble-Server dazu bringt und was erst mit dem Relay mumpeer geht: Sprache, Chat, Teilen, Privatsphäre.",
    label: "Vergleich",
    intro: "Mumcord läuft auf jedem normalen Mumble-Server, und Leute mit dem offiziellen Client sitzen im selben Kanal. Manches, etwa Dateien teilen oder deine IP-Adresse verbergen, braucht zusätzlich das Relay mumpeer neben dem Server.",
    columns: [
      { name: "Mumble", sub: "Offizieller Client 1.5" },
      { name: "Mumcord", sub: "Auf jedem Mumble-Server" },
      { name: "Mumcord + mumpeer", sub: "Mit Relay neben dem Server" },
    ],
    yes: "Ja",
    partly: "Teilweise",
    no: "Nein",
    soon: "Kommt bald",
    legend: "Teilweise heißt: mit Einschränkungen, die darunter stehen.",
    groups: [
      { id: "voice", title: "Sprache", rows: [
        { id: "low-latency-opus-voice-through-the-mumbl", feature: "Sprache mit Opus und niedriger Latenz über den Mumble-Server", note: "Sprache geht nie über das Relay." },
        { id: "push-to-talk-with-keys-and-mouse-buttons", feature: "Push-to-Talk mit Tasten und Maustasten", note: "Mumcord auch unter Wayland über das Shortcuts-Portal." },
        { id: "noise-suppression-and-echo-cancellation", feature: "Rauschunterdrückung und Echounterdrückung", note: "Mumble: Speex oder RNNoise. Mumcord: Leicht, Standard und Erweitert (RNNoise-Modell von 2024, Beta)." },
        { id: "whisper-and-shout-to-people-or-channels", feature: "Flüstern und Rufen an Leute oder Kanäle" },
        { id: "music-quality-and-low-latency-mode", feature: "Musikqualität und Modus für niedrige Latenz", note: "Mumble: Bitrate und Paketgröße in den Audio-Einstellungen. Mumcord: ein Schalter, dazu Vorgaben je Kanal." },
        { id: "listen-to-a-channel-s-voice-without-join", feature: "Einem Kanal zuhören, ohne ihn zu betreten", note: "Mumbles Channel Listener. Mumcord zeigt Zuhörer schon an und bekommt das Zuhören mit 0.10.0." },
        { id: "recording-conversations", feature: "Gespräche aufnehmen", note: "Mumble hat einen eingebauten Mehrspur-Rekorder. Mumcord bekommt die Aufnahme mit 0.10.0." },
      ] },
      { id: "chat", title: "Chat", rows: [
        { id: "text-chat-with-images", feature: "Text-Chat mit Bildern", note: "In Mumble müssen Bilder unter die Nachrichtengrenze des Servers passen." },
        { id: "markdown-formatting", feature: "Markdown-Formatierung", note: "Mumcord dazu mit Code-Hervorhebung und Formatierungsleiste." },
        { id: "link-previews-and-youtube-twitch-music-e", feature: "Link-Vorschauen und eingebettete YouTube-, Twitch- und Musik-Player", note: "Lädt Mumcord selbst; lässt sich abschalten." },
        { id: "replies-and-quotes", feature: "Antworten und Zitate", note: "Offizielle Mumble-Clients sehen ein lesbares Zitat." },
        { id: "mentions-with-their-own-notification", feature: "@Erwähnungen mit eigener Benachrichtigung", note: "Andere Mumble-Clients sehen nur den Text." },
        { id: "read-and-write-in-channels-you-are-not-i", feature: "In Kanälen lesen und schreiben, in denen du nicht bist", note: "Kanal über das Augen-Symbol folgen." },
        { id: "chat-history-from-before-you-joined", feature: "Chatverlauf von vor deinem Beitritt", note: "Mumcord-Nutzer geben bis zu 7 Tage Kanalverlauf weiter. Den vollständigen Verlauf für Abwesende liefert Mumbots Verlaufs-Bot, unabhängig vom Relay." },
        { id: "private-conversations-kept-across-sessio", feature: "Private Unterhaltungen bleiben erhalten", note: "Nur auf deinem Computer gespeichert, je Server abschaltbar." },
        { id: "text-to-speech-for-messages", feature: "Nachrichten vorlesen lassen", note: "Mumcord bekommt das Vorlesen mit 0.10.0." },
      ] },
      { id: "media", title: "Medien und Teilen", rows: [
        { id: "full-size-images", feature: "Bilder in voller Größe", note: "Ohne Relay nur über eine direkte Verbindung, die dem Absender deine IP-Adresse zeigt. Offizielle Clients sehen die Vorschau." },
        { id: "file-sharing", feature: "Dateien teilen", note: "Bis 2 GB, immer über das Relay; die Datei berührt den Mumble-Server nie." },
        { id: "screen-sharing-with-sound", feature: "Bildschirm teilen mit Ton", note: "Direkt: bis zu 8 Zuschauer, jeder bekommt eine eigene Kopie und sieht deine IP-Adresse. Relay: bis zu 25 Zuschauer, IP-Adresse verborgen." },
        { id: "camera", feature: "Kamera", note: "Direkt: bis zu 8 Zuschauer. Relay: bis zu 18 Kameras mit je 25 Zuschauern. In beiden Fällen Ende-zu-Ende-verschlüsselt." },
        { id: "youtube-watch-party", feature: "YouTube-Watch-Party", note: "Synchron über den Mumble-Server, ohne Relay." },
      ] },
      { id: "privacy", title: "Server und Privatsphäre", rows: [
        { id: "several-servers-connected-at-once", feature: "Mehrere Server gleichzeitig verbunden", note: "Standardmäßig bis zu 5, einstellbar bis 15." },
        { id: "ip-address-hidden-from-other-users", feature: "IP-Adresse vor anderen verborgen", note: "Mumcord verbindet nur nach deiner Zustimmung direkt, dann sieht die andere Person deine IP-Adresse. Mit „immer Relay“ sieht sie niemand. Mumble hat keine direkten Verbindungen." },
        { id: "sharing-works-behind-cgnat-or-strict-fir", feature: "Teilen klappt auch hinter CGNAT und strengen Firewalls", note: "Ohne Relay braucht Teilen einen direkten Weg (IPv6 oder Portweiterleitung am Router)." },
        { id: "several-identities-certificates", feature: "Mehrere Identitäten (Zertifikate)", note: "Mumble nutzt ein Zertifikat zur Zeit; Mumcord wählt eines je Server." },
        { id: "block-people-across-servers", feature: "Leute serverübergreifend blockieren", note: "Mumble: lokal stummschalten und Nachrichten ignorieren." },
        { id: "control-who-may-send-private-messages", feature: "Festlegen, wer dir privat schreiben darf" },
        { id: "no-telemetry", feature: "Keine Telemetrie", note: "Mumble kann anonyme Nutzungsstatistiken senden, das lässt sich abschalten." },
      ] },
      { id: "plugins", title: "Plugins und Spiele", rows: [
        { id: "positional-audio-in-games", feature: "Positional Audio in Spielen", note: "Mumcord nutzt Mumble Link und Mumbles offizielle Spiel-Plugins (Beta)." },
        { id: "in-game-overlay", feature: "Overlay im Spiel", note: "Mumcord: Vulkan-Layer unter Linux, durchklickbares Fenster unter Windows; nicht auf macOS und FreeBSD." },
        { id: "mumble-plugins", feature: "Mumble-Plugins", note: "Native Plugins, vor allem für Positional Audio in Spielen. Mumcord nutzt Mumbles offizielle Spiel-Plugins (Beta)." },
        { id: "mumcord-plugins", feature: "Mumcord-Plugins", note: "Abgeschottete, signierte WebAssembly-Plugins mit Verzeichnis: Umfragen, Würfel, Spiele, Whiteboard und mehr." },
        { id: "polls-dice-and-mini-games-in-the-channel", feature: "Umfragen, Würfel und Mini-Spiele im Kanal", note: "Über den Mumble-Server. Offizielle Clients stimmen mit !poll ab." },
        { id: "large-plugin-game-data", feature: "Große Spieldaten von Plugins", note: "Ohne Relay nur kleine Nachrichten über den Mumble-Server; mit Relay bis 64 KB je Nachricht, Ende-zu-Ende-verschlüsselt." },
      ] },
      { id: "admin", title: "Verwaltung", rows: [
        { id: "permissions-acl-and-groups-editor", feature: "Rechte (ACL) und Gruppen bearbeiten", note: "Mumcord erklärt jede Antwort und warnt, bevor du dich selbst aussperrst." },
        { id: "kick-ban-and-ban-list", feature: "Kicken, Bannen und Bannliste" },
        { id: "registered-users", feature: "Registrierte Nutzer" },
        { id: "create-edit-link-and-move-channels", feature: "Kanäle anlegen, bearbeiten, verknüpfen und verschieben" },
        { id: "admin-commands-in-the-chat-kick-move", feature: "Admin-Befehle im Chat (/kick, /move …)" },
      ] },
      { id: "platforms", title: "Plattformen", rows: [
        { id: "windows", feature: "Windows", note: "Mumcord auch als portables Zip." },
        { id: "macos", feature: "macOS" },
        { id: "linux", feature: "Linux" },
        { id: "freebsd", feature: "FreeBSD", note: "Mumble über die Ports der Community. Mumcord dort ohne Kamera, Overlay und Ton beim Bildschirm teilen." },
        { id: "android-and-ios", feature: "Android und iOS", note: "Für Mumble gibt es Apps von Dritten (z. B. Mumla); die Mumcord-Apps kommen bald." },
        { id: "works-with-any-standard-mumble-server", feature: "Läuft auf jedem normalen Mumble-Server", note: "Mumcord- und Mumble-Nutzer sprechen und schreiben miteinander." },
      ] },
    ],
    outroTitle: "Kein Entweder-oder",
    outroBody: "Mumcord und der offizielle Client sprechen dasselbe Protokoll. Dein Server bleibt, wie er ist, und das Relay ist optional: Betreibt eine Community mumpeer zusammen mit dem Relay-Bot, bekommt sie Dateien, mehr Zuschauer und verborgene IP-Adressen dazu.",
    download: "Mumcord laden",
    relay: "mumpeer einrichten",
    asOf: "Stand: Mumcord 0.9, mumpeer 0.3 und Mumble 1.5.",
  },
  en: {
    title: "Mumble, Mumcord and mumpeer compared",
    description: "What the official Mumble client does, what Mumcord adds on any Mumble server, and what needs the mumpeer relay: voice, chat, sharing and privacy side by side.",
    label: "Comparison",
    intro: "Mumcord runs on any standard Mumble server, and people with the official client sit in the same channel. Some things, like sharing files or hiding your IP address, also need the mumpeer relay next to the server.",
    columns: [
      { name: "Mumble", sub: "Official client 1.5" },
      { name: "Mumcord", sub: "On any Mumble server" },
      { name: "Mumcord + mumpeer", sub: "With a relay next to the server" },
    ],
    yes: "Yes",
    partly: "Partly",
    no: "No",
    soon: "Coming soon",
    legend: "Partly means: with limits, listed below the row.",
    groups: [
      { id: "voice", title: "Voice", rows: [
        { id: "low-latency-opus-voice-through-the-mumbl", feature: "Low-latency Opus voice through the Mumble server", note: "Voice never goes through the relay." },
        { id: "push-to-talk-with-keys-and-mouse-buttons", feature: "Push-to-talk with keys and mouse buttons", note: "Mumcord also supports Wayland via the shortcuts portal." },
        { id: "noise-suppression-and-echo-cancellation", feature: "Noise suppression and echo cancellation", note: "Mumble: Speex or RNNoise. Mumcord: Light, Standard, Advanced (2024 RNNoise model, beta)." },
        { id: "whisper-and-shout-to-people-or-channels", feature: "Whisper and shout to people or channels" },
        { id: "music-quality-and-low-latency-mode", feature: "Music quality and low-latency mode", note: "Mumble: bitrate and frame size in the audio settings. Mumcord: one switch, plus per-channel presets." },
        { id: "listen-to-a-channel-s-voice-without-join", feature: "Listen to a channel's voice without joining", note: "Mumble's channel listeners. Mumcord already shows listeners and gets listening with 0.10.0." },
        { id: "recording-conversations", feature: "Recording conversations", note: "Mumble has a built-in multichannel recorder. Mumcord gets recording with 0.10.0." },
      ] },
      { id: "chat", title: "Chat", rows: [
        { id: "text-chat-with-images", feature: "Text chat with images", note: "In Mumble, images must fit the server's message size limit." },
        { id: "markdown-formatting", feature: "Markdown formatting", note: "Mumcord adds code highlighting and a formatting toolbar." },
        { id: "link-previews-and-youtube-twitch-music-e", feature: "Link previews and YouTube/Twitch/music embeds", note: "Fetched by Mumcord itself; can be switched off." },
        { id: "replies-and-quotes", feature: "Replies and quotes", note: "Official Mumble clients see a readable quote." },
        { id: "mentions-with-their-own-notification", feature: "@mentions with their own notification", note: "Other Mumble clients just see the text." },
        { id: "read-and-write-in-channels-you-are-not-i", feature: "Read and write in channels you are not in", note: "Follow a channel with the eye icon." },
        { id: "chat-history-from-before-you-joined", feature: "Chat history from before you joined", note: "Mumcord users pass on up to 7 days of channel history. Full history for people who were away needs Mumbot's history bot, separate from the relay." },
        { id: "private-conversations-kept-across-sessio", feature: "Private conversations kept across sessions", note: "Stored only on your computer, can be switched off per server." },
        { id: "text-to-speech-for-messages", feature: "Text-to-speech for messages", note: "Mumcord gets text-to-speech with 0.10.0." },
      ] },
      { id: "media", title: "Media & sharing", rows: [
        { id: "full-size-images", feature: "Full-size images", note: "Without the relay, only over a direct connection, which shows your IP to the sender. Official clients see the preview." },
        { id: "file-sharing", feature: "File sharing", note: "Up to 2 GB, always through the relay; the file never touches the Mumble server." },
        { id: "screen-sharing-with-sound", feature: "Screen sharing with sound", note: "Direct: up to 8 viewers, each gets their own copy and sees your IP. Relay: up to 25 viewers, IP hidden." },
        { id: "camera", feature: "Camera", note: "Direct: up to 8 viewers. Relay: up to 18 cameras, 25 viewers each. End-to-end encrypted either way." },
        { id: "youtube-watch-party", feature: "YouTube watch party", note: "Synced over the Mumble server, no relay needed." },
      ] },
      { id: "privacy", title: "Servers & privacy", rows: [
        { id: "several-servers-connected-at-once", feature: "Several servers connected at once", note: "Up to 5 by default, adjustable up to 15." },
        { id: "ip-address-hidden-from-other-users", feature: "IP address hidden from other users", note: "Mumcord only connects directly after you agree, and then the other person sees your IP address. With “always relay” nobody does. Mumble has no direct connections." },
        { id: "sharing-works-behind-cgnat-or-strict-fir", feature: "Sharing works behind CGNAT or strict firewalls", note: "Without the relay, sharing needs a direct path (IPv6 or router port mapping)." },
        { id: "several-identities-certificates", feature: "Several identities (certificates)", note: "Mumble uses one certificate at a time; Mumcord picks one per server." },
        { id: "block-people-across-servers", feature: "Block people across servers", note: "Mumble: local mute and ignore messages per session." },
        { id: "control-who-may-send-private-messages", feature: "Control who may send private messages" },
        { id: "no-telemetry", feature: "No telemetry", note: "Mumble can send anonymous usage statistics, which you can turn off." },
      ] },
      { id: "plugins", title: "Plugins & games", rows: [
        { id: "positional-audio-in-games", feature: "Positional audio in games", note: "Mumcord uses Mumble Link and Mumble's official game plugins (beta)." },
        { id: "in-game-overlay", feature: "In-game overlay", note: "Mumcord: Vulkan layer on Linux, click-through window on Windows; not on macOS or FreeBSD." },
        { id: "mumble-plugins", feature: "Mumble plugins", note: "Native plugins, mainly for positional audio in games. Mumcord uses Mumble's official game plugins (beta)." },
        { id: "mumcord-plugins", feature: "Mumcord plugins", note: "Sandboxed, signed WebAssembly plugins with a directory: polls, dice, games, a whiteboard and more." },
        { id: "polls-dice-and-mini-games-in-the-channel", feature: "Polls, dice and mini-games in the channel", note: "Over the Mumble server. Official clients vote in polls with !poll." },
        { id: "large-plugin-game-data", feature: "Large plugin game data", note: "Without the relay, only small messages over the Mumble server; with it up to 64 KB per message, end-to-end encrypted." },
      ] },
      { id: "admin", title: "Admin", rows: [
        { id: "permissions-acl-and-groups-editor", feature: "Permissions (ACL) and groups editor", note: "Mumcord explains every answer and warns before you lock yourself out." },
        { id: "kick-ban-and-ban-list", feature: "Kick, ban and ban list" },
        { id: "registered-users", feature: "Registered users" },
        { id: "create-edit-link-and-move-channels", feature: "Create, edit, link and move channels" },
        { id: "admin-commands-in-the-chat-kick-move", feature: "Admin commands in the chat (/kick, /move …)" },
      ] },
      { id: "platforms", title: "Platforms", rows: [
        { id: "windows", feature: "Windows", note: "Mumcord also as a portable zip." },
        { id: "macos", feature: "macOS" },
        { id: "linux", feature: "Linux" },
        { id: "freebsd", feature: "FreeBSD", note: "Mumble through the community ports tree. Mumcord: no camera, overlay or screen-share sound there." },
        { id: "android-and-ios", feature: "Android and iOS", note: "Third-party Mumble apps exist (e.g. Mumla); the Mumcord apps are coming soon." },
        { id: "works-with-any-standard-mumble-server", feature: "Works with any standard Mumble server", note: "Mumcord and official Mumble users talk and chat together." },
      ] },
    ],
    outroTitle: "Not either-or",
    outroBody: "Mumcord and the official client speak the same protocol. Your server stays as it is, and the relay is optional: a community that runs mumpeer with the relay bot gets files, more viewers and hidden IP addresses on top.",
    download: "Get Mumcord",
    relay: "Set up mumpeer",
    asOf: "As of Mumcord 0.9, mumpeer 0.3 and Mumble 1.5.",
  },
};

/** A translation's words merged onto English by group and row id. */
const merge = (en: ComparePage, tr: CompareText | undefined): ComparePage => {
  if (!tr) return en;
  const { groups, ...words } = tr;
  return {
    ...en,
    ...words,
    groups: en.groups.map((g) => {
      const tg = groups?.find((x) => x.id === g.id);
      return { ...g, title: tg?.title ?? g.title, rows: g.rows.map((r) => ({ ...r, ...tg?.rows?.find((x) => x.id === r.id) })) };
    }),
  };
};

export type CompareText = Partial<Omit<ComparePage, "groups">> & { groups?: { id: string; title?: string; rows?: CompareRow[] }[] };

export const comparePage = localized(source, (l) => merge(source.en, bundles[l]?.compare));
