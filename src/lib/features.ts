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
            shot: "person-menu",
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
            title: "Link-Vorschauen",
            body: "Links bekommen eine Karte mit Titel, Beschreibung und Bild. Mumcord lädt sie selbst, nie von Adressen im lokalen Netz; jede Karte lässt sich wegklicken, und die Funktion ist im Wizard und in den Einstellungen abschaltbar.",
            shot: "chat-link-preview",
            alt: "Chat mit einer Link-Vorschau",
            since: "0.2.0",
          },
          {
            id: "videos",
            title: "YouTube und Twitch",
            body: "Video-Links werden zu einer Karte mit Vorschaubild. Der Player lädt erst, wenn du auf Play klickst.",
            shot: "chat-youtube",
            alt: "Chat mit einer YouTube-Karte",
            since: "0.2.0",
          },
          {
            id: "spotify",
            title: "Spotify",
            body: "Auch Spotify-Links bekommen eine Karte mit Cover, Titel und Künstler, der Player kommt erst beim Klick.",
            shot: "chat-spotify",
            alt: "Chat mit einer Spotify-Karte",
            since: "0.2.0",
          },
          {
            id: "bilder",
            title: "Bilder und GIFs im Chat",
            body: "Externe Bilder und Bildlinks erscheinen direkt in der Nachricht, GIFs von Giphy und Tenor spielen ab und zeigen ihre Quelle.",
            shot: "chat-images",
            alt: "Chat mit einem Bild und einem GIF",
            since: "0.2.0",
          },
          {
            id: "bildbetrachter",
            title: "Bildbetrachter",
            body: "Ein Klick auf ein Bild öffnet es groß: zoomen mit Mausrad oder Tasten, verschieben, mit den Pfeiltasten durch alle Bilder des Chats und „Bild speichern“.",
            shot: "image-viewer",
            alt: "Bildbetrachter mit Zoom-Leiste",
            since: "0.2.0",
          },
          {
            id: "erwaehnungen",
            title: "@Erwähnungen",
            body: "Tipp @ und Mumcord schlägt Namen vor. Erwähnungen werden hervorgehoben, benachrichtigen auch in stillen Kanälen und haben einen eigenen Ton.",
            shot: "mention-autocomplete",
            alt: "Eingabefeld mit Namensvorschlag nach @",
            since: "0.2.0",
          },
          {
            id: "code",
            title: "Code und Formatierung",
            body: "Code-Blöcke mit Syntax-Hervorhebung, eine Formatierungsleiste über dem Eingabefeld und Kürzel wie Strg+B, Strg+I oder Strg+E.",
            shot: "chat-code-toolbar",
            alt: "Chat mit hervorgehobenem Code und Formatierungsleiste",
            since: "0.2.0",
          },
          {
            id: "gifs",
            title: "GIF-Favoriten",
            body: "Jedes GIF im Chat per Rechtsklick als Favorit speichern und über den GIF-Knopf wieder senden. Eine GIF-Suche gibt es bewusst nicht: Dafür müsste ein API-Schlüssel in die App.",
            shot: "gif-picker",
            alt: "Auswahl der GIF-Favoriten",
            since: "0.2.0",
          },
          {
            id: "benachrichtigungen",
            title: "Benachrichtigungen, wie du willst",
            body: "Neue Nachrichten als Pop-up in der App, als Systembenachrichtigung, beides oder gar nicht. Dazu kurze, leise Töne pro Ereignis.",
            shot: "notification-toast",
            alt: "Pop-up einer neuen Nachricht in der App",
          },
          {
            id: "aufraeumen",
            title: "Räumt selbst auf",
            body: "Vorschauen und Bilder werden nach einstellbaren Tagen gelöscht, auf Wunsch auch alte Chatverläufe. Der Verlauf liegt nur auf deinem Rechner und lässt sich pro Server abschalten.",
            shot: "settings-04-chat-history-dark",
            alt: "Einstellungen, Bereich Chat und Verlauf",
            since: "0.2.0",
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
            body: "Tasten und Maustasten, auch wenn ein Spiel im Vordergrund läuft. Unter Wayland über das Shortcut-Portal oder im Kompatibilitätsmodus wie bei TeamSpeak.",
            shot: "wizard-3-talk-mode",
            alt: "Einrichtungsassistent, Schritt Sprechmodus",
          },
          {
            id: "schwelle",
            title: "Sprachaktivierung mit eigener Schwelle",
            body: "Automatisch oder von Hand: Ein Regler über der Live-Pegelanzeige legt fest, ab wann Mumcord sendet. Eine kurze Haltezeit schneidet keine Wortenden ab.",
            shot: "settings-03-voice-dark",
            alt: "Einstellungen, Bereich Sprache mit manueller Schwelle",
            since: "0.2.0",
          },
          {
            id: "klang",
            title: "Klarer Klang von Haus aus",
            body: "KI-Rauschunterdrückung, Echounterdrückung und automatische Verstärkung sind an. Geräte wechseln ohne neu zu verbinden, Mikrofontest mit der eigenen Stimme.",
            shot: "wizard-2-microphone",
            alt: "Einrichtungsassistent, Schritt Mikrofon mit Pegeltest",
          },
          {
            id: "musik",
            title: "Musikqualität",
            body: "Ein Schalter hebt die Bitrate bis zum Limit des Servers, höchstens 510 kbit/s, stimmt den Encoder auf Musik ab und schaltet Rauschunterdrückung und automatische Lautstärke ab.",
            shot: "settings-02-audio-dark",
            alt: "Einstellungen, Bereich Audio mit dem Schalter Musikqualität",
            since: "0.1.1",
          },
          {
            id: "laeuft-gerade",
            title: "Läuft gerade",
            body: "Wenn du willst, sehen andere Mumcord-Nutzer, welche Musik du hörst, mit Cover und Fortschritt. Unter Linux und Windows.",
            shot: "profile-preview",
            alt: "Profilkarte mit „Listening to“ und Fortschrittsbalken",
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
            shot: "person-menu",
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
            title: "Link previews",
            body: "Links get a card with title, description and image. Mumcord fetches them itself, never from local network addresses; every card can be dismissed, and the feature can be switched off in the wizard and in settings.",
            shot: "chat-link-preview",
            alt: "Chat with a link preview",
            since: "0.2.0",
          },
          {
            id: "videos",
            title: "YouTube and Twitch",
            body: "Video links turn into a card with a thumbnail. The player loads only when you click play.",
            shot: "chat-youtube",
            alt: "Chat with a YouTube card",
            since: "0.2.0",
          },
          {
            id: "spotify",
            title: "Spotify",
            body: "Spotify links get a card too, with cover, title and artist; the player comes only on click.",
            shot: "chat-spotify",
            alt: "Chat with a Spotify card",
            since: "0.2.0",
          },
          {
            id: "images",
            title: "Images and GIFs in the chat",
            body: "External images and image links show right in the message, Giphy and Tenor GIFs play and credit their source.",
            shot: "chat-images",
            alt: "Chat with an image and a GIF",
            since: "0.2.0",
          },
          {
            id: "image-viewer",
            title: "Image viewer",
            body: "Click an image to see it large: zoom with the wheel or keys, pan, arrow keys through all images of the chat and “Save image”.",
            shot: "image-viewer",
            alt: "Image viewer with zoom toolbar",
            since: "0.2.0",
          },
          {
            id: "mentions",
            title: "@mentions",
            body: "Type @ and Mumcord suggests names. Mentions are highlighted, notify you even in quiet channels and have their own sound.",
            shot: "mention-autocomplete",
            alt: "Message input with a name suggestion after @",
            since: "0.2.0",
          },
          {
            id: "code",
            title: "Code and formatting",
            body: "Code blocks with syntax highlighting, a formatting toolbar above the input and shortcuts like Ctrl+B, Ctrl+I or Ctrl+E.",
            shot: "chat-code-toolbar",
            alt: "Chat with highlighted code and the formatting toolbar",
            since: "0.2.0",
          },
          {
            id: "gifs",
            title: "GIF favorites",
            body: "Save any GIF in the chat as a favorite by right-click and send it again from the GIF button. There is no GIF search on purpose: it would need an API key inside the app.",
            shot: "gif-picker",
            alt: "GIF favorites picker",
            since: "0.2.0",
          },
          {
            id: "notifications",
            title: "Notifications your way",
            body: "New messages as an in-app pop-up, a system notification, both or none. Plus short, quiet sounds per event.",
            shot: "notification-toast",
            alt: "In-app pop-up for a new message",
          },
          {
            id: "clean-up",
            title: "Cleans up after itself",
            body: "Previews and images are deleted after a number of days you choose, old chat history too if you like. History lives only on your computer and can be switched off per server.",
            shot: "settings-04-chat-history-dark",
            alt: "Settings, chat and history section",
            since: "0.2.0",
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
            body: "Keys and mouse buttons, even with a game in the foreground. On Wayland via the shortcuts portal or in a TeamSpeak-like compatibility mode.",
            shot: "wizard-3-talk-mode",
            alt: "Setup wizard, talk mode step",
          },
          {
            id: "threshold",
            title: "Voice activation with your own threshold",
            body: "Automatic or by hand: a slider over the live level meter sets when Mumcord starts sending. A short hold keeps word endings intact.",
            shot: "settings-03-voice-dark",
            alt: "Settings, voice section with a manual threshold",
            since: "0.2.0",
          },
          {
            id: "sound",
            title: "Clear sound out of the box",
            body: "AI noise suppression, echo cancellation and automatic gain are on. Switch devices without reconnecting, test your microphone with your own voice.",
            shot: "wizard-2-microphone",
            alt: "Setup wizard, microphone step with level test",
          },
          {
            id: "music",
            title: "Music quality",
            body: "One switch raises the bitrate up to the server's limit, at most 510 kbit/s, tunes the encoder for music and turns off noise suppression and automatic gain.",
            shot: "settings-02-audio-dark",
            alt: "Settings, audio section with the music quality switch",
            since: "0.1.1",
          },
          {
            id: "now-playing",
            title: "Now playing",
            body: "If you like, other Mumcord users see what music you're listening to, with cover and progress. On Linux and Windows.",
            shot: "profile-preview",
            alt: "Profile card with “Listening to” and a progress bar",
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
