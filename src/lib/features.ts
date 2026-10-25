// Content of the features page. Every feature that has a screenshot names it by file name in
// src/assets/shots (without .png); features without one show text only until a capture exists.
import type { Lang } from "../i18n";
import { ISSUES_URL } from "./release";

export const BUG_URL = `${ISSUES_URL}/new?template=bug_report.yml`;
export const IDEA_URL = `${ISSUES_URL}/new?template=feature_request.yml`;

export interface Feature {
  id: string;
  title: string;
  body: string;
  shot?: string;
  alt?: string;
  since?: string;
}

export interface FeatureGroup {
  id: string;
  title: string;
  features: Feature[];
}

export interface FeaturesPage {
  title: string;
  description: string;
  label: string;
  intro: string;
  contents: string;
  newIn: string;
  zoom: string;
  askTitle: string;
  askBody: string;
  idea: string;
  bug: string;
  bugNote: string;
  groups: FeatureGroup[];
}

export const featuresPage: Record<Lang, FeaturesPage> = {
  de: {
    title: "Funktionen",
    description:
      "Alle Funktionen von Mumcord mit Screenshots: Server und Zertifikate, Kanälen folgen, Chat mit Vorschauen und @Erwähnungen, Push-to-Talk, Audio und Komfort.",
    label: "Was Mumcord kann",
    intro:
      "Alles, was in der aktuellen Version steckt, mit einem Bild dazu, wo es eins gibt. Was noch kommt, steht in der Roadmap. Fehlt dir etwas oder klemmt etwas, sag es auf GitHub.",
    contents: "Inhalt",
    newIn: "neu in",
    zoom: "Screenshot in voller Größe öffnen",
    askTitle: "Fehlt etwas? Klemmt etwas?",
    askBody:
      "Wünsche und Fehler sammeln sich in den Issues auf GitHub. Du brauchst dafür ein kostenloses GitHub-Konto; die Vorlagen fragen nur das ab, was wirklich hilft.",
    idea: "Feature wünschen",
    bug: "Fehler melden",
    bugNote: "Sicherheitslücken bitte nicht öffentlich melden, sondern per E-Mail an tobias@vorwachs.com.",
    groups: [
      {
        id: "verbinden",
        title: "Verbinden",
        features: [
          {
            id: "einrichtung",
            title: "Eingerichtet in einer Minute",
            body: "Beim ersten Start fragt Mumcord nur drei Dinge ab: deinen Namen samt Identität, das Mikrofon mit Pegeltest und wie du sprechen willst. Bestehende Mumble-Identitäten lassen sich als PKCS#12 importieren.",
            shot: "wizard-1-identity",
            alt: "Einrichtungsassistent, Schritt Identität",
          },
          {
            id: "server",
            title: "Server-Leiste und mumble://-Links",
            body: "Gespeicherte Server links in der Leiste, hinzufügen per Adresse oder Link, sortieren per Ziehen. Ein mumble://-Link aus dem Browser öffnet Mumcord und springt direkt in den Kanal.",
            shot: "dialog-add-server",
            alt: "Dialog „Server hinzufügen“",
          },
          {
            id: "zertifikate",
            title: "Zertifikate, die man versteht",
            body: "Beim ersten Kontakt zeigt Mumcord den Fingerabdruck des Servers und merkt ihn sich. Ändert er sich später, gibt es eine deutliche Warnung statt eines stillen Klicks.",
            shot: "dialog-certificate-trust",
            alt: "Dialog zur Zertifikatsprüfung mit Fingerabdruck",
          },
          {
            id: "wiederverbinden",
            title: "Wiederverbinden mit allem",
            body: "Bricht die Verbindung ab, kommst du in denselben Kanal zurück, mit Stumm/Taub-Status und gefolgten Kanälen. Nach einem Neustart bietet Mumcord an, dem letzten Sprachkanal wieder beizutreten.",
            shot: "banner-rejoin",
            alt: "Hinweis zum Wiederbeitreten des letzten Sprachkanals",
          },
        ],
      },
      {
        id: "kanaele",
        title: "Kanäle und Leute",
        features: [
          {
            id: "folgen",
            title: "Kanälen folgen",
            body: "Ein Klick aufs Auge, und du liest einen Kanal mit, ohne drin zu sein. Ungelesenes erscheint als Zähler, auch im eigenen Kanal.",
            shot: "follow-unread-badge",
            alt: "Kanalliste mit Augen-Symbol und Ungelesen-Zählern",
          },
          {
            id: "grosse-server",
            title: "Große Server im Griff",
            body: "Strg+K sucht Kanäle und Leute, „Zu meinem Kanal springen“ bringt dich zurück. Getestet mit 1000 Leuten in 305 Kanälen bei flüssigen 60 fps.",
            shot: "search",
            alt: "Suche nach Kanälen und Leuten mit Strg+K",
          },
          {
            id: "avatare",
            title: "Wer ist wo",
            body: "Eingeklappte und volle Kanäle zeigen einen Stapel Avatare. Beim Drüberfahren gibt es eine Profilvorschau.",
            shot: "channel-avatar-stack",
            alt: "Kanalbaum mit Avatar-Stapeln",
          },
          {
            id: "rechtsklick",
            title: "Rechtsklick auf Leute",
            body: "Profil ansehen, nur für dich stummschalten, Lautstärke von 0 bis 200 % oder eine private Nachricht schreiben. Mumcord merkt sich das pro Person.",
            shot: "context-menu",
            alt: "Kontextmenü einer Person mit Lautstärkeregler",
          },
        ],
      },
      {
        id: "chat",
        title: "Chat",
        features: [
          {
            id: "chat-stil",
            title: "Chat im Discord-Stil",
            body: "Avatare, gruppierte Nachrichten, Markdown und eingefügte Bilder. Kanalbeschreibung und Willkommensnachricht sind oben angeheftet.",
            shot: "main-dark",
            alt: "Hauptfenster mit Chat, Kanalliste und Mitgliederliste",
          },
          {
            id: "kompakt",
            title: "Kompakt für volle Kanäle",
            body: "Eine Zeile pro Nachricht mit Uhrzeit und Name, wenn viel los ist.",
            shot: "chat-compact",
            alt: "Chat im kompakten Layout",
          },
          {
            id: "vorschauen",
            title: "Links, Videos und Bilder im Chat",
            body: "Link-Vorschauen, Karten für YouTube, Twitch und Spotify, die erst beim Klick laden, und externe Bilder direkt in der Nachricht. Ein Klick öffnet den Bildbetrachter mit Zoom. Alles abschaltbar, nie von Adressen im lokalen Netz.",
            since: "0.2.0",
          },
          {
            id: "erwaehnungen",
            title: "@Erwähnungen, Code und Formatierung",
            body: "@ vervollständigt Namen, Erwähnungen werden hervorgehoben und haben einen eigenen Ton. Code-Blöcke mit Syntax-Hervorhebung, eine Formatierungsleiste und Kürzel wie Strg+B.",
            since: "0.2.0",
          },
          {
            id: "gifs",
            title: "GIF-Favoriten",
            body: "Links zu Giphy und Tenor spielen direkt ab. Per Rechtsklick als Favorit speichern und über den GIF-Knopf wieder senden.",
            since: "0.2.0",
          },
          {
            id: "benachrichtigungen",
            title: "Benachrichtigungen, wie du willst",
            body: "Neue Nachrichten als Pop-up in der App, als Systembenachrichtigung, beides oder gar nicht. Dazu kurze, leise Töne pro Ereignis.",
            shot: "notification-toast",
            alt: "Pop-up einer neuen Nachricht in der App",
          },
        ],
      },
      {
        id: "sprache",
        title: "Sprache und Audio",
        features: [
          {
            id: "push-to-talk",
            title: "Push-to-Talk überall",
            body: "Tasten und Maustasten, auch wenn ein Spiel im Vordergrund läuft. Unter Wayland über das Shortcut-Portal oder im Kompatibilitätsmodus wie bei TeamSpeak. Oder Sprachaktivierung, auf Wunsch mit eigener Schwelle.",
            shot: "settings-03-voice-dark",
            alt: "Einstellungen, Bereich Sprache mit Push-to-Talk",
          },
          {
            id: "klang",
            title: "Klarer Klang von Haus aus",
            body: "KI-Rauschunterdrückung, Echounterdrückung und automatische Verstärkung sind an. Geräte wechseln ohne neu zu verbinden, Mikrofontest mit der eigenen Stimme.",
            shot: "settings-02-audio-dark",
            alt: "Einstellungen, Bereich Audio",
          },
          {
            id: "musik",
            title: "Musikqualität",
            body: "Ein Schalter hebt die Bitrate bis zum Limit des Servers, höchstens 510 kbit/s, und stimmt den Encoder auf Musik ab.",
            since: "0.1.1",
          },
          {
            id: "laeuft-gerade",
            title: "Läuft gerade",
            body: "Wenn du willst, sehen andere Mumcord-Nutzer, welche Musik du hörst, mit Cover und Fortschritt. Unter Linux und Windows.",
            since: "0.2.0",
          },
        ],
      },
      {
        id: "komfort",
        title: "Komfort",
        features: [
          {
            id: "design",
            title: "Hell und dunkel",
            body: "Folgt dem System oder deiner Wahl.",
            shot: "main-light",
            alt: "Hauptfenster im hellen Design",
          },
          {
            id: "toene",
            title: "Töne und Benachrichtigungen",
            body: "Jedes Ereignis einzeln schaltbar: Beitreten, Auflegen, Nachrichten, Erwähnungen.",
            shot: "settings-07-sounds-notifications-dark",
            alt: "Einstellungen, Bereich Töne und Benachrichtigungen",
          },
          {
            id: "sprachen",
            title: "Deutsch, Englisch, Spanisch",
            body: "Umschalten ohne Neustart. Tray-Symbol, Start beim Anmelden und Bedienung per Tastatur und Screenreader gehören dazu.",
            shot: "settings-06-language-dark",
            alt: "Einstellungen, Bereich Sprache der Oberfläche",
          },
          {
            id: "privatsphaere",
            title: "Keine Telemetrie",
            body: "Die Identität liegt im sicheren Speicher des Systems. Die Diagnosedatei enthält keine Chatinhalte oder Passwörter und verlässt deinen Rechner nur, wenn du sie selbst verschickst.",
          },
        ],
      },
    ],
  },
  en: {
    title: "Features",
    description:
      "Every Mumcord feature with screenshots: servers and certificates, following channels, chat with previews and @mentions, push-to-talk, audio and comfort.",
    label: "What Mumcord does",
    intro:
      "Everything in the current version, with a picture where there is one. What's still coming is on the roadmap. Missing something or something broken? Tell us on GitHub.",
    contents: "Contents",
    newIn: "new in",
    zoom: "Open the screenshot at full size",
    askTitle: "Missing something? Something broken?",
    askBody:
      "Ideas and bugs are collected in the issues on GitHub. You need a free GitHub account; the templates only ask for what actually helps.",
    idea: "Request a feature",
    bug: "Report a bug",
    bugNote: "Please don't report security problems publicly; email tobias@vorwachs.com instead.",
    groups: [
      {
        id: "connecting",
        title: "Connecting",
        features: [
          {
            id: "setup",
            title: "Set up in a minute",
            body: "On first start Mumcord asks for three things only: your name and identity, the microphone with a level test, and how you want to talk. Existing Mumble identities can be imported as PKCS#12.",
            shot: "wizard-1-identity",
            alt: "Setup wizard, identity step",
          },
          {
            id: "servers",
            title: "Server bar and mumble:// links",
            body: "Saved servers in the bar on the left, added by address or link, reordered by dragging. A mumble:// link from the browser opens Mumcord and jumps straight into the channel.",
            shot: "dialog-add-server",
            alt: "“Add server” dialog",
          },
          {
            id: "certificates",
            title: "Certificates that make sense",
            body: "On first contact Mumcord shows the server's fingerprint and remembers it. If it changes later, you get a clear warning instead of a silent click-through.",
            shot: "dialog-certificate-trust",
            alt: "Certificate trust dialog with fingerprint",
          },
          {
            id: "reconnect",
            title: "Reconnect with everything",
            body: "If the connection drops, you're back in the same channel with your mute/deafen state and followed channels. After a restart Mumcord offers to rejoin your last voice channel.",
            shot: "banner-rejoin",
            alt: "Banner offering to rejoin the last voice channel",
          },
        ],
      },
      {
        id: "channels",
        title: "Channels and people",
        features: [
          {
            id: "follow",
            title: "Follow channels",
            body: "One click on the eye and you read along in a channel without being in it. Unread messages show as a count, in your own channel too.",
            shot: "follow-unread-badge",
            alt: "Channel list with eye icons and unread counts",
          },
          {
            id: "big-servers",
            title: "Big servers under control",
            body: "Ctrl+K searches channels and people, “Jump to my channel” brings you back. Tested with 1000 people in 305 channels at a smooth 60 fps.",
            shot: "search",
            alt: "Ctrl+K search for channels and people",
          },
          {
            id: "avatars",
            title: "Who is where",
            body: "Collapsed and crowded channels show a stack of avatars. Hover for a profile preview.",
            shot: "channel-avatar-stack",
            alt: "Channel tree with avatar stacks",
          },
          {
            id: "right-click",
            title: "Right-click people",
            body: "See the profile, mute just for you, set the volume from 0 to 200 % or send a private message. Mumcord remembers it per person.",
            shot: "context-menu",
            alt: "Context menu of a person with a volume slider",
          },
        ],
      },
      {
        id: "chat",
        title: "Chat",
        features: [
          {
            id: "chat-style",
            title: "Discord-style chat",
            body: "Avatars, grouped messages, Markdown and pasted images. The channel description and welcome message are pinned on top.",
            shot: "main-dark",
            alt: "Main window with chat, channel list and member list",
          },
          {
            id: "compact",
            title: "Compact for busy channels",
            body: "One line per message with time and name when a lot is going on.",
            shot: "chat-compact",
            alt: "Chat in the compact layout",
          },
          {
            id: "previews",
            title: "Links, videos and images in the chat",
            body: "Link previews, YouTube, Twitch and Spotify cards that load only on click, and external images right in the message. A click opens the image viewer with zoom. All of it can be switched off and never loads from local network addresses.",
            since: "0.2.0",
          },
          {
            id: "mentions",
            title: "@mentions, code and formatting",
            body: "@ completes names, mentions are highlighted and have their own sound. Code blocks with syntax highlighting, a formatting toolbar and shortcuts like Ctrl+B.",
            since: "0.2.0",
          },
          {
            id: "gifs",
            title: "GIF favorites",
            body: "Giphy and Tenor links play inline. Save them as favorites by right-click and send them again from the GIF button.",
            since: "0.2.0",
          },
          {
            id: "notifications",
            title: "Notifications your way",
            body: "New messages as an in-app pop-up, a system notification, both or none. Plus short, quiet sounds per event.",
            shot: "notification-toast",
            alt: "In-app pop-up for a new message",
          },
        ],
      },
      {
        id: "voice",
        title: "Voice and audio",
        features: [
          {
            id: "push-to-talk",
            title: "Push-to-talk everywhere",
            body: "Keys and mouse buttons, even with a game in the foreground. On Wayland via the shortcuts portal or in a TeamSpeak-like compatibility mode. Or voice activation, with your own threshold if you like.",
            shot: "settings-03-voice-dark",
            alt: "Settings, voice section with push-to-talk",
          },
          {
            id: "sound",
            title: "Clear sound out of the box",
            body: "AI noise suppression, echo cancellation and automatic gain are on. Switch devices without reconnecting, test your microphone with your own voice.",
            shot: "settings-02-audio-dark",
            alt: "Settings, audio section",
          },
          {
            id: "music",
            title: "Music quality",
            body: "One switch raises the bitrate up to the server's limit, at most 510 kbit/s, and tunes the encoder for music.",
            since: "0.1.1",
          },
          {
            id: "now-playing",
            title: "Now playing",
            body: "If you like, other Mumcord users see what music you're listening to, with cover and progress. On Linux and Windows.",
            since: "0.2.0",
          },
        ],
      },
      {
        id: "comfort",
        title: "Comfort",
        features: [
          {
            id: "themes",
            title: "Light and dark",
            body: "Follows your system or your choice.",
            shot: "main-light",
            alt: "Main window in the light theme",
          },
          {
            id: "sounds",
            title: "Sounds and notifications",
            body: "Every event can be switched on its own: joining, leaving, messages, mentions.",
            shot: "settings-07-sounds-notifications-dark",
            alt: "Settings, sounds and notifications section",
          },
          {
            id: "languages",
            title: "English, German, Spanish",
            body: "Switch without restarting. A tray icon, start at login and full keyboard and screen reader use come with it.",
            shot: "settings-06-language-dark",
            alt: "Settings, interface language section",
          },
          {
            id: "privacy",
            title: "No telemetry",
            body: "Your identity lives in the system's secure storage. The diagnostic file contains no chat contents or passwords and only leaves your computer if you send it yourself.",
          },
        ],
      },
    ],
  },
};
